import {useState,useCallback,useEffect,useRef} from 'react';
import '@fontsource-variable/inter';
import {Gallery,Portal} from './Gallery';
import {MobileGallery} from './MobileGallery';
import {identity,projects} from './content';
function route(){const hash=location.hash.slice(1),parts=hash.split('/');if(parts.includes('project')){const i=projects.findIndex(p=>p.id===parts.at(-1));return {view:parts[0]==='full'?'full':'featured',panel:i>=0?i:null};}return {view:hash==='full'?'full':'featured',panel:hash==='profile'||hash==='contact'?hash:null};}
export function App(){
 const [state,setState]=useState(route),[small,setSmall]=useState(()=>innerWidth<700),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);const dialog=useRef(null),lastFocus=useRef(null),[sent,setSent]=useState(false);
 useEffect(()=>{const change=()=>setState(previous=>{const next=route();return next.panel!==null?{...next,view:previous.view}:next;});window.addEventListener('hashchange',change);const mq=matchMedia('(max-width: 699px)'),rm=matchMedia('(prefers-reduced-motion: reduce)');const resize=()=>setSmall(mq.matches),reduce=()=>setReduced(rm.matches);mq.addEventListener('change',resize);rm.addEventListener('change',reduce);document.title=identity.name+' — Portfolio';return()=>{window.removeEventListener('hashchange',change);mq.removeEventListener('change',resize);rm.removeEventListener('change',reduce);};},[]);
 const open=useCallback(i=>{location.hash=state.view+'/project/'+projects[i].id;},[state.view]),close=useCallback(()=>{location.hash=state.view;},[state.view]);
 useEffect(()=>{setSent(false);if(state.panel!==null){if(!dialog.current?.contains(document.activeElement))lastFocus.current=document.activeElement;document.body.style.overflow='hidden';requestAnimationFrame(()=>dialog.current?.querySelector('button,input,a')?.focus());}else{document.body.style.overflow='';if(lastFocus.current?.isConnected)lastFocus.current.focus();}return()=>{document.body.style.overflow='';};},[state.panel]);
 useEffect(()=>{const key=e=>{if(state.panel===null)return;if(e.key==='Escape')close();if(e.key==='Tab'){const f=[...dialog.current.querySelectorAll('button,a,input,textarea')].filter(x=>!x.disabled),first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[state.panel,close]);
 const project=typeof state.panel==='number'?projects[state.panel]:null;
 return <>
  <div className={'portfolio '+(state.panel!==null?'is-open':'')} inert={state.panel!==null?true:undefined}>
   <header><a className="name" href="#featured">{identity.name}</a><button onClick={()=>location.hash='profile'}>PROFILE</button></header>
   {state.view==='featured'?(small||reduced?<MobileGallery onOpen={open} paused={state.panel!==null} reduced={reduced}/>:<Gallery onOpen={open} paused={state.panel!==null}/>):<main className="full-index" aria-label="全作品"><div>{projects.map((p,i)=><span key={p.id}><button onClick={()=>open(i)}>{p.title}</button>{i<projects.length-1&&<i> · </i>}</span>)}</div><p>SELECTED EXPERIMENTS / 2026</p></main>}
   <footer><nav aria-label="表示切替"><a href="#featured" aria-current={state.view==='featured'?'page':undefined}>FEATURED</a><span>/</span><a href="#full" aria-current={state.view==='full'?'page':undefined}>FULL</a></nav><span className="demo-note">DEMO / 2026</span><button onClick={()=>location.hash='contact'}>CONTACT</button></footer>
  </div>
  {state.panel!==null&&<div className={'overlay '+(project?'project-overlay':'portal-overlay')} ref={dialog} role="dialog" aria-modal="true" aria-label={project?project.title:state.panel==='profile'?'プロフィール':'お問い合わせ'}>
   {project?<article className="project-sheet" key={project.id}>
    <button className="close-detail" onClick={close} aria-label="閉じる">×</button>
    <div className="project-info"><h1>{project.title}</h1><p>{project.description}</p><div className="project-meta"><span>{project.year}</span><span>CONCEPT PROJECT</span></div><small>{project.category}</small><p className="demo-disclosure">自主制作のデモ作品</p></div>
    <div className="project-images"><img src={project.image} alt={project.title+'のデモビジュアル'}/><section className="project-story" style={{background:project.color}}><span>THE IDEA</span><h2>{project.title}</h2><p>{project.detail}</p></section><div className="image-detail"><img src={project.image} alt={project.title+'のビジュアル詳細'}/></div><div className="next-project"><button onClick={()=>open((state.panel+projects.length-1)%projects.length)}>← Previous</button><button onClick={()=>open((state.panel+1)%projects.length)}>Next project ↗</button></div></div>
   </article>:<><button className="close-portal" onClick={close} aria-label="閉じる">CLOSE</button><Portal/><div className="portal-content">
    {state.panel==='profile'?<><h1>{identity.name}</h1><p className="profile-intro">{identity.intro}</p><p className="profile-note">{identity.title}<br/>{identity.note}</p><button className="inline-link" onClick={()=>location.hash='contact'}>LET’S TALK ↗</button></>:<><h1>Let’s make<br/>something matter.</h1><p>新しいアイデアは、ひとつの会話から。</p>{identity.email?<a className="contact-email" href={'mailto:'+identity.email}>{identity.email} ↗</a>:<form onSubmit={e=>{e.preventDefault();setSent(true);}}><label htmlFor="email">YOUR EMAIL</label><div className="email-field"><input id="email" type="email" placeholder="you@example.com" required autoComplete="email"/><button type="submit" aria-label="デモを確認">↗</button></div><p className="form-note" role="status">{sent?'デモを確認しました。メールは送信されていません。':'デモフォームです。外部への送信は行いません。'}</p></form>}</>}
   </div></>}
  </div>}
 </>;
}
