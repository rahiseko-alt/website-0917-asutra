import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {projects} from './content';

// A fixed lens-shaped field: opposite edges expand/contract rather than
// translating together. CPU hit regions and the floor use the same field.
function surface(x,y,z=0,speed=0){
 const phase=(x+1.4)*.62,wave=Math.cos(phase),s=Math.max(-2,Math.min(2,speed));
 return [x+.25*Math.sin(phase),y*(.995+.185*wave+.045*Math.abs(s)*wave)+.08*(1-wave)+s*.035*Math.sin(phase),z+.12+.18*wave];
}
function floorPoint(x,y,z){
 const p=surface(x,y,z),falloff=Math.exp(-Math.max(0,z)*.55);
 return [x+(p[0]-x)*falloff,y+(p[1]-y)*falloff,p[2]];
}
// Shared continuous surface: lighting samples the same shape as the geometry.
// The interaction envelope is zero at all four edges, preserving hit regions.
const surfaceGLSL=`
uniform float speed, hoverAmount, pulseAge;
uniform vec2 pulseOrigin;
vec3 cardSurface(vec3 basePoint, vec2 uv){
 float phase=(basePoint.x+1.4)*.62,wave=cos(phase),s=clamp(speed,-2.,2.);
 vec3 p=vec3(basePoint.x+.25*sin(phase),basePoint.y*(.995+.185*wave+.045*abs(s)*wave)+.08*(1.-wave)+s*.035*sin(phase),basePoint.z+.12+.18*wave);
 vec2 q=uv*2.-1.;
 float envelope=max(0.,(1.-q.x*q.x)*(1.-q.y*q.y));
 p.z-=hoverAmount*.30*envelope;
 if(pulseAge>=0. && pulseAge<1.25){
  float r=length((uv-pulseOrigin)*vec2(5.65,3.33));
  float front=r-pulseAge*6.5;
  float ring=sin(front*8.)*exp(-front*front*3.5);
  p.z+=ring*.13*exp(-pulseAge*2.6)*smoothstep(0.,.045,pulseAge)*envelope;
 }
 return p;
}`;
const vertex=`varying vec2 vUv;varying vec3 vFlat;${surfaceGLSL}
void main(){vUv=uv;vFlat=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(cardSurface(vFlat,uv),1.);}`;
const fragment=`uniform sampler2D map;varying vec2 vUv;varying vec3 vFlat;${surfaceGLSL}
void main(){
 vec2 q=abs(vUv-.5)-vec2(.478,.467);
 float d=length(max(q,0.))+min(max(q.x,q.y),0.)-.022;
 if(d>0.)discard;
 // Central differences of the continuous function avoid mesh-facet highlights.
 float e=.003;
 vec3 tx=cardSurface(vFlat+vec3(e,0.,0.),vUv+vec2(e/5.65,0.))-cardSurface(vFlat-vec3(e,0.,0.),vUv-vec2(e/5.65,0.));
 vec3 ty=cardSurface(vFlat+vec3(0.,e,0.),vUv+vec2(0.,e/3.33))-cardSurface(vFlat-vec3(0.,e,0.),vUv-vec2(0.,e/3.33));
 vec3 n=normalize(cross(tx,ty));
 vec3 p=cardSurface(vFlat,vUv),v=normalize(cameraPosition-p);
 vec3 light=normalize(vec3(-.42,.55,1.));
 float diffuse=.5+.5*dot(n,light);
 float sheen=pow(max(dot(n,normalize(light+v)),0.),48.);
 float depth=.5-.5*cos((vFlat.x+1.4)*.62);
 vec3 color=texture2D(map,vUv).rgb;
 color*=1.-.10*(1.-diffuse);
 color=mix(color,vec3(.018),.30*depth);
 color+=vec3(.19)*sheen;
 gl_FragColor=vec4(color,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
}`;

