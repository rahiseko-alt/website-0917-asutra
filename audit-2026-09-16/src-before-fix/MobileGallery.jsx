import {useEffect,useRef} from 'react';
import {projects} from './content';
export function MobileGallery({onOpen,paused,reduced}){
 const root=useRef(null),pause=useRef(paused);pause.current=paused;
 useEffect(()=>{
  if(reduced)return;
  const getCycle=()=>{const cards=root.current?.children;return cards?.length>projects.length?cards[projects.length].offsetTop-cards[0].offsetTop:0;};
  const cycle=getCycle();if(cycle)window.scrollTo(0,cycle-20);
  const scroll=()=>{if(pause.current)return;const c=getCycle();if(!c)return;if(scrollY<c*.3)window.scrollTo(0,scrollY+c);else if(scrollY>c*1.8)window.scrollTo(0,scrollY-c);};
  window.addEventListener('scroll',scroll,{passive:true});return()=>window.removeEventListener('scroll',scroll);
 },[reduced]);
 const display=reduced?projects:[...projects,...projects,...projects];
 return <main className="mobile-gallery" ref={root} aria-label="作品ギャラリー">{display.map((p,i)=><button key={i} className="mobile-card" onClick={()=>onOpen(i%projects.length)}><img src={p.image} alt={p.title+' — '+p.category} loading="eager"/><span>{p.title}</span><b className="round-arrow" aria-hidden="true">↗</b></button>)}</main>;
}
