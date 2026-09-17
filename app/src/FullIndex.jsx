import {useEffect,useRef,useState} from 'react';
import {projects} from './content';
export function FullIndex({onOpen}){
 const preview=useRef(null),motion=useRef({x:0,y:0,tx:0,ty:0,active:false}),[active,setActive]=useState(0);
 useEffect(()=>{let frame,previous=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const tick=t=>{frame=requestAnimationFrame(tick);const m=motion.current,dt=Math.min((t-previous)/1000||.016,.05);previous=t;const dx=m.tx-m.x,dy=m.ty-m.y,f=reduced?1:1-Math.exp(-12*dt);m.x+=dx*f;m.y+=dy*f;if(preview.current)preview.current.style.transform=`translate3d(${m.x}px,${m.y}px,0) translate(-50%,-50%) perspective(850px) rotateY(${reduced?0:Math.max(-16,Math.min(16,dx*.25))}deg) rotateX(${reduced?0:Math.max(-12,Math.min(12,-dy*.2))}deg) scale(${m.active?1:.12})`;};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[]);
 const enter=(i,e)=>{setActive(i);const m=motion.current;m.active=true;const rect=e.currentTarget.getBoundingClientRect();m.tx=e.clientX||rect.x+rect.width/2;m.ty=e.clientY||rect.y+rect.height/2;if(!m.x){m.x=m.tx;m.y=m.ty;}preview.current?.classList.add('visible');};
 const leave=()=>{motion.current.active=false;preview.current?.classList.remove('visible');};
 return <main className="full-index" aria-label="全作品"><div className="index-list">{projects.map((p,i)=><span key={p.id}><button onPointerEnter={e=>enter(i,e)} onPointerMove={e=>{motion.current.tx=e.clientX;motion.current.ty=e.clientY;}} onPointerLeave={leave} onFocus={e=>enter(i,e)} onBlur={leave} onClick={()=>{leave();onOpen(i);}}>{p.title}</button>{i<projects.length-1&&<i> · </i>}</span>)}</div><p>SELECTED EXPERIMENTS / 2026</p><div className="index-preview" ref={preview} aria-hidden="true">{projects.map((p,i)=><div key={p.id} className={'preview-film '+(active===i?'active':'')}><img src={p.image} alt=""/><img src={p.detailImage||p.image} className="second-frame" alt=""/></div>)}</div></main>;
}
