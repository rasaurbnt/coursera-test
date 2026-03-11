import { useState, useEffect } from "react";

const GF = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');`;

const addH = (d, h) => new Date(d.getTime() + h * 3600000);
const fmt = d => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const fmtDay = d => d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
const toLocal = d => {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

const computeSched = (anchor, dir, peak, bulk, retard) => {
  let feed, mix, preshape, shape, preheat, bake;
  if (dir === 'fwd') {
    feed = anchor; mix = addH(feed, peak); preshape = addH(mix, bulk);
    shape = addH(preshape, 0.5); bake = addH(shape, retard); preheat = addH(bake, -1);
  } else {
    bake = anchor; preheat = addH(bake, -1); shape = addH(bake, -retard);
    preshape = addH(shape, -0.5); mix = addH(preshape, -bulk); feed = addH(mix, -peak);
  }
  return [
    { key:'feed',     label:'Feed Starter',   icon:'🌾', time:feed,    note:`peaks in ~${peak}h` },
    { key:'mix',      label:'Mix Dough',       icon:'🥣', time:mix,     note:`bulk ~${bulk}h` },
    { key:'preshape', label:'Preshape',        icon:'🤲', time:preshape, note:'bench rest 30 min' },
    { key:'shape',    label:'Shape + Retard',  icon:'🧺', time:shape,   note:`retard ~${retard}h` },
    { key:'preheat',  label:'Preheat Oven',    icon:'🔥', time:preheat, note:'1h before bake' },
    { key:'bake',     label:'Bake!',           icon:'🍞', time:bake,    note:'' },
  ];
};

// localStorage-backed storage polyfill for window.storage
if (!window.storage) {
  window.storage = {
    get: (key) => Promise.resolve(localStorage.getItem(key) ? { value: localStorage.getItem(key) } : null),
    set: (key, value) => { localStorage.setItem(key, value); return Promise.resolve(); },
  };
}

const loadLogs = async () => { try { const r = await window.storage.get('sd-logs2'); return r ? JSON.parse(r.value) : []; } catch { return []; } };
const saveLogs = async (l) => { try { await window.storage.set('sd-logs2', JSON.stringify(l)); } catch {} };

const C = {
  bg:'#FAF6EE', card:'#FFFFFF', border:'#E8DCC8', dark:'#1A0F05',
  brown:'#5C3318', tan:'#C4872E', muted:'#9B8268', active:'#B5451B',
  line:'#D4C4A0', sage:'#5C7A52', cream:'#F0E8D8',
};

const Stars = ({ val, onChange, color = C.tan }) => (
  <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(n => (
      <span key={n} onClick={() => onChange && onChange(n)}
        style={{ cursor: onChange ? 'pointer' : 'default', fontSize:20, color: n<=val ? color : '#DDD0B8', lineHeight:1, userSelect:'none' }}>
        {n<=val ? '★' : '☆'}
      </span>
    ))}
  </div>
);

const Dots = ({ val, color }) => (
  <div style={{ display:'flex', gap:3, alignItems:'center' }}>
    {[1,2,3,4,5].map(n => (
      <div key={n} style={{ width:7, height:7, borderRadius:'50%', background: n<=val ? color : '#E8DCC8' }} />
    ))}
  </div>
);

const Field = ({ label, children }) => (
  <div style={{ marginBottom:14 }}>
    <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:5 }}>{label}</div>
    {children}
  </div>
);

const inp = {
  width:'100%', padding:'10px 12px', border:`1.5px solid ${C.border}`,
  borderRadius:8, fontSize:14, color:C.dark, background:C.cream,
  outline:'none', fontFamily:"'DM Sans', sans-serif",
};

