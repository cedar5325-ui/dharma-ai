"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function TossReviewLoginPage(){
  const router=useRouter(); const [id,setId]=useState(""); const [password,setPassword]=useState(""); const [message,setMessage]=useState("");
  async function submit(e:FormEvent){ e.preventDefault(); setMessage(""); const r=await fetch("/api/toss-review/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,password})}); const j=await r.json(); if(!r.ok||!j.ok){setMessage(j.message||"로그인에 실패했습니다.");return;} router.push("/materials"); router.refresh(); }
  return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f4f7fb",padding:24}}><section style={{width:"min(460px,100%)",background:"white",padding:32,borderRadius:24,border:"1px solid #e2e8f0"}}><p style={{color:"#2563eb",fontWeight:800}}>TOSS PAYMENTS REVIEW</p><h1>다르마(DHARMA) AI 테스트 로그인</h1><p>토스페이먼츠 및 카드사 심사용 테스트 계정입니다.</p><form onSubmit={submit} style={{display:"grid",gap:12,marginTop:24}}><input placeholder="테스트 ID" value={id} onChange={e=>setId(e.target.value)} style={{height:48,padding:"0 12px"}}/><input type="password" placeholder="비밀번호" value={password} onChange={e=>setPassword(e.target.value)} style={{height:48,padding:"0 12px"}}/><button style={{height:48,background:"#2563eb",color:"white",border:0,borderRadius:10,fontWeight:800}}>테스트 로그인</button></form>{message&&<p style={{color:"#b91c1c"}}>{message}</p>}</section></main>;
}
