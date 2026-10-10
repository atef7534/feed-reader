const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const SRC={"Smashing Magazine":["S","#d33a2c"],"Cloudflare Blog":["C","#f48120"],"Simon Willison":["S","#111"],"Josh Comeau":["J","#4f46e5"],"Figma Blog":["F","#111"],"CSS-Tricks":["C","#e5533d"],"web.dev":["W","#0a7bbd"],"Kent C. Dodds":["K","#2563eb"],"Sidebar.io":["S","#8b5cf6"],"NN Group":["N","#0f9d6a"],"UX Collective":["U","#2563eb"]};
const TAGS={Design:["#fce7f3","#9d174d","Design"],Backend:["#fef3c7","#78350f","Backend & DevOps"],AI:["#ede9fe","#5b21b6","AI & ML"],Frontend:["#dbeafe","#1e40af","Frontend"],General:["#e5e7eb","#374151","General Tech"]};
const CATS=[["Frontend","#2563eb",14,["CSS-Tricks",3],["Smashing Magazine",4],["Josh Comeau",2],["Kent C. Dodds",2],["web.dev",3]],["Design","#ec4899",11,["Sidebar.io",5],["NN Group",2],["Figma Blog",2],["UX Collective",2]],["Backend & DevOps","#f59e0b",8],["General Tech","#6366f1",6],["AI & ML","#8b5cf6",8]];
const DOT=c=>CATS.find(x=>x[0]==c)[1];
const mk=(src,time,title,desc,tag,cat)=>({src,time,title,desc,tag,cat,read:0,saved:0,id:Math.random()});
const SEED=()=>[
mk("Smashing Magazine",2,"Practical Guide To Designing For Colorblind Users","Color blindness affects roughly 8% of men and 0.5% of women worldwide. Yet most interfaces rely heavily on color to convey meaning, status, and hierarchy. Here's how to design interfaces that work for everyone without sacrificing visual richness.","Design","Frontend"),
mk("Cloudflare Blog",3,"How We Reduced P99 Latency by 60% with Edge-First Caching","Our engineering team spent the last quarter rethinking how we cache at the edge. The result: dramatically lower tail latency for our most demanding customers, and lessons applicable to any distributed system.","Backend","Backend & DevOps"),
mk("Simon Willison",4,"Building Effective RAG Systems: What Actually Works in Production","After months of experimenting with retrieval-augmented generation in real applications, here's what I've learned about chunking strategies, embedding models, and the surprising importance of metadata filtering.","AI","AI & ML"),
mk("Josh Comeau",5,"The Surprising Truth About CSS Container Queries","Container queries have been available for a while now, but most developers are still using them like media queries with a different syntax. There's a much more powerful mental model that unlocks truly reusable components.","Frontend","Frontend"),
mk("Figma Blog",6,"Introducing Variables 2.0: Design Tokens Meet Real Logic","Variables in Figma now support conditional logic, mathematical expressions, and cross-file references. This unlocks design system workflows that were previously only possible in code.","Design","Design"),
mk("web.dev",8,"Interaction to Next Paint: A Field Guide","INP replaced FID as a Core Web Vital. Here is how to find slow interactions in real user data and fix the long tasks behind them.","Frontend","Frontend"),
mk("NN Group",9,"Why Empty States Deserve a Design Pass","Empty screens are a user's first impression of a feature. Treat them as onboarding moments, not afterthoughts.","Design","Design"),
mk("Kent C. Dodds",11,"Stop Mocking Everything in Your Tests","Tests that mock every dependency verify your mocks, not your product. A pragmatic look at where integration tests pay off.","Frontend","Frontend")];
const NEW=()=>[["Sidebar.io",.3,"This Week in Design Systems: Tokens, Themes and Tradeoffs","Five reads on how teams are structuring multi-brand token architecture.","Design","Design"],["CSS-Tricks",.5,"A Modern Guide to the :has() Selector","Parent selection is finally here. Practical patterns for forms, cards, and navigation.","Frontend","Frontend"],["Cloudflare Blog",.7,"Announcing Smarter Cache Reserve Defaults","Less configuration, lower egress. What changes for existing zones.","Backend","Backend & DevOps"],["Simon Willison",.9,"Notes on Evaluating LLM Tool Calling","A small harness for catching regressions in structured outputs.","AI","AI & ML"],["UX Collective",1,"Designing Dashboards People Actually Read","Hierarchy, density, and the case for fewer charts.","Design","Design"]].map(a=>({...mk(...a),isNew:1}));
let S;const st={f:"all",v:"",sort:"new",q:"",tab:"feed",banner:1};
function reset(){S=SEED();Object.assign(st,{f:"all",v:"",sort:"new",q:"",tab:"feed",banner:1});$("#q").value=""}
const ago=h=>h<1?Math.round(h*60)+"m ago":h+"h ago";
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("show"),1800)}
function side(){
 $("#cats").innerHTML=CATS.map(c=>`<button class="cat${st.f==="c:"+c[0]?" on":""}" data-f="c:${c[0]}"><span class="dot" style="background:${c[1]}"></span>${c[0]}<b>${c[2]}</b></button>`+c.slice(3).map(f=>`<button class="fd${st.f==="s:"+f[0]?" on":""}" data-f="s:${f[0]}"><span class="fav" style="background:${SRC[f[0]][1]}">${SRC[f[0]][0]}</span>${f[0].replace("Smashing Magazine","Smashing Mag")}<b>${f[1]}</b></button>`).join("")).join("");
 $$(".nav").forEach(n=>n.classList.toggle("on",n.dataset.f===st.f));
 $("#cSaved").textContent=12+S.filter(a=>a.saved).length;
}
function vis(){
 let a=S.filter(x=>{const f=st.f;return f==="all"||(f==="saved"?x.saved:f.startsWith("c:")?x.cat===f.slice(2):x.src===f.slice(2))});
 if(st.q)a=a.filter(x=>(x.title+x.desc+x.src).toLowerCase().includes(st.q.toLowerCase()));
 return a.sort((p,q)=>st.sort==="new"?p.time-q.time:q.time-p.time);
}
function render(){
 side();$$(".tab").forEach(t=>t.classList.toggle("on",t.dataset.t===st.tab));
  $("#cAll").textContent=Math.max(0,47+S.filter(a=>a.isNew).length-S.filter(a=>a.read).length);
 const feed=$("#feed"),top=$(".top"),ban=$("#banner");
 const name=st.f==="all"?"All Items":st.f==="saved"?"Saved":st.f.slice(2);
 $("#title").textContent=st.tab==="feed"?name:st.tab[0].toUpperCase()+st.tab.slice(1);
 ban.style.display=st.banner&&st.tab==="feed"?"flex":"none";
 if(st.tab!=="feed"){$("#sub").textContent="";top.querySelectorAll(".seg,.btn").forEach(e=>e.style.display="none");
  feed.innerHTML=st.tab==="digest"?`<div class="pane"><h2>Your daily digest</h2>${S.slice().sort((a,b)=>a.time-b.time).slice(0,3).map(a=>`<p><b style="color:var(--ink)">${a.title}</b><br>${a.src}</p>`).join("")}<button class="btn" onclick="toast('Digest emailed to you')">Email me this digest</button></div>`:`<div class="pane"><h2>Discover new sources</h2>${["web.dev","Sidebar.io","UX Collective","NN Group"].map(s=>`<p style="display:flex;align-items:center;gap:10px"><span class="fav" style="background:${SRC[s][1]};width:18px;height:18px">${SRC[s][0]}</span>${s}<button class="btn" style="margin-left:auto" onclick="toast('Following ${s}')">Follow</button></p>`).join("")}</div>`;return}
 top.querySelectorAll(".seg,.btn").forEach(e=>e.style.display="");
 const items=vis(),n=items.filter(x=>!x.read).length;
 $("#sub").textContent=n+" unread";
 if(!items.length){feed.innerHTML='<div class="empty">Nothing here yet. Try another category or clear your search.</div>';return}
 feed.innerHTML=`<div class="day">TODAY</div><div class="list ${st.v}">`+items.map(x=>{const t=TAGS[x.tag],s=SRC[x.src];return`<article class="item${x.read?" read":""}${x.isNew?" new":""}" data-id="${x.id}"><span class="unread"></span><div class="meta"><span class="fav" style="background:${s[1]}">${s[0]}</span>${x.src}<span>·</span>${ago(x.time)}</div><h3>${x.title}</h3><p>${x.desc}</p><span class="tag" style="background:${t[0]};color:${t[1]}">${t[2]}</span><button class="save${x.saved?" on":""}" data-s="1" aria-label="Save"><svg width="15" height="15" viewBox="0 0 16 16" fill="${x.saved?"currentColor":"none"}" stroke="currentColor" stroke-width="1.4"><path d="M4 2.5h8v11L8 10.5 4 13.5z"/></svg></button></article>`}).join("")+"</div>";
 $$(".item:not(.read) .unread").forEach(u=>u.style.visibility="visible");
}
document.addEventListener("click",e=>{
 const c=e.target.closest("button,.item");if(!c){$("#menu").classList.remove("show");return}
 if(!c.closest(".menu")&&c.id!=="av")$("#menu").classList.remove("show");
 if(c.dataset.f){st.f=c.dataset.f;st.tab="feed";render()}
 else if(c.dataset.t){st.tab=c.dataset.t;render()}
 else if(c.dataset.v!==undefined&&c.closest("#views")){st.v=c.dataset.v;$$("#views button").forEach(b=>b.classList.toggle("on",b===c));render()}
 else if(c.id==="sort"){st.sort=st.sort==="new"?"old":"new";c.querySelector("span").textContent=st.sort==="new"?"Newest":"Oldest";render()}
 else if(c.id==="refresh"){const i=$("#rIc");i.classList.remove("spin");void i.offsetWidth;i.classList.add("spin");setTimeout(()=>{toast("Feeds are up to date")},600)}
 else if(c.id==="markall"){vis().forEach(x=>x.read=1);toast("Marked as read");render()}
 else if(c.id==="banner"){S=NEW().concat(S);st.banner=0;st.sort="new";$("#sort span").textContent="Newest";render();$("#feed").scrollTop=0;toast("5 new items loaded")}
 else if(c.id==="add"){const u=prompt("Paste a feed URL to follow:","https://");if(u&&u.length>8)toast("Feed added: "+u.replace(/^https?:\/\//,""))}
 else if(c.id==="av"){$("#menu").classList.toggle("show")}
 else if(c.dataset.m){$("#menu").classList.remove("show");const m=c.dataset.m,r=document.documentElement;
  if(m==="theme"){const d=r.dataset.theme==="dark"||(!r.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);r.dataset.theme=d?"light":"dark"}
  if(m==="saved"){st.f="saved";st.tab="feed";render()}
  if(m==="reset"){reset();render();toast("Demo reset")}}
 else if(c.id==="health"){toast("All 24 feeds responded in the last hour")}
 else if(c.dataset.s){const x=S.find(a=>a.id==c.closest(".item").dataset.id);x.saved=!x.saved;toast(x.saved?"Saved":"Removed from saved");render()}
 else if(c.classList.contains("item")){const x=S.find(a=>a.id==c.dataset.id);x.read=!x.read;render()}
});
$("#q").addEventListener("input",e=>{st.q=e.target.value;st.tab="feed";render()});
document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement.tagName!=="INPUT"){e.preventDefault();$("#q").focus()}if(e.key==="Escape")$("#q").blur()});
reset();render();
