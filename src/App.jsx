import { useState, useEffect, useRef } from "react";

const COACH = {
  name: "Coach Kai",
  offer: "help busy dads get fit and get consistent in under 30 minutes a day—without a gym, even if they've fallen off before, for $100/month",
  painPoints: ["no time to work out", "can't stay consistent", "feels out of shape and low energy"],
};
const DAILY_GOAL = 30;
const FOLLOW_UP_DAYS = 2;
const TONES = [
  { id: "casual", label: "Casual", emoji: "👋" },
  { id: "motivational", label: "Hype", emoji: "🔥" },
  { id: "direct", label: "Direct", emoji: "💪" },
];
const PLATFORMS = ["Instagram", "TikTok"];
const TABS = ["Dashboard", "Generate", "Leads", "Convo", "Follow-Ups"];
const TAB_ICONS = ["📊", "✍️", "👥", "💬", "🔔"];

const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} };

async function callClaude(prompt, system = "") {
  const body = { model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] };
  if (system) body.system = system;
  const res = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

export default function App() {
  const [tab, setTab] = useState(1);
  const [leads, setLeads] = useState(() => load("ck_leads_v2", []));
  const persistLeads = (u) => { setLeads(u); save("ck_leads_v2", u); };
  const today = new Date().toLocaleDateString();
  const todayCount = leads.filter(l => l.date === today).length;
  const remaining = Math.max(DAILY_GOAL - todayCount, 0);
  const overdueFollowUps = leads.filter(l => {
    if (l.status === "closed" || l.status === "dead") return false;
    if (!l.lastContact) return false;
    return (Date.now() - new Date(l.lastContact)) / 86400000 >= FOLLOW_UP_DAYS;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: "#f0ede8", fontFamily: "'DM Sans', sans-serif", paddingBottom: 72 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Bebas+Neue&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#e8ff47;border-radius:2px}
        .hdr{background:#0d0d0d;border-bottom:1px solid #1a1a1a;padding:13px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:20}
        .logo{font-family:'Bebas Neue',sans-serif;font-size:21px;letter-spacing:2px;color:#e8ff47}
        .logo span{color:#f0ede8}
        .hdr-badges{display:flex;gap:7px;align-items:center}
        .badge{border-radius:20px;padding:4px 11px;font-size:11px;font-weight:700}
        .badge-green{background:#161f00;border:1px solid #e8ff47;color:#e8ff47}
        .badge-red{background:#1a0808;border:1px solid #ff4444;color:#ff6b6b}
        .bnav{position:fixed;bottom:0;left:0;right:0;background:#0d0d0d;border-top:1px solid #1a1a1a;display:flex;z-index:20;padding-bottom:env(safe-area-inset-bottom,0px)}
        .nbtn{flex:1;padding:9px 2px 7px;background:none;border:none;color:#3a3a3a;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:9px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:2px;transition:color .15s;position:relative}
        .nbtn.on{color:#e8ff47}
        .nbtn-icon{font-size:17px;line-height:1}
        .ndot{width:6px;height:6px;background:#ff4444;border-radius:50%;position:absolute;top:5px;right:calc(50% - 16px);border:1px solid #080808}
        .pg{max-width:600px;margin:0 auto;padding:18px 14px 16px}
        .stitle{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px;color:#e8ff47;margin-bottom:14px}
        .clabel{font-size:10px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#3a3a3a;margin-bottom:8px}
        .card{background:#111;border:1px solid #1c1c1c;border-radius:13px;padding:16px;margin-bottom:11px}
        .sgrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px}
        .sbox{background:#111;border:1px solid #1c1c1c;border-radius:12px;padding:14px 13px}
        .sbox.red{border-color:#2a1010;background:#110808}
        .snum{font-family:'Bebas Neue',sans-serif;font-size:34px;color:#e8ff47;line-height:1}
        .slbl{font-size:11px;color:#444;margin-top:3px;font-weight:500}
        .pbar{background:#181818;border-radius:4px;height:7px;overflow:hidden;margin-top:7px}
        .pfill{height:100%;background:linear-gradient(90deg,#e8ff47,#b8d400);border-radius:4px;transition:width .6s ease}
        .wchart{display:flex;align-items:flex-end;gap:5px;height:55px;margin-top:7px}
        .bwrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%}
        .bbg{flex:1;width:100%;background:#181818;border-radius:3px;display:flex;align-items:flex-end;overflow:hidden}
        .bfill{width:100%;background:#e8ff47;border-radius:3px;transition:height .5s ease;min-height:2px}
        .bday{font-size:9px;color:#3a3a3a;font-weight:700}
        .trow{display:flex;gap:7px;margin-bottom:14px}
        .tbtn{flex:1;background:#111;border:1px solid #242424;border-radius:9px;padding:9px 5px;text-align:center;cursor:pointer;color:#555;font-family:'DM Sans',sans-serif;font-size:11px;font-weight:600;transition:all .15s}
        .tbtn.on{background:#161f00;border-color:#e8ff47;color:#e8ff47}
        .temoji{font-size:17px;display:block;margin-bottom:2px}
        .prow{display:flex;gap:7px;margin-bottom:14px}
        .pbtn{flex:1;background:#111;border:1px solid #242424;border-radius:9px;padding:9px;text-align:center;cursor:pointer;color:#555;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;transition:all .15s}
        .pbtn.on{background:#0a1525;border-color:#4a9eff;color:#4a9eff}
        .chips{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:11px}
        .chip{background:#141414;border:1px solid #242424;border-radius:20px;padding:5px 11px;font-size:11px;cursor:pointer;color:#444;font-family:'DM Sans',sans-serif;transition:all .15s}
        .chip.on{border-color:#e8ff47;color:#e8ff47;background:#161f00}
        textarea,.sinput{width:100%;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:9px;padding:13px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:13px;line-height:1.6;resize:none;outline:none;transition:border-color .2s}
        textarea:focus,.sinput:focus{border-color:#2e2e2e}
        textarea::placeholder,.sinput::placeholder{color:#272727}
        .sinput{padding:10px 13px;margin-bottom:13px}
        .bprimary{width:100%;background:#e8ff47;color:#080808;border:none;border-radius:9px;padding:14px;font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;cursor:pointer;transition:all .15s}
        .bprimary:hover{background:#f2ff70}
        .bprimary:disabled{opacity:.4;cursor:not-allowed}
        .bsec{background:#181818;border:1px solid #262626;border-radius:7px;padding:8px 13px;color:#777;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s}
        .bsec:hover,.bsec.cp{border-color:#e8ff47;color:#e8ff47;background:#161f00}
        .bdanger{background:#180808;border:1px solid #2e1010;border-radius:7px;padding:8px 13px;color:#ff6b6b;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;cursor:pointer}
        .mcard{background:#111;border:1px solid #1c1c1c;border-radius:11px;padding:14px;margin-bottom:9px;animation:fu .22s ease both}
        @keyframes fu{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .mnum{font-size:10px;font-weight:700;letter-spacing:1.5px;color:#3a3a3a;margin-bottom:7px;text-transform:uppercase}
        .mtext{font-size:13px;line-height:1.7;color:#bbb;margin-bottom:11px;white-space:pre-wrap}
        .lcard{background:#111;border:1px solid #1c1c1c;border-radius:11px;padding:13px;margin-bottom:7px;cursor:pointer;transition:border-color .15s}
        .lcard:hover{border-color:#2e2e2e}
        .lcard.ov{border-color:#2e1010}
        .ltop{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px}
        .lname{font-size:13px;font-weight:600;color:#ddd}
        .ldate{font-size:11px;color:#3a3a3a}
        .lprev{font-size:12px;color:#444;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:7px}
        .strow{display:flex;gap:5px;align-items:center;flex-wrap:wrap}
        .stbadge{font-size:10px;font-weight:700;letter-spacing:.8px;padding:3px 7px;border-radius:20px;text-transform:uppercase}
        .st-new{background:#161f00;color:#e8ff47}.st-contacted{background:#0a1525;color:#4a9eff}.st-replied{background:#1a0a25;color:#b06eff}.st-hot{background:#1f0a00;color:#ff8c47}.st-closed{background:#0a1f0a;color:#4aff6e}.st-dead{background:#1a1a1a;color:#3a3a3a}
        .platbadge{font-size:10px;color:#3a3a3a;font-weight:600}
        .bubble{padding:9px 13px;border-radius:11px;margin-bottom:6px;max-width:86%;font-size:13px;line-height:1.6;animation:fu .2s ease both}
        .bthem{background:#181818;color:#bbb;align-self:flex-start;border-bottom-left-radius:3px}
        .bkai{background:#161f00;border:1px solid #2a3500;color:#e8ff47;align-self:flex-end;margin-left:auto;border-bottom-right-radius:3px}
        .bwrp{display:flex;flex-direction:column}
        .fcard{background:#110808;border:1px solid #261010;border-radius:11px;padding:13px;margin-bottom:9px;animation:fu .2s ease both}
        .fdays{font-size:11px;color:#ff6b6b;font-weight:700;margin-bottom:5px}
        .fname{font-size:13px;font-weight:600;color:#ddd;margin-bottom:3px}
        .flast{font-size:12px;color:#444;font-style:italic;margin-bottom:11px}
        .ovlay{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:30;display:flex;align-items:flex-end}
        .modal{background:#111;border-top:1px solid #1e1e1e;border-radius:18px 18px 0 0;padding:22px 16px 38px;width:100%;max-height:88vh;overflow-y:auto;animation:slideup .22s ease}
        @keyframes slideup{from{transform:translateY(100%)}to{transform:translateY(0)}}
        .mhandle{width:34px;height:4px;background:#282828;border-radius:2px;margin:0 auto 18px}
        .mtitle{font-family:'Bebas Neue',sans-serif;font-size:21px;letter-spacing:1px;color:#e8ff47;margin-bottom:16px}
        .sselect{width:100%;background:#0d0d0d;border:1px solid #1e1e1e;border-radius:8px;padding:10px 12px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:13px;outline:none;margin-bottom:11px;-webkit-appearance:none}
        .tip{background:#0e1500;border:1px solid #1c2800;border-radius:8px;padding:10px 13px;font-size:12px;color:#5a7a00;line-height:1.6;margin-bottom:14px}
        .empty{text-align:center;padding:40px 18px;color:#2e2e2e}
        .empty-icon{font-size:34px;margin-bottom:9px}
        .empty-text{font-size:13px;line-height:1.6}
        .dots span{display:inline-block;width:5px;height:5px;background:#080808;border-radius:50%;margin:0 2px;animation:bn 1s infinite}
        .dots span:nth-child(2){animation-delay:.15s}.dots span:nth-child(3){animation-delay:.3s}
        @keyframes bn{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}
        .divider{height:1px;background:#181818;margin:18px 0}
        .pipe-row{display:flex;justify-content:space-between;align-items:center}
        .pipe-item{text-align:center}
        .pipe-num{font-family:'Bebas Neue',sans-serif;font-size:27px;line-height:1}
        .pipe-lbl{font-size:10px;color:#444;font-weight:600;margin-top:2px}
      `}</style>

      <div className="hdr">
        <div className="logo">Coach <span>Kai</span></div>
        <div className="hdr-badges">
          {overdueFollowUps.length > 0 && <div className="badge badge-red">🔔 {overdueFollowUps.length}</div>}
          <div className="badge badge-green">{todayCount}/{DAILY_GOAL}</div>
        </div>
      </div>

      {tab === 0 && <Dashboard leads={leads} todayCount={todayCount} remaining={remaining} overdueFollowUps={overdueFollowUps} setTab={setTab} />}
      {tab === 1 && <Generate leads={leads} persistLeads={persistLeads} />}
      {tab === 2 && <LeadsTab leads={leads} persistLeads={persistLeads} />}
      {tab === 3 && <ConvoTab leads={leads} persistLeads={persistLeads} />}
      {tab === 4 && <FollowUps leads={leads} persistLeads={persistLeads} overdueFollowUps={overdueFollowUps} />}

      <div className="bnav">
        {TABS.map((t, i) => (
          <button key={i} className={`nbtn ${tab === i ? "on" : ""}`} onClick={() => setTab(i)}>
            <span className="nbtn-icon">{TAB_ICONS[i]}</span>{t}
            {i === 4 && overdueFollowUps.length > 0 && <span className="ndot" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function Dashboard({ leads, todayCount, remaining, overdueFollowUps, setTab }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const weekCounts = days.map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - ((d.getDay()+6)%7) + i);
    return leads.filter(l => l.date === d.toLocaleDateString()).length;
  });
  const maxBar = Math.max(...weekCounts, 1);
  return (
    <div className="pg">
      <div className="stitle">DASHBOARD</div>
      <div className="sgrid">
        <div className="sbox">
          <div className="snum">{todayCount}</div>
          <div className="slbl">Sent Today</div>
          <div className="pbar"><div className="pfill" style={{width:`${Math.min((todayCount/DAILY_GOAL)*100,100)}%`}}/></div>
        </div>
        <div className="sbox">
          <div className="snum" style={{color: remaining===0?"#4aff6e":"#f0ede8"}}>{remaining}</div>
          <div className="slbl">{remaining===0?"Goal Hit! 🎉":"Left to Goal"}</div>
        </div>
        <div className="sbox">
          <div className="snum">{leads.length}</div>
          <div className="slbl">Total Leads</div>
        </div>
        <div className={`sbox ${overdueFollowUps.length>0?"red":""}`} style={{cursor:overdueFollowUps.length>0?"pointer":"default"}} onClick={()=>overdueFollowUps.length>0&&setTab(4)}>
          <div className="snum" style={{color:overdueFollowUps.length>0?"#ff6b6b":"#f0ede8"}}>{overdueFollowUps.length}</div>
          <div className="slbl">Overdue Follow-Ups</div>
        </div>
      </div>
      <div className="card">
        <div className="clabel">This Week</div>
        <div className="wchart">
          {days.map((d,i)=>(
            <div className="bwrap" key={i}>
              <div className="bbg"><div className="bfill" style={{height:`${(weekCounts[i]/maxBar)*100}%`}}/></div>
              <div className="bday">{d}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="clabel">Pipeline</div>
        <div className="pipe-row">
          {[{l:"New",s:"new",c:"#e8ff47"},{l:"Replied",s:"replied",c:"#b06eff"},{l:"Hot 🔥",s:"hot",c:"#ff8c47"},{l:"Closed ✅",s:"closed",c:"#4aff6e"}].map(p=>(
            <div className="pipe-item" key={p.s}>
              <div className="pipe-num" style={{color:p.c}}>{leads.filter(l=>l.status===p.s).length}</div>
              <div className="pipe-lbl">{p.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Generate({ leads, persistLeads }) {
  const [tone,setTone]=useState("casual");
  const [platform,setPlatform]=useState("Instagram");
  const [itype,setItype]=useState(0);
  const [info,setInfo]=useState("");
  const [msgs,setMsgs]=useState([]);
  const [loading,setLoading]=useState(false);
  const [copied,setCopied]=useState(null);
  const [err,setErr]=useState("");
  const ITYPES=["Their bio","A post/caption","A comment","Describe them"];

  const generate=async()=>{
    if(!info.trim()){setErr("Paste something about this person first.");return;}
    setErr("");setLoading(true);setMsgs([]);
    const prompt=`Write 3 personalized ${platform} DM openers for ${COACH.name}, a fitness coach.
Offer: "${COACH.offer}"
Audience: Busy dads who struggle with: ${COACH.painPoints.join(", ")}.
Prospect (${ITYPES[itype]}): "${info}"
Tone: ${TONES.find(t=>t.id===tone)?.label}
Rules: feel human, reference their info, NO offer/price yet, 2-4 sentences, end with genuine question.
Respond ONLY as JSON: {"messages":["msg1","msg2","msg3"]}`;
    try {
      const raw=await callClaude(prompt);
      const parsed=JSON.parse(raw.replace(/```json|```/g,"").trim());
      setMsgs(parsed.messages||[]);
    } catch{setErr("Something went wrong. Try again.");}
    setLoading(false);
  };

  const handleCopy=(msg,i)=>{
    navigator.clipboard.writeText(msg);
    setCopied(i); setTimeout(()=>setCopied(null),2000);
    persistLeads([{id:Date.now(),date:new Date().toLocaleDateString(),lastContact:new Date().toISOString(),prospectInfo:info.slice(0,120),platform,tone,initialMessage:msg,status:"new",convo:[{role:"kai",text:msg,ts:Date.now()}],notes:""},...leads]);
  };

  return (
    <div className="pg">
      <div className="stitle">GENERATE DMs</div>
      <div className="clabel">Platform</div>
      <div className="prow">{PLATFORMS.map(p=><button key={p} className={`pbtn ${platform===p?"on":""}`} onClick={()=>setPlatform(p)}>{p}</button>)}</div>
      <div className="clabel">Tone</div>
      <div className="trow">{TONES.map(t=><button key={t.id} className={`tbtn ${tone===t.id?"on":""}`} onClick={()=>setTone(t.id)}><span className="temoji">{t.emoji}</span>{t.label}</button>)}</div>
      <div className="clabel" style={{marginBottom:7}}>What are you pasting?</div>
      <div className="chips">{ITYPES.map((t,i)=><button key={i} className={`chip ${itype===i?"on":""}`} onClick={()=>setItype(i)}>{t}</button>)}</div>
      <textarea rows={5} value={info} onChange={e=>setInfo(e.target.value)} placeholder={itype===0?"e.g. Dad of 3, software engineer, always posts about being tired...":itype===1?"Paste their post caption here...":itype===2?"Paste the comment they left...":"e.g. 38-yr-old dad, works long hours, wants to lose weight..."} style={{marginBottom:14}}/>
      <button className="bprimary" onClick={generate} disabled={loading}>
        {loading?<span className="dots"><span/><span/><span/></span>:"GENERATE DMs →"}
      </button>
      {err&&<div style={{color:"#ff6b6b",fontSize:12,marginTop:9}}>{err}</div>}
      {msgs.length>0&&(
        <div style={{marginTop:22}}>
          <div className="tip">✅ Pick one → copy it → paste into {platform} and send. It auto-saves to your Leads.</div>
          {msgs.map((msg,i)=>(
            <div className="mcard" key={i}>
              <div className="mnum">Option {i+1}</div>
              <div className="mtext">{msg}</div>
              <button className={`bsec ${copied===i?"cp":""}`} onClick={()=>handleCopy(msg,i)}>{copied===i?"✓ Saved & Copied!":"Copy + Save Lead"}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LeadsTab({ leads, persistLeads }) {
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const [selected,setSelected]=useState(null);
  const filtered=leads.filter(l=>{
    const ms=l.prospectInfo?.toLowerCase().includes(search.toLowerCase());
    const mf=filter==="all"||l.status===filter;
    return ms&&mf;
  });
  const updateLead=(id,updates)=>{
    const u=leads.map(l=>l.id===id?{...l,...updates}:l);
    persistLeads(u);
    if(selected?.id===id)setSelected(s=>({...s,...updates}));
  };
  return (
    <div className="pg">
      <div className="stitle">ALL LEADS</div>
      <input className="sinput" placeholder="Search leads..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className="chips">
        {["all","new","contacted","replied","hot","closed","dead"].map(f=><button key={f} className={`chip ${filter===f?"on":""}`} onClick={()=>setFilter(f)}>{f}</button>)}
      </div>
      {filtered.length===0?(
        <div className="empty"><div className="empty-icon">👥</div><div className="empty-text">No leads yet. Generate DMs and copy them — they'll appear here automatically.</div></div>
      ):filtered.map(lead=>{
        const ov=lead.status!=="closed"&&lead.status!=="dead"&&lead.lastContact&&(Date.now()-new Date(lead.lastContact))/86400000>=FOLLOW_UP_DAYS;
        return(
          <div key={lead.id} className={`lcard ${ov?"ov":""}`} onClick={()=>setSelected(lead)}>
            <div className="ltop">
              <div className="lname">{lead.prospectInfo?.slice(0,38)}{lead.prospectInfo?.length>38?"...":""}</div>
              <div className="ldate">{lead.date}</div>
            </div>
            <div className="lprev">"{lead.initialMessage?.slice(0,65)}..."</div>
            <div className="strow">
              <span className={`stbadge st-${lead.status}`}>{lead.status}</span>
              <span className="platbadge">{lead.platform}</span>
              {ov&&<span style={{fontSize:10,color:"#ff6b6b",fontWeight:700}}>⚠ FOLLOW UP</span>}
            </div>
          </div>
        );
      })}
      {selected&&<LeadModal lead={selected} onClose={()=>setSelected(null)} onUpdate={updateLead} onDelete={id=>{persistLeads(leads.filter(l=>l.id!==id));setSelected(null);}}/>}
    </div>
  );
}

function LeadModal({ lead, onClose, onUpdate, onDelete }) {
  const [notes,setNotes]=useState(lead.notes||"");
  return(
    <div className="ovlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle"/>
        <div className="mtitle">LEAD DETAILS</div>
        <div style={{fontSize:11,color:"#444",marginBottom:5}}>{lead.date} · {lead.platform}</div>
        <div style={{fontSize:13,color:"#666",marginBottom:14,lineHeight:1.6,fontStyle:"italic"}}>"{lead.prospectInfo}"</div>
        <div className="clabel">First Message Sent</div>
        <div style={{fontSize:13,color:"#999",lineHeight:1.6,marginBottom:14,padding:"11px 13px",background:"#0d0d0d",borderRadius:8}}>{lead.initialMessage}</div>
        <div className="clabel">Status</div>
        <select className="sselect" value={lead.status} onChange={e=>onUpdate(lead.id,{status:e.target.value})}>
          {["new","contacted","replied","hot","closed","dead"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <div className="clabel">Notes</div>
        <textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} onBlur={()=>onUpdate(lead.id,{notes})} placeholder="Notes about this lead..." style={{marginBottom:14}}/>
        <div style={{display:"flex",gap:8}}>
          <button className="bsec" style={{flex:1}} onClick={onClose}>Close</button>
          <button className="bdanger" onClick={()=>{if(window.confirm("Delete this lead?"))onDelete(lead.id);}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function ConvoTab({ leads, persistLeads }) {
  const [selId,setSelId]=useState(null);
  const [reply,setReply]=useState("");
  const [nextMove,setNextMove]=useState("");
  const [loading,setLoading]=useState(false);
  const [copied,setCopied]=useState(false);
  const btmRef=useRef(null);
  const active=leads.find(l=>l.id===selId);
  const activeLeads=leads.filter(l=>l.status!=="closed"&&l.status!=="dead");
  useEffect(()=>{btmRef.current?.scrollIntoView({behavior:"smooth"});},[active?.convo?.length,nextMove]);

  const getMove=async()=>{
    if(!reply.trim()||!active)return;
    setLoading(true);setNextMove("");
    const hist=(active.convo||[]).map(m=>`${m.role==="kai"?"Coach Kai":"Lead"}: ${m.text}`).join("\n");
    const prompt=`You are Coach Kai's DM reply coach. Goal: move this lead to give their phone number for a sales call.
Offer: "${COACH.offer}" | Lead: "${active.prospectInfo}"
Conversation:\n${hist}\nLead just said: "${reply}"
Write Kai's EXACT next reply:
- 2-4 sentences, warm and human
- Build rapport; never be salesy
- If engaging well: nudge toward number ("mind if I shoot you a quick text?")
- If clearly interested: ask directly ("what's the best number for you?")
- Never mention price yet
Reply with ONLY the message text.`;
    try {
      const msg=await callClaude(prompt);
      setNextMove(msg.trim());
      persistLeads(leads.map(l=>l.id===selId?{...l,convo:[...(l.convo||[]),{role:"them",text:reply,ts:Date.now()}],status:"replied",lastContact:new Date().toISOString()}:l));
      setReply("");
    } catch{}
    setLoading(false);
  };

  const copyAndSave=()=>{
    navigator.clipboard.writeText(nextMove);
    setCopied(true);setTimeout(()=>setCopied(false),2000);
    persistLeads(leads.map(l=>l.id===selId?{...l,convo:[...(l.convo||[]),{role:"kai",text:nextMove,ts:Date.now()}],lastContact:new Date().toISOString()}:l));
    setNextMove("");
  };

  return(
    <div className="pg">
      <div className="stitle">CONVERSATION</div>
      <div className="tip">Paste what they said → get your exact next reply → copy and send. The AI is always moving them toward giving you their number. 📱</div>
      <div className="clabel">Select Lead</div>
      <select className="sselect" value={selId||""} onChange={e=>setSelId(Number(e.target.value))}>
        <option value="">— Pick a lead —</option>
        {activeLeads.map(l=><option key={l.id} value={l.id}>{l.prospectInfo?.slice(0,48)} ({l.platform})</option>)}
      </select>
      {active&&(
        <>
          <div style={{background:"#0d0d0d",borderRadius:11,padding:"13px",marginBottom:13,maxHeight:260,overflowY:"auto"}}>
            {(active.convo||[]).map((msg,i)=>(
              <div key={i} className="bwrp">
                <div className={`bubble ${msg.role==="kai"?"bkai":"bthem"}`}>{msg.text}</div>
              </div>
            ))}
            {nextMove&&<div className="bwrp"><div className="bubble bkai" style={{opacity:.75,borderStyle:"dashed"}}>{nextMove}</div></div>}
            <div ref={btmRef}/>
          </div>
          {nextMove?(
            <div style={{marginBottom:14}}>
              <button className={`bsec ${copied?"cp":""}`} style={{width:"100%",padding:"12px",fontSize:13,marginBottom:8}} onClick={copyAndSave}>
                {copied?"✓ Copied & Saved!":"Copy This Reply → Send It"}
              </button>
              <button className="bdanger" style={{width:"100%"}} onClick={()=>setNextMove("")}>Try a Different Reply</button>
            </div>
          ):(
            <>
              <div className="clabel">What did they say?</div>
              <textarea rows={3} value={reply} onChange={e=>setReply(e.target.value)} placeholder="Paste their exact reply here..." style={{marginBottom:11}}/>
              <button className="bprimary" onClick={getMove} disabled={loading||!reply.trim()}>
                {loading?<span className="dots"><span/><span/><span/></span>:"GET MY NEXT MOVE →"}
              </button>
            </>
          )}
        </>
      )}
      {!active&&<div className="empty"><div className="empty-icon">💬</div><div className="empty-text">Select a lead above to start the conversation flow.</div></div>}
    </div>
  );
}

function FollowUps({ leads, persistLeads, overdueFollowUps }) {
  const [loading,setLoading]=useState({});
  const [fuMsgs,setFuMsgs]=useState({});
  const [copied,setCopied]=useState({});
  const days=iso=>Math.floor((Date.now()-new Date(iso))/86400000);

  const genFollowUp=async(lead)=>{
    setLoading(p=>({...p,[lead.id]:true}));
    const lastMsg=lead.convo?.filter(m=>m.role==="kai").slice(-1)[0]?.text||lead.initialMessage;
    const prompt=`Write a follow-up DM for Coach Kai. Lead hasn't responded in ${days(lead.lastContact)} days.
Lead: "${lead.prospectInfo}" | Platform: ${lead.platform} | Status: ${lead.status}
Last Kai message: "${lastMsg}"
Rules: casual not pushy, add curiosity/value, reference them specifically, 2-3 sentences, easy yes/no question at end.
Reply with ONLY the message text.`;
    try{const msg=await callClaude(prompt);setFuMsgs(p=>({...p,[lead.id]:msg.trim()}));}catch{}
    setLoading(p=>({...p,[lead.id]:false}));
  };

  const handleCopy=(lead,msg)=>{
    navigator.clipboard.writeText(msg);
    setCopied(p=>({...p,[lead.id]:true}));setTimeout(()=>setCopied(p=>({...p,[lead.id]:false})),2000);
    persistLeads(leads.map(l=>l.id===lead.id?{...l,convo:[...(l.convo||[]),{role:"kai",text:msg,ts:Date.now()}],lastContact:new Date().toISOString()}:l));
    setFuMsgs(p=>{const n={...p};delete n[lead.id];return n;});
  };

  const markDead=id=>persistLeads(leads.map(l=>l.id===id?{...l,status:"dead"}:l));

  return(
    <div className="pg">
      <div className="stitle">FOLLOW-UPS</div>
      {overdueFollowUps.length===0?(
        <div className="empty"><div className="empty-icon">✅</div><div className="empty-text">All caught up! No overdue follow-ups right now.</div></div>
      ):(
        <>
          <div className="tip">🔔 {overdueFollowUps.length} lead{overdueFollowUps.length>1?"s":""} need{overdueFollowUps.length===1?"s":""} a follow-up. Generate → copy → send.</div>
          {overdueFollowUps.map(lead=>(
            <div className="fcard" key={lead.id}>
              <div className="fdays">⚠ {days(lead.lastContact)} days since last contact</div>
              <div className="fname">{lead.prospectInfo?.slice(0,50)}{lead.prospectInfo?.length>50?"...":""}</div>
              <div className="flast">Last: "{lead.convo?.filter(m=>m.role==="kai").slice(-1)[0]?.text?.slice(0,55)||lead.initialMessage?.slice(0,55)}..."</div>
              {fuMsgs[lead.id]?(
                <>
                  <div style={{fontSize:13,color:"#ccc",lineHeight:1.7,padding:"11px 13px",background:"#0d0d0d",borderRadius:8,marginBottom:9}}>{fuMsgs[lead.id]}</div>
                  <div style={{display:"flex",gap:7}}>
                    <button className={`bsec ${copied[lead.id]?"cp":""}`} style={{flex:1}} onClick={()=>handleCopy(lead,fuMsgs[lead.id])}>{copied[lead.id]?"✓ Copied!":"Copy & Mark Sent"}</button>
                    <button className="bdanger" onClick={()=>markDead(lead.id)}>Dead</button>
                  </div>
                </>
              ):(
                <div style={{display:"flex",gap:7}}>
                  <button className="bprimary" style={{flex:1,fontSize:13,padding:10}} onClick={()=>genFollowUp(lead)} disabled={loading[lead.id]}>
                    {loading[lead.id]?<span className="dots"><span/><span/><span/></span>:"Generate Follow-Up"}
                  </button>
                  <button className="bdanger" onClick={()=>markDead(lead.id)}>Dead</button>
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
