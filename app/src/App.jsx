import {useState,useCallback,useEffect,useRef} from 'react';
import '@fontsource-variable/inter';
import {Gallery,Portal} from './GalleryV2';
import {FullIndex} from './FullIndex';
import {ProjectBody} from './ProjectBody';
import {MobileGallery} from './MobileGallery';
import {identity,projects} from './content';
function route(){const hash=location.hash.slice(1),parts=hash.split('/');if(parts.includes('project')){const i=projects.findIndex(p=>p.id===parts.at(-1));return {view:parts[0]==='full'?'full':'featured',panel:i>=0?i:null};}return {view:hash==='full'?'full':'featured',panel:hash==='profile'||hash==='contact'?hash:null};}
const submissionTo=import.meta.env.VITE_SUBMISSION_TO || '';
function SubmissionForm({project}){
 const [studentId,setStudentId]=useState(''),[studentName,setStudentName]=useState(''),[siteUrl,setSiteUrl]=useState('');
 const submit=e=>{e.preventDefault();const subject=`【WEB提出】${project.assignmentId}｜${studentId}｜${studentName}`;const body=`URL: ${siteUrl}\n\nAI利用の記録:\n\n著作権・引用の確認:\n\n個人情報の確認:`;window.location.href=`mailto:${encodeURIComponent(submissionTo)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;};
 return <form className="submission-form" onSubmit={submit}>
   <strong>SUBMIT THIS TASK</strong><span>{project.assignmentId} / 送信先: 学校指定メール</span>
   <label>学籍番号<input value={studentId} onChange={e=>setStudentId(e.target.value)} required placeholder="例 240101" autoComplete="off"/></label>
   <label>氏名<input value={studentName} onChange={e=>setStudentName(e.target.value)} required placeholder="例 名古屋 太郎" autoComplete="name"/></label>
   <label>公開URL<input value={siteUrl} onChange={e=>setSiteUrl(e.target.value)} required type="url" placeholder="https://..." autoComplete="url"/></label>
   <button className="submit-mail" type="submit" disabled={!submissionTo}>メールを作成する ↗</button>
   <small>{submissionTo?'送信前に、AI利用の記録・著作権と引用・個人情報を確認してください。':'提出先メールが未設定です。運用担当者は環境変数を設定してください。'}</small>
 </form>;
}
export function App(){
 const [state,setState]=useState(route),[small,setSmall]=useState(()=>innerWidth<700),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);const dialog=useRef(null),lastFocus=useRef(null),[sent,setSent]=useState(false);
 useEffect(()=>{const change=()=>setState(previous=>{const next=route();return next.panel!==null?{...next,view:previous.view}:next;});window.addEventListener('hashchange',change);const mq=matchMedia('(max-width: 699px)'),rm=matchMedia('(prefers-reduced-motion: reduce)');const resize=()=>setSmall(mq.matches),reduce=()=>setReduced(rm.matches);mq.addEventListener('change',resize);rm.addEventListener('change',reduce);document.title='WEBサイト課題の提出サイト';return()=>{window.removeEventListener('hashchange',change);mq.removeEventListener('change',resize);rm.removeEventListener('change',reduce);};},[]);
 const open=useCallback((i,originBox)=>{
  const source=state.view==='full'?document.querySelector('.index-preview'):document.querySelector(`.canvas-project:not([hidden])[aria-label="${projects[i].title} — 作品を見る"]`);
  const box=originBox||source?.getBoundingClientRect(),style=document.documentElement.style;
  style.setProperty('--open-x',box?`${box.x+box.width/2-innerWidth/2}px`:'0px');
  style.setProperty('--open-y',box?`${box.y+box.height/2-innerHeight/2}px`:'35px');
  style.setProperty('--open-sx',box?String(Math.max(.15,box.width/(innerWidth*.932))):'.95');
  style.setProperty('--open-sy',box?String(Math.max(.15,box.height/(innerHeight-32))):'.95');
  location.hash=state.view+'/project/'+projects[i].id;
 },[state.view]),close=useCallback(()=>{location.hash=state.view;},[state.view]);
 useEffect(()=>{setSent(false);if(state.panel!==null){if(!dialog.current?.contains(document.activeElement))lastFocus.current=document.activeElement;document.body.style.overflow='hidden';requestAnimationFrame(()=>dialog.current?.querySelector('button,input,a')?.focus());}else{document.body.style.overflow='';if(lastFocus.current?.isConnected)lastFocus.current.focus();}return()=>{document.body.style.overflow='';};},[state.panel]);
 useEffect(()=>{const key=e=>{if(state.panel===null)return;if(e.key==='Escape')close();if(e.key==='Tab'){const f=[...dialog.current.querySelectorAll('button,a,input,textarea')].filter(x=>!x.disabled),first=f[0],last=f.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[state.panel,close]);
 const project=typeof state.panel==='number'?projects[state.panel]:null;
 return <>
  <div className={'portfolio '+(state.panel!==null?'is-open':'')} inert={state.panel!==null?true:undefined}>
   <header><a className="name" href="#featured">{identity.name}</a><button onClick={()=>location.hash='profile'}>GUIDE</button></header>
   {state.view==='featured'?(small||reduced?<MobileGallery onOpen={open} paused={state.panel!==null} reduced={reduced}/>:<Gallery onOpen={open} paused={state.panel!==null}/>):<FullIndex onOpen={open}/>}
   <footer><nav aria-label="表示切替"><a href="#featured" aria-current={state.view==='featured'?'page':undefined}>PBL TASKS</a><span>/</span><a href="#full" aria-current={state.view==='full'?'page':undefined}>FULL INDEX</a></nav><span className="demo-note">WEB SUBMISSION / 2026</span><button onClick={()=>location.hash='contact'}>SUBMIT</button></footer>
  </div>
  {state.panel!==null&&<div className={'overlay '+(project?'project-overlay':'portal-overlay')} ref={dialog} role="dialog" aria-modal="true" aria-label={project?project.title:state.panel==='profile'?'プロフィール':'お問い合わせ'}>
   {project?<><button className="close-detail" onClick={close} aria-label="閉じる">×</button><article className="project-sheet" key={project.id}>

    <div className="project-info"><h1>{project.title}</h1><p>{project.description}</p><div className="project-meta"><span>{project.assignmentId}</span><span>{project.year}</span></div><small>{project.category}</small><SubmissionForm project={project}/></div>
    <ProjectBody project={project}><div className="next-project"><button onClick={()=>open((state.panel+projects.length-1)%projects.length)}>← Previous</button><button onClick={()=>open((state.panel+1)%projects.length)}>Next project ↗</button></div></ProjectBody>
   </article></>:<><button className="close-portal" onClick={close} aria-label="閉じる">CLOSE</button><Portal/><div className="portal-content">
    {state.panel==='profile'?<><h1>WEB課題<br/>提出デスク</h1><p className="profile-intro">{identity.intro}</p><p className="profile-note">{identity.title}<br/>{identity.note}</p><button className="inline-link" onClick={()=>location.hash='contact'}>提出方法を見る ↗</button></>:<><h1>課題を選択して<br/>提出する。</h1><p>カードを開き、学籍番号・氏名・公開URLを入力すると、授業用の提出メールが作成されます。</p><button className="inline-link" onClick={()=>location.hash='featured'}>PBL TASKSへ ↗</button></>}
   </div></>}
  </div>}
 </>;
}




