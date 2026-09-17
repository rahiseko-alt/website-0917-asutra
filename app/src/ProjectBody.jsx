import {useEffect,useRef} from 'react';
export function ProjectBody({project,children}){
 const root=useRef(null);
 useEffect(()=>{const el=root.current,scroll=el.closest('.project-sheet');if(!scroll||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 let last=scroll.scrollTop,speed=0,frame,previous=0;
 const update=()=>{speed=Math.max(-12,Math.min(12,(scroll.scrollTop-last)*.1));last=scroll.scrollTop;};
 const tick=t=>{frame=requestAnimationFrame(tick);const dt=Math.min((t-previous)/1000||.016,.05);previous=t;speed*=Math.exp(-9*dt);el.style.setProperty('--bend',speed.toFixed(3)+'deg');scroll.style.setProperty('--sheet-bend',(speed*.15).toFixed(3)+'deg');};scroll.addEventListener('scroll',update,{passive:true});frame=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(frame);scroll.removeEventListener('scroll',update);};
 },[project.id]);
 return <div className="project-images" ref={root}><img src={project.image} alt={project.title+'のデモビジュアル'}/><section className={'project-story story-'+project.id} style={{background:project.color}}><span>{project.category}</span><h2>{project.id==='solstice'?<>A study<br/>in light.</>:project.id==='otherworld'?<>Somewhere<br/>between worlds.</>:<>Type.<br/>Space.<br/>Possibility.</>}</h2><p>{project.detail}</p></section>{project.detailImage?<img src={project.detailImage} alt={project.title+'の素材と空間のディテール'}/>:<div className={'project-triptych triptych-'+project.id}>{[0,1,2].map(i=><div key={i}><img src={project.image} alt={project.title+'の構成ディテール '+(i+1)} style={{objectPosition:`${i*50}% center`}}/></div>)}</div>}{children}</div>;
}