// Captions and art are rendered into the same surface, so they never drift apart.
function paint(ctx,img,detail,p,time,hover){
 const w=ctx.canvas.width,h=ctx.canvas.height;ctx.fillStyle='#171717';ctx.fillRect(0,0,w,h);
 if(img.complete&&img.naturalWidth){const s=Math.max(w/img.width,h/img.height)*1.035,iw=img.width*s,ih=img.height*s;ctx.drawImage(img,(w-iw)/2+Math.sin(time*.13)*9,(h-ih)/2,iw,ih);}
 if(detail.complete&&detail.naturalWidth){const phase=time%14;const alpha=Math.max(0,Math.min(1,(phase-5)/1.2,(14-phase)/1.2));const ds=Math.max(w/detail.width,h/detail.height)*(1.04+.02*Math.sin(time*.2));ctx.globalAlpha=alpha;ctx.drawImage(detail,(w-detail.width*ds)/2,(h-detail.height*ds)/2,detail.width*ds,detail.height*ds);ctx.globalAlpha=1;}const shade=ctx.createLinearGradient(0,h*.55,0,h);shade.addColorStop(0,'transparent');shade.addColorStop(1,'rgba(0,0,0,.64)');ctx.fillStyle=shade;ctx.fillRect(0,h*.55,w,h*.45);
 ctx.font='500 26px Inter Variable, Arial';ctx.fillStyle='#fff';ctx.fillText(p.title,27,h-29);ctx.beginPath();ctx.arc(w-39,h-37,20,0,Math.PI*2);ctx.fillStyle=hover?'#fff':'#080808';ctx.fill();ctx.font='22px Arial';ctx.textAlign='center';ctx.fillStyle=hover?'#111':'#fff';ctx.fillText('↗',w-39,h-30);ctx.textAlign='left';
}
export function Gallery({onOpen,paused}){
 const host=useRef(null),status=useRef({paused}),[failed,setFailed]=useState(false);status.current.paused=paused;
 useEffect(()=>{
  const el=host.current;let renderer;try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',preserveDrawingBuffer:true});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0);el.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(.6,.04,12);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,gap=5.78,width=5.65,height=3.33,total=gap*projects.length,geo=new THREE.PlaneGeometry(width,height,96,48),cards=[];
  let frame,stopped=false,current=gap,target=gap,down=false,lastX=0,startX=0,distance=0,lastAction=0,previous=0,hover=-1,pendingOpen=null;
  [...projects,...projects].forEach((p,j)=>{const i=j%projects.length,copy=Math.floor(j/projects.length);
   const canvas=document.createElement('canvas');canvas.width=1120;canvas.height=660;const ctx=canvas.getContext('2d'),img=new Image();img.src=p.image;const detail=new Image();detail.src=p.detailImage||p.image;
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
   const material=new THREE.ShaderMaterial({uniforms:{map:{value:texture},speed:{value:0},hoverAmount:{value:0},pulseAge:{value:-1},pulseOrigin:{value:new THREE.Vector2(.5,.5)}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide}),mesh=new THREE.Mesh(geo,material);scene.add(mesh);
   const button=document.createElement('button');button.className='canvas-project';button.setAttribute('aria-label',p.title+' — 作品を見る');button.addEventListener('click',e=>{if((e.detail===0||distance<7)&&!status.current.paused){if(pendingOpen)return;const box=button.getBoundingClientRect();if(e.detail===0||reduced){onOpen(i,box);return;}material.uniforms.pulseOrigin.value.set(Math.max(0,Math.min(1,(e.clientX-box.left)/box.width)),Math.max(0,Math.min(1,1-(e.clientY-box.top)/box.height)));material.userData.pulseStart=performance.now();pendingOpen=setTimeout(()=>{pendingOpen=null;if(!stopped&&!status.current.paused)onOpen(i,box);},240);}});button.addEventListener('pointerenter',()=>{hover=i;});button.addEventListener('pointerleave',()=>{hover=-1;});button.addEventListener('focus',()=>{if(!down){target=current+(((i*gap-current+total/2)%total+total)%total-total/2);lastAction=performance.now();}});el.append(button);cards.push({mesh,button,texture,ctx,img,detail,p,i,copy,lastPaint:-100,lastHover:false});
  });
  const pts=[];for(let a=-30;a<=30;a+=1)for(let z=10;z>-50;z-=.6)pts.push(...floorPoint(a,-height/2,z),...floorPoint(a,-height/2,z-.6));
  for(let z=10;z>-50;z-=1)for(let x=-30;x<30;x+=.25)pts.push(...floorPoint(x,-height/2,z),...floorPoint(x+.25,-height/2,z));
  const gridGeo=new THREE.BufferGeometry();gridGeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));const gridMat=new THREE.LineBasicMaterial({color:0x272727,transparent:true,opacity:.66});scene.add(new THREE.LineSegments(gridGeo,gridMat));scene.fog=new THREE.Fog(0,11,32);
  const resize=()=>{renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();};resize();const observer=new ResizeObserver(resize);observer.observe(el);
  const cancelOpen=()=>{clearTimeout(pendingOpen);pendingOpen=null;};
  const wheel=e=>{if(status.current.paused)return;cancelOpen();e.preventDefault();target-=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*.0045;lastAction=performance.now();};
  const pointerdown=e=>{if(status.current.paused||e.button!==0)return;cancelOpen();down=true;startX=lastX=e.clientX;distance=0;el.classList.add('dragging');};const move=e=>{if(!down)return;target-=(e.clientX-lastX)*.016;lastX=e.clientX;distance=Math.abs(e.clientX-startX);lastAction=performance.now();};const up=()=>{down=false;el.classList.remove('dragging');};
  const key=e=>{if(e.key==='Escape')cancelOpen();if(status.current.paused||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();target+=(e.key==='ArrowRight'?1:-1)*gap;lastAction=performance.now();};el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('pointerdown',pointerdown);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('keydown',key);
  const pos=new THREE.Vector3();const tick=time=>{if(stopped)return;frame=requestAnimationFrame(tick);const dt=Math.min((time-previous)/1000||.016,.05);previous=time;if(document.hidden)return;const speed=target-current;current+=speed*(reduced?1:1-Math.exp(-8*dt));
   for(const c of cards){let x=((c.i*gap-current+total/2)%total+total)%total-total/2;if(c.copy)x+=x<0?total:-total;c.mesh.visible=Math.abs(x)<camera.aspect*3.8+width;c.button.hidden=!c.mesh.visible;if(!c.mesh.visible){c.button.style.display="none";continue;}c.mesh.position.x=x;c.mesh.rotation.y=0;c.mesh.material.uniforms.speed.value=reduced?0:Math.max(-2,Math.min(2,speed));const u=c.mesh.material.uniforms;u.hoverAmount.value+=((hover===c.i&&!status.current.paused?1:0)-u.hoverAmount.value)*(1-Math.exp(-10*dt));u.pulseAge.value=c.mesh.material.userData.pulseStart===undefined?-1:(time-c.mesh.material.userData.pulseStart)/1000;if(time-c.lastPaint>40||c.lastHover!==(hover===c.i)){paint(c.ctx,c.img,c.detail,c.p,reduced?0:time/1000+c.i*3.7,hover===c.i);c.texture.needsUpdate=true;c.lastPaint=time;c.lastHover=hover===c.i;}const outline=[];for(let k=0;k<=16;k++){pos.set(...surface(x-width/2+width*k/16,height/2,0,reduced?0:speed)).project(camera);outline.push([(pos.x*.5+.5)*el.clientWidth,(-pos.y*.5+.5)*el.clientHeight]);}for(let k=16;k>=0;k--){pos.set(...surface(x-width/2+width*k/16,-height/2,0,reduced?0:speed)).project(camera);outline.push([(pos.x*.5+.5)*el.clientWidth,(-pos.y*.5+.5)*el.clientHeight]);}const left=Math.min(...outline.map(p=>p[0])),top=Math.min(...outline.map(p=>p[1])),pw=Math.max(...outline.map(p=>p[0]))-left,ph=Math.max(...outline.map(p=>p[1]))-top;c.button.style.cssText=`width:${pw}px;height:${ph}px;transform:translate3d(${left}px,${top}px,0);clip-path:polygon(${outline.map(p=>`${(p[0]-left)/pw*100}% ${(p[1]-top)/ph*100}%`).join(",")})`;c.button.tabIndex=Math.abs(x)<gap*.6?0:-1;}renderer.render(scene,camera);};frame=requestAnimationFrame(tick);
  return()=>{stopped=true;cancelOpen();cancelAnimationFrame(frame);observer.disconnect();el.removeEventListener('wheel',wheel);el.removeEventListener('pointerdown',pointerdown);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',key);cards.forEach(c=>{c.button.remove();c.texture.dispose();c.mesh.material.dispose();});geo.dispose();gridGeo.dispose();gridMat.dispose();renderer.dispose();renderer.domElement.remove();};
 },[onOpen]);
 return <div className="gallery" ref={host} aria-label="作品ギャラリー。スクロール、ドラッグ、左右矢印キーで移動">{failed&&projects.map((p,i)=><button key={p.id} className="mobile-card" onClick={()=>onOpen(i)}><img src={p.image} alt={p.title}/></button>)}</div>;
}
export function Portal(){
 const host=useRef(null);
 useEffect(()=>{
  const el=host.current;let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{return;}renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;el.append(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,30);camera.position.z=5.2;const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.03);scene.environment=environment.texture;room.dispose();
  const source=document.querySelector('.gallery canvas');
  const backdropTexture=source?new THREE.CanvasTexture(source):null;
  if(backdropTexture)backdropTexture.colorSpace=THREE.SRGBColorSpace;
  const lensGeo=new THREE.PlaneGeometry(8,8),lensMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{map:{value:backdropTexture},size:{value:new THREE.Vector2(720,720)},screen:{value:new THREE.Vector2(innerWidth,innerHeight)},offset:{value:new THREE.Vector2(0,0)},enabled:{value:source?1:0}},vertexShader:'void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform sampler2D map;uniform vec2 size;uniform vec2 screen;uniform vec2 offset;uniform float enabled;void main(){vec2 uv=gl_FragCoord.xy/size;vec2 p=uv-.5;float r=length(p);float band=smoothstep(.33,.37,r)*(1.-smoothstep(.43,.49,r))*enabled;vec2 warped=uv+normalize(p+vec2(.0001))*sin((r-.33)*19.)*.035*band;vec2 sampleUV=(warped*size+offset)/screen;vec3 c=texture2D(map,sampleUV).rgb;gl_FragColor=vec4(c*.8,band);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});
  const lens=new THREE.Mesh(lensGeo,lensMat);lens.position.z=-.25;scene.add(lens);
  let disposed=false,artEnvironment;
  const art=new THREE.TextureLoader().load(projects[1].image,texture=>{if(disposed){texture.dispose();return;}const envCanvas=document.createElement('canvas');envCanvas.width=1024;envCanvas.height=512;const envContext=envCanvas.getContext('2d');envContext.filter='saturate(.28) brightness(1.65)';envContext.drawImage(texture.image,0,0,1024,512);const envTexture=new THREE.CanvasTexture(envCanvas);envTexture.mapping=THREE.EquirectangularReflectionMapping;envTexture.colorSpace=THREE.SRGBColorSpace;artEnvironment=pmrem.fromEquirectangular(envTexture);envTexture.dispose();scene.environment=artEnvironment.texture;});
  const group=new THREE.Group();scene.add(group);const geometry=new THREE.TorusGeometry(1.49,.16,48,220),material=new THREE.MeshPhysicalMaterial({color:0xe9edf4,metalness:1,roughness:.08,clearcoat:1,clearcoatRoughness:.04,iridescence:1,iridescenceIOR:1.42,iridescenceThicknessRange:[180,520],envMapIntensity:1.5});group.add(new THREE.Mesh(geometry,material));
  const edgeGeo=new THREE.TorusGeometry(1.49,.172,32,220),edgeMat=new THREE.MeshPhysicalMaterial({color:0xe8e3e0,metalness:1,roughness:.08,transparent:true,opacity:.28,iridescence:1}),edge=new THREE.Mesh(edgeGeo,edgeMat);edge.position.z=-.09;group.add(edge);
  const blackMat=new THREE.MeshPhysicalMaterial({color:0x030304,metalness:.15,roughness:.23,clearcoat:1,envMapIntensity:.5}),objectGeo=new THREE.TorusKnotGeometry(.1,.055,70,12),objects=[];for(let i=0;i<5;i++){const mesh=new THREE.Mesh(objectGeo,blackMat);mesh.scale.setScalar(.7+i*.13);scene.add(mesh);objects.push(mesh);}
  scene.add(new THREE.HemisphereLight(0xf8e1bd,0x10131e,2));const light=new THREE.PointLight(0xffcf83,25);light.position.set(-3,3,4);scene.add(light);
  let frame,previous=0,mx=0,my=0,rx=0,ry=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;const pointer=e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;};window.addEventListener('pointermove',pointer);const resize=()=>{renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();};resize();const observer=new ResizeObserver(resize);observer.observe(el);
  const loop=t=>{frame=requestAnimationFrame(loop);const dt=Math.min((t-previous)/1000||.016,.05);previous=t;if(document.hidden)return;const f=1-Math.exp(-5*dt);rx+=(mx-rx)*f;ry+=(my-ry)*f;group.rotation.set(reduced?0:ry*.1,reduced?0:rx*.15,-.08);const time=reduced?0:t*.00015;objects.forEach((m,i)=>{const a=time+i*1.256;m.position.set(Math.cos(a)*(.96+i*.03),Math.sin(a)*1.04,.12+Math.sin(a*1.7)*.15);m.rotation.set(a*2,a*3,a);});if(backdropTexture){backdropTexture.needsUpdate=true;const dpr=renderer.getPixelRatio(),rect=el.getBoundingClientRect();lensMat.uniforms.size.value.set(rect.width*dpr,rect.height*dpr);lensMat.uniforms.screen.value.set(innerWidth*dpr,innerHeight*dpr);lensMat.uniforms.offset.value.set(rect.left*dpr,(innerHeight-rect.bottom)*dpr);}renderer.render(scene,camera);};frame=requestAnimationFrame(loop);
  return()=>{disposed=true;cancelAnimationFrame(frame);window.removeEventListener('pointermove',pointer);observer.disconnect();geometry.dispose();edgeGeo.dispose();objectGeo.dispose();lensGeo.dispose();lensMat.dispose();backdropTexture?.dispose();material.dispose();edgeMat.dispose();blackMat.dispose();art.dispose();artEnvironment?.dispose();environment.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);return <div className="portal" ref={host} aria-hidden="true"/>;
}