export default function App() {
  const [tab, setTab] = useState('plan');
  const [now, setNow] = useState(new Date());
  const [dir, setDir] = useState('bwd');
  const [anchor, setAnchor] = useState(() => { const d=new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0); return d; });
  const [peak, setPeak] = useState(9);
  const [bulk, setBulk] = useState(4.5);
  const [retard, setRetard] = useState(10);
  const [showDur, setShowDur] = useState(false);
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ flour:'', hydration:78, bulk:4.5, retard:10, crumb:3, ear:3, spring:3, notes:'' });

  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id); }, []);
  useEffect(() => { loadLogs().then(setLogs); }, []);

  const sched = computeSched(anchor, dir, peak, bulk, retard);
  const activeIdx = sched.reduce((a, s, i) => s.time <= now ? i : a, -1);

  const relTime = t => {
    const diff = t - now, abs = Math.abs(diff);
    const h = Math.floor(abs/3600000), m = Math.floor((abs%3600000)/60000);
    const s = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return diff < -60000 ? `${s} ago` : diff < 60000 ? 'now' : `in ${s}`;
  };

  const addLog = () => {
    const e = { id: Date.now(), date: new Date().toISOString(), ...form };
    const u = [e, ...logs]; setLogs(u); saveLogs(u); setShowForm(false);
    setForm({ flour:'', hydration:78, bulk:4.5, retard:10, crumb:3, ear:3, spring:3, notes:'' });
  };
  const delLog = id => { const u = logs.filter(l=>l.id!==id); setLogs(u); saveLogs(u); };
  const upd = (k, v) => setForm(f => ({...f, [k]:v}));

  return (
    <>
      <style>{GF}</style>
      <style>{`* { box-sizing:border-box; margin:0; padding:0; } body { background:${C.dark}; } input[type=range] { accent-color:${C.tan}; } input[type=datetime-local] { color-scheme:light; }`}</style>
      <div style={{ maxWidth:480, margin:'0 auto', minHeight:'100vh', background:C.bg, fontFamily:"'DM Sans', sans-serif" }}>

        {/* Header */}
        <div style={{ background:C.dark, padding:'28px 20px 0', textAlign:'center' }}>
          <div style={{ fontFamily:"'Fraunces', serif", fontSize:26, color:'#FAF6EE', fontWeight:600, letterSpacing:'-0.3px' }}>
            Sourdough Journal
          </div>
          <div style={{ color:C.tan, fontSize:12, marginTop:4, letterSpacing:'0.06em', paddingBottom:20 }}>
            {fmtDay(now)} · {fmt(now)}
          </div>
          <div style={{ display:'flex', borderTop:`1px solid rgba(255,255,255,0.1)` }}>
            {[['plan','⏱ Plan'],['log','📖 Log']].map(([t,label]) => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex:1, padding:'12px 0', background:'transparent', border:'none',
                color: tab===t ? C.tan : '#7A6A58', fontSize:13, fontWeight: tab===t ? 600 : 400,
                fontFamily:"'DM Sans', sans-serif", cursor:'pointer', letterSpacing:'0.05em', textTransform:'uppercase',
                borderBottom: tab===t ? `2px solid ${C.tan}` : '2px solid transparent',
              }}>{label}</button>
            ))}
          </div>
        </div>

        <div style={{ padding:'20px 16px 60px' }}>
          {tab === 'plan' ? (
            <div>
              {/* Direction */}
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {[['bwd','← Bake at...'],['fwd','Feed at →']].map(([d,label]) => (
                  <button key={d} onClick={() => setDir(d)} style={{
                    flex:1, padding:'10px 8px', borderRadius:8, border:`1.5px solid ${dir===d ? C.tan : C.border}`,
                    background: dir===d ? C.tan : 'transparent', color: dir===d ? '#FFF' : C.muted,
                    fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif", transition:'all 0.15s',
                  }}>{label}</button>
                ))}
              </div>

              {/* Anchor */}
              <div style={{ background:C.card, borderRadius:12, padding:16, marginBottom:14, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(30,18,8,0.05)' }}>
                <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:8 }}>
                  {dir==='bwd' ? 'Target bake time' : 'Starter feed time'}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <input type="datetime-local" value={toLocal(anchor)} onChange={e => setAnchor(new Date(e.target.value))}
                    style={{ ...inp, flex:1 }} />
                  <button onClick={() => setAnchor(new Date())} style={{
                    padding:'10px 14px', borderRadius:8, background:C.dark, color:'#FAF6EE',
                    border:'none', fontSize:12, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap', fontFamily:"'DM Sans', sans-serif",
                  }}>Now</button>
                </div>
              </div>

              {/* Durations */}
              <div style={{ marginBottom:20 }}>
                <button onClick={() => setShowDur(!showDur)} style={{
                  width:'100%', padding:'10px 16px', background:'transparent', border:`1.5px solid ${C.border}`,
                  borderRadius: showDur ? '8px 8px 0 0' : 8, color:C.muted, fontSize:13,
                  cursor:'pointer', fontFamily:"'DM Sans', sans-serif", display:'flex', justifyContent:'space-between',
                }}>
                  <span>⚙️  Adjust durations</span><span>{showDur ? '▲' : '▼'}</span>
                </button>
                {showDur && (
                  <div style={{ background:C.card, border:`1px solid ${C.border}`, borderTop:'none', borderRadius:'0 0 8px 8px', padding:'16px 16px 8px' }}>
                    {[
                      { label:'Starter peak time', val:peak, set:setPeak, min:4, max:16, step:0.5, unit:'h', hint:'1:4:4 ≈ 8h · 1:4.5:4.5 ≈ 10h' },
                      { label:'Bulk fermentation', val:bulk, set:setBulk, min:2, max:10, step:0.5, unit:'h', hint:`at 22–23°C` },
                      { label:'Cold retard', val:retard, set:setRetard, min:4, max:20, step:0.5, unit:'h', hint:'8–10h if well-fermented' },
                    ].map(({ label, val, set, min, max, step, unit, hint }) => (
                      <div key={label} style={{ marginBottom:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <div>
                            <span style={{ fontSize:13, color:C.dark, fontWeight:500 }}>{label}</span>
                            <span style={{ fontSize:11, color:C.muted, marginLeft:6 }}>{hint}</span>
                          </div>
                          <span style={{ fontSize:14, fontWeight:600, color:C.tan }}>{val}{unit}</span>
                        </div>
                        <input type="range" min={min} max={max} step={step} value={val}
                          onChange={e => set(parseFloat(e.target.value))} style={{ width:'100%' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div style={{ fontFamily:"'Fraunces', serif", fontSize:15, color:C.brown, fontStyle:'italic', marginBottom:14 }}>Schedule</div>
              <div style={{ position:'relative' }}>
                <div style={{ position:'absolute', left:19, top:20, bottom:20, width:2, background:`linear-gradient(to bottom, ${C.tan}, ${C.line})`, zIndex:0 }} />
                {sched.map((stage, i) => {
                  const isPast = i < activeIdx, isActive = i === activeIdx;
                  const rel = relTime(stage.time);
                  return (
                    <div key={stage.key} style={{ display:'flex', gap:12, marginBottom: i<sched.length-1 ? 10 : 0, position:'relative', zIndex:1 }}>
                      <div style={{
                        width:40, height:40, borderRadius:'50%', flexShrink:0, marginTop:2,
                        background: isActive ? C.active : isPast ? C.tan : C.bg,
                        border:`2.5px solid ${isActive ? C.active : isPast ? C.tan : C.line}`,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
                        boxShadow: isActive ? `0 0 0 4px rgba(181,69,27,0.18)` : 'none',
                      }}>{stage.icon}</div>
                      <div style={{
                        flex:1, background: isActive ? 'rgba(181,69,27,0.05)' : C.card,
                        borderRadius:10, padding:'10px 14px',
                        border:`1px solid ${isActive ? C.active : C.border}`,
                        boxShadow: isActive ? `0 2px 12px rgba(181,69,27,0.1)` : '0 1px 4px rgba(30,18,8,0.04)',
                        opacity: isPast && i < activeIdx-1 ? 0.55 : 1,
                      }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                          <span style={{ fontSize:14, fontWeight:600, color: isActive ? C.active : C.dark }}>{stage.label}</span>
                          <span style={{ fontSize:15, fontWeight:700, color: isActive ? C.active : C.tan, fontVariantNumeric:'tabular-nums' }}>{fmt(stage.time)}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', marginTop:3 }}>
                          <span style={{ fontSize:12, color:C.muted }}>{stage.note}</span>
                          <span style={{ fontSize:12, color: isActive ? C.active : C.muted, fontWeight: isActive ? 600 : 400 }}>{rel}</span>
                        </div>
                        {(i === 0 || (i > 0 && sched[i].time.toDateString() !== sched[i-1].time.toDateString())) && (
                          <div style={{ fontSize:11, color:C.tan, marginTop:2, fontWeight:500 }}>{fmtDay(stage.time)}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                <div style={{ fontFamily:"'Fraunces', serif", fontSize:20, color:C.brown, fontStyle:'italic' }}>Bake History</div>
                <button onClick={() => setShowForm(!showForm)} style={{
                  padding:'8px 16px', background:C.dark, color:'#FAF6EE', border:'none',
                  borderRadius:8, fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif",
                }}>+ New Bake</button>
              </div>

              {showForm && (
                <div style={{ background:C.card, borderRadius:14, padding:20, marginBottom:20, border:`1px solid ${C.border}`, boxShadow:'0 4px 20px rgba(30,18,8,0.09)' }}>
                  <div style={{ fontFamily:"'Fraunces', serif", fontSize:18, color:C.brown, marginBottom:18, fontStyle:'italic' }}>Record a Bake</div>
                  <Field label="Flour blend">
                    <input value={form.flour} onChange={e=>upd('flour',e.target.value)} placeholder="e.g. 80% bread flour, 20% WW" style={inp} />
                  </Field>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14 }}>
                    {[{k:'hydration',l:'Hydration %',min:60,max:100,step:1},{k:'bulk',l:'Bulk (h)',min:1,max:12,step:0.5},{k:'retard',l:'Retard (h)',min:0,max:24,step:0.5}].map(({k,l,min,max,step}) => (
                      <div key={k}>
                        <div style={{ fontSize:11, color:C.muted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:5 }}>{l}</div>
                        <input type="number" value={form[k]} onChange={e=>upd(k,parseFloat(e.target.value))} min={min} max={max} step={step}
                          style={{ ...inp, padding:'8px 10px' }} />
                      </div>
                    ))}
                  </div>
                  {[{k:'crumb',l:'Crumb structure',c:C.tan},{k:'ear',l:'Ear',c:C.active},{k:'spring',l:'Oven spring',c:C.sage}].map(({k,l,c}) => (
                    <div key={k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                      <span style={{ fontSize:13, color:C.dark, fontWeight:500 }}>{l}</span>
                      <Stars val={form[k]} onChange={v=>upd(k,v)} color={c} />
                    </div>
                  ))}
                  <Field label="Notes">
                    <textarea value={form.notes} onChange={e=>upd('notes',e.target.value)} placeholder="What went well? What to change?" rows={3}
                      style={{ ...inp, resize:'vertical' }} />
                  </Field>
                  <div style={{ display:'flex', gap:10, marginTop:4 }}>
                    <button onClick={addLog} style={{ flex:1, padding:'12px', background:C.dark, color:'#FAF6EE', border:'none', borderRadius:8, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>Save Bake</button>
                    <button onClick={()=>setShowForm(false)} style={{ padding:'12px 16px', background:'transparent', color:C.muted, border:`1.5px solid ${C.border}`, borderRadius:8, fontSize:14, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>Cancel</button>
                  </div>
                </div>
              )}

              {logs.length === 0 && !showForm ? (
                <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted }}>
                  <div style={{ fontSize:48, marginBottom:14 }}>🍞</div>
                  <div style={{ fontFamily:"'Fraunces', serif", fontSize:20, fontStyle:'italic', color:C.brown, marginBottom:8 }}>No bakes yet</div>
                  <div style={{ fontSize:13 }}>Start logging your sourdough journey</div>
                </div>
              ) : logs.map(log => <BakeCard key={log.id} log={log} onDelete={()=>delLog(log.id)} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function BakeCard({ log, onDelete }) {
  const [open, setOpen] = useState(false);
  const d = new Date(log.date);
  return (
    <div style={{ background:'#FFF', borderRadius:12, marginBottom:12, border:`1px solid ${C.border}`, boxShadow:'0 2px 8px rgba(30,18,8,0.05)', overflow:'hidden' }}>
      <div style={{ padding:'14px 16px', cursor:'pointer' }} onClick={() => setOpen(!open)}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:"'Fraunces', serif", fontSize:16, color:C.dark }}>{fmtDay(d)}</div>
            {log.flour && <div style={{ fontSize:13, color:C.muted, marginTop:2 }}>{log.flour}</div>}
            <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>
              {log.hydration}% hydration · {log.bulk}h bulk · {log.retard}h retard
            </div>
          </div>
          <div style={{ textAlign:'right', display:'flex', flexDirection:'column', gap:5 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
              <span style={{ fontSize:11, color:C.muted }}>crumb</span>
              <Dots val={log.crumb} color={C.tan} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
              <span style={{ fontSize:11, color:C.muted }}>ear</span>
              <Dots val={log.ear} color={C.active} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
              <span style={{ fontSize:11, color:C.muted }}>spring</span>
              <Dots val={log.spring} color={C.sage} />
            </div>
          </div>
        </div>
      </div>
      {open && (
        <div style={{ padding:'0 16px 16px', borderTop:`1px solid ${C.border}` }}>
          {log.notes ? <div style={{ fontSize:13, color:C.dark, lineHeight:1.6, paddingTop:12 }}>{log.notes}</div>
            : <div style={{ fontSize:13, color:C.muted, paddingTop:12, fontStyle:'italic' }}>No notes</div>}
          <button onClick={onDelete} style={{ marginTop:12, padding:'6px 12px', background:'transparent', color:C.active, border:`1px solid ${C.active}`, borderRadius:6, fontSize:12, cursor:'pointer', fontFamily:"'DM Sans', sans-serif" }}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
