"use client";

import Link from "next/link";
import { useState } from "react";

export default function Training(){
  const [percent,setPercent]=useState(0);
  const [saved,setSaved]=useState(false);
  async function save(value:number){
    setPercent(value);
    setSaved(false);
    await fetch("/api/academy/progress",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({watchedPercent:value,positionSeconds:value*12})});
    setSaved(true);
  }
  return <main className="activity-page">
    <Link href="/academy">&larr; Training Center</Link>
    <p className="eyebrow">REQUIRED TRAINING</p>
    <h1>The Staff&apos;s Audit Ready Due Diligence Course</h1>
    <div className="video-frame"><div className="video-placeholder"><span>SECURE VIDEO PLAYER</span><b>Private training video connects here</b><p>Training progress tracking is active. Vimeo or Mux playback will replace this preview control.</p></div></div>
    <div className="progress-control"><div><b>Video completion</b><span>{percent}%</span></div><input aria-label="Video completion preview" type="range" min="0" max="100" value={percent} onChange={event=>save(Number(event.target.value))}/><small>{saved?"Progress saved to your Academy profile.":"Move the preview control to demonstrate durable progress."}</small></div>
    {percent>=90?<Link className="gold link-button" href="/academy/assessment">Continue to assessment</Link>:null}
  </main>;
}
