'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';

/** Decorative motion stays behind the content and rests when the hero is offscreen. */
export default function HeroBackground(){
 const element=useRef<HTMLDivElement>(null);
 const [running,setRunning]=useState(false);
 useEffect(()=>{
  const target=element.current;if(!target)return;
  let visible=false;
  const update=()=>setRunning(visible&&!document.hidden);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update()});
  observer.observe(target);document.addEventListener('visibilitychange',update);
  return()=>{observer.disconnect();document.removeEventListener('visibilitychange',update)};
 },[]);
 return <div ref={element} className={'hero-background'+(running?' is-running':'')} aria-hidden="true">
  <div className="hero-glow glow-violet"/><div className="hero-glow glow-mint"/>
  {Array.from({length:18},(_,index)=><span key={index} className={'hero-star'+(index%5===0?' star-cross':'')} style={{left:`${7+(index*37)%87}%`,top:`${9+(index*23)%80}%`,'--delay':`${-index*1.3}s`,'--duration':`${7+index%5}s`} as CSSProperties}/>)}
  <span className="hero-comet comet-one"/><span className="hero-comet comet-two"/>
 </div>;
}
