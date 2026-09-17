import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {projects} from './content';
const vertex=`varying vec2 vUv; uniform float uSpeed; uniform float uPhase;
void main(){vUv=uv;vec3 p=position;p.z+=sin(uv.x*3.14159)*.22;p.y+=sin(uv.x*6.283+uPhase)*(.18+min(abs(uSpeed)*.04,.15));p.z+=sin(uv.x*3.14159)*uSpeed*.07;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`;
const fragment=`uniform sampler2D uMap;uniform float uRatio;varying vec2 vUv;
void main(){vec2 uv=vUv;float cardRatio=1.5;if(uRatio>cardRatio)uv.x=(uv.x-.5)*cardRatio/uRatio+.5;else uv.y=(uv.y-.5)*uRatio/cardRatio+.5;
vec2 q=abs(vUv-.5)-vec2(.48,.47);float d=length(max(q,0.))+min(max(q.x,q.y),0.)-.02;if(d>0.)discard;
vec4 c=texture2D(uMap,uv);c.rgb*=.91-.36*(1.-smoothstep(0.,.35,vUv.y));gl_FragColor=c;
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`;
export function Gallery({onOpen,paused}){
 const host=useRef(null),state=useRef({paused}),[failed,setFailed]=useState(false);state.current.paused=paused;
 useEffect(()=>{
  const el=host.current;if(!el)return;let renderer;
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch{setFailed(true);return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0);el.prepend(renderer.domElement);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,80);camera.position.z=12;
  const motion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const width=5.7,height=3.8,gap=5.86,total=gap*projects.length;
  const loader=new THREE.TextureLoader(),geometry=new THREE.PlaneGeometry(width,height,48,20),cards=[];
  let stopped=false,frame=0,current=gap,target=gap,dragging=false,lastX=0,startX=0,dragDistance=0,lastInteraction=performance.now();
  const textures=projects.map(p=>loader.load(p.image,t=>{t.colorSpace=THREE.SRGBColorSpace;if(stopped)t.dispose();},undefined,()=>setFailed(true)));
  for(let i=0;i<projects.length;i++){
   const material=new THREE.ShaderMaterial({uniforms:{uMap:{value:textures[i]},uSpeed:{value:0},uPhase:{value:i},uRatio:{value:1.6}},vertexShader:vertex,fragmentShader:fragment,side:THREE.DoubleSide});
   const mesh=new THREE.Mesh(geometry,material);scene.add(mesh);
   const button=document.createElement('button');button.className='canvas-project';button.setAttribute('aria-label',projects[i].title+' — 作品を見る');button.innerHTML='<span>'+projects[i].title+'</span><span class="round-arrow" aria-hidden="true">↗</span>';
   button.addEventListener('click',e=>{if((e.detail===0||dragDistance<8)&&!state.current.paused)onOpen(i);});button.addEventListener('focus',()=>{if(dragging)return;target=Math.round(current/total)*total+i*gap;lastInteraction=performance.now();});el.append(button);cards.push({mesh,button,i});
  }
  const grid=new THREE.GridHelper(100,100,0x252525,0x1d1d1d);grid.position.y=-1.92;grid.position.z=-18;grid.rotation.y=.18;scene.add(grid);scene.fog=new THREE.Fog(0,13,32);
  function resize(){const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();}
  resize();const ro=new ResizeObserver(resize);ro.observe(el);
  const wheel=e=>{if(state.current.paused)return;e.preventDefault();target+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*.009;lastInteraction=performance.now();};
  const down=e=>{if(state.current.paused||e.button!==0)return;dragging=true;lastX=startX=e.clientX;dragDistance=0;el.classList.add('dragging');};
  const move=e=>{if(!dragging)return;target-=(e.clientX-lastX)*.018;lastX=e.clientX;dragDistance=Math.abs(e.clientX-startX);lastInteraction=performance.now();};
  const up=()=>{dragging=false;el.classList.remove('dragging');};
  const key=e=>{if(state.current.paused||['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();target+=(e.key==='ArrowRight'?1:-1)*gap;const next=((Math.round(target/gap)%projects.length)+projects.length)%projects.length;cards[next].button.focus({preventScroll:true});lastInteraction=performance.now();}};
  el.addEventListener('wheel',wheel,{passive:false});el.addEventListener('pointerdown',down);window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('keydown',key);
  const v=new THREE.Vector3();
  function tick(time){if(stopped)return;frame=requestAnimationFrame(tick);if(document.hidden)return;
   const speed=target-current;current+=speed*(motion?1:.075);
   if(!dragging&&performance.now()-lastInteraction>180&&!state.current.paused)target+=(Math.round(target/gap)*gap-target)*.035;
   for(const {mesh,button,i} of cards){let x=((i*gap-current+total/2)%total+total)%total-total/2;mesh.position.x=x;mesh.rotation.y=-x*.027;mesh.material.uniforms.uSpeed.value=motion?0:speed;mesh.material.uniforms.uPhase.value=motion?i:time*.00023+i;
    if(textures[i].image)mesh.material.uniforms.uRatio.value=textures[i].image.width/textures[i].image.height;
    v.set(x,0,0).project(camera);const cx=(v.x*.5+.5)*el.clientWidth,cy=(-v.y*.5+.5)*el.clientHeight;
    const pxh=height/(2*Math.tan(THREE.MathUtils.degToRad(35/2))*12)*el.clientHeight,pxw=pxh*1.5;
    button.style.width=pxw+'px';button.style.height=pxh+'px';button.style.transform=`translate3d(${cx-pxw/2}px,${cy-pxh/2}px,0)`;button.style.visibility=Math.abs(x)>camera.aspect*5+width?'hidden':'visible';button.tabIndex=Math.abs(x)<gap*.6?0:-1;
   }renderer.render(scene,camera);
  }frame=requestAnimationFrame(tick);
  return()=>{stopped=true;cancelAnimationFrame(frame);ro.disconnect();el.removeEventListener('wheel',wheel);el.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('keydown',key);cards.forEach(c=>{c.button.remove();c.mesh.material.dispose();});textures.forEach(t=>t.dispose());geometry.dispose();grid.geometry.dispose();grid.material.dispose();renderer.dispose();renderer.domElement.remove();};
 },[onOpen]);
 return <div className={'gallery '+(failed?'fallback':'')} ref={host} aria-label="作品ギャラリー。スクロール、ドラッグ、左右矢印キーで移動">{failed&&projects.map((p,i)=><button className="mobile-card" key={p.id} onClick={()=>onOpen(i)}><img src={p.image} alt={p.title}/><span>{p.title}</span></button>)}</div>;
}
export function Portal(){
 const host=useRef(null);
 useEffect(()=>{const el=host.current;let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));el.append(renderer.domElement);const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,20);camera.position.z=6;
 const geo=new THREE.TorusGeometry(1.63,.045,20,180),mat=new THREE.ShaderMaterial({uniforms:{time:{value:0}},vertexShader:'varying vec3 n;varying vec3 p;void main(){n=normal;p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 n;varying vec3 p;uniform float time;void main(){float wave=sin(p.x*17.+p.y*12.+time);vec3 color=.55+.45*cos(vec3(0.,2.,4.)+wave*.65+p.x*3.+time*.2);float edge=pow(abs(n.z),3.);gl_FragColor=vec4(mix(color*.45,vec3(1.),edge)*(.8+.2*sin(p.y*80.+time)),1.);}'});
 const ring=new THREE.Mesh(geo,mat);scene.add(ring);const ring2=new THREE.Mesh(geo,mat);ring2.scale.setScalar(1.04);ring2.rotation.x=.12;scene.add(ring2);
 const resize=()=>{renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();};resize();const ro=new ResizeObserver(resize);ro.observe(el);let frame;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const loop=t=>{frame=requestAnimationFrame(loop);mat.uniforms.time.value=reduced?0:t*.0005;ring.rotation.z=reduced?0:t*.000025;renderer.render(scene,camera);};frame=requestAnimationFrame(loop);
 return()=>{cancelAnimationFrame(frame);ro.disconnect();geo.dispose();mat.dispose();renderer.dispose();renderer.domElement.remove();};},[]);
 return <div className="portal" ref={host} aria-hidden="true"/>;
}

