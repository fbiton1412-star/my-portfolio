const params=new URLSearchParams(location.search);let active=params.get('category')||'all';let sub=params.get('sub')||'all';
const categories={
'all':{title:'All Works',intro:'รวมผลงานทั้งหมดที่คัดและเชื่อมเข้าระบบแล้ว สามารถกรองตามสายงานหลักได้'},
'real-estate':{title:'Real Estate',intro:'งานอสังหาริมทรัพย์ แยกเป็น Photography, Print Media, Promotional Design, Social Media Design และ Video Production',subs:['all','photography','print-media','promotional-design','social-media-design','video-production']},
'graphic-design':{title:'Graphic Design',intro:'Poster, Product Visual, Branding Concept และ Promotional Artwork ที่คัดจากผลงานจริงใน Drive'},
'motion-2d':{title:'Motion Graphics 2D',intro:'รวมโปรเจกต์ Motion 2D ทั้งหมด พร้อมเข้าไปดู Video Player และรายละเอียดแต่ละงาน'},
'photography':{title:'Photography',intro:'ผลงานภาพถ่ายส่วนตัว แยกเป็น Cosplay, Golden Hour / Warm Tone, Landscape และ Macro Photography',subs:['all','cosplay','golden-hour','landscape','macro-photography']}
};
const mainOrder=['all','real-estate','graphic-design','motion-2d','photography'];
const labels={'all':'All','real-estate':'Real Estate','graphic-design':'Graphic Design','motion-2d':'Motion 2D','photography':'Photography','cosplay':'Cosplay','golden-hour':'Golden Hour','landscape':'Landscape','macro-photography':'Macro','print-media':'Print Media','promotional-design':'Promotional','social-media-design':'Social Media','video-production':'Video Production'};
const overviewCopy={
'photography':['Photography','Exterior, details, completed houses and drone imagery.'],
'print-media':['Print Media','Vinyl signage, foam boards and offline communication.'],
'promotional-design':['Promotional Design','Seasonal campaigns, sales promotions and campaign key visuals.'],
'social-media-design':['Social Media Design','House-style series, regional covers and social campaign systems.'],
'video-production':['Video Production','Real-estate reels, construction stories and motion booth content.']
};
function keyFor(p){if(p.category_key)return p.category_key;if(p.category==='Motion Graphics 2D')return'motion-2d';if(p.category==='Photography')return'photography';if(p.category==='Graphic Design')return'graphic-design';if((p.slug||'').includes('real-estate')||p.category==='Featured Case Study')return'real-estate';return'other'}
function subKeyFor(p){if(p.subcategory)return p.subcategory;if(keyFor(p)==='photography'&&p.slug==='golden-hour-studies')return'golden-hour';return'all'}
function updateURL(){const u=new URL(location.href);active==='all'?u.searchParams.delete('category'):u.searchParams.set('category',active);sub==='all'?u.searchParams.delete('sub'):u.searchParams.set('sub',sub);history.replaceState({},'',u)}
function renderFilters(all){document.getElementById('mainFilters').innerHTML=mainOrder.map(k=>`<button class="filter-btn ${active===k?'is-active':''}" data-main="${k}">${labels[k]}</button>`).join('');const cfg=categories[active];document.getElementById('subFilters').innerHTML=cfg?.subs?cfg.subs.map(k=>`<button class="filter-btn ${sub===k?'is-active':''}" data-sub="${k}">${labels[k]}</button>`).join(''):'';document.getElementById('pageTitle').textContent=cfg?.title||'All Works';document.getElementById('pageIntro').textContent=cfg?.intro||'';document.querySelectorAll('[data-main]').forEach(b=>b.onclick=()=>{active=b.dataset.main;sub='all';updateURL();render(all)});document.querySelectorAll('[data-sub]').forEach(b=>b.onclick=()=>{sub=b.dataset.sub;updateURL();render(all)})}
function renderOverview(items){const host=document.getElementById('categoryOverview');if(!host)return;if(active!=='real-estate'||sub!=='all'){host.innerHTML='';host.style.display='none';return}host.style.display='grid';host.innerHTML=categories['real-estate'].subs.filter(k=>k!=='all').map((k,i)=>{const count=items.filter(p=>subKeyFor(p)===k).length;const copy=overviewCopy[k]||[labels[k], ''];return `<button class="overview-card" data-overview="${k}"><span class="overview-index">0${i+1}</span><div><h3>${copy[0]}</h3><p>${copy[1]}</p><small>${count} curated ${count===1?'collection':'collections'} →</small></div></button>`}).join('');host.querySelectorAll('[data-overview]').forEach(b=>b.onclick=()=>{sub=b.dataset.overview;updateURL();render(items)})}
function card(p,i){const badge=p.media_type==='video'||p.video_embed_url?'<span class="media-badge">▶ VIDEO</span>':'';const visual=p.image_url?`<div class="visual">${badge}<img src="${p.image_url}" alt="${p.title}" loading="lazy" onerror="this.parentElement.classList.add('gradient-1');this.remove()"></div>`:`<div class="visual gradient-1">${badge}<div class="ghost">${p.title}</div></div>`;const href=p.category_key?`collection.html?id=${encodeURIComponent(p.id)}`:`project.html?project=${encodeURIComponent(p.slug||p.id)}`;return `<a class="card archive-card ${i<2?'featured':''}" data-cursor="OPEN" href="${href}">${visual}<div class="meta"><div class="kicker">${p.category||'Project'}</div><div class="meta-head"><h3>${p.title}</h3><span class="arrow">↗</span></div><p>${p.description||''}</p></div></a>`}
function render(all){renderFilters(all);const categoryItems=active==='all'?all:all.filter(p=>keyFor(p)===active);renderOverview(categoryItems);let items=categoryItems;if(sub!=='all')items=items.filter(p=>subKeyFor(p)===sub);document.getElementById('archiveCount').textContent=`${items.length} curated ${items.length===1?'project':'projects'}`;const grid=document.getElementById('archiveGrid');grid.innerHTML=items.map(card).join('');document.getElementById('emptyState').style.display=items.length?'none':'block';document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'))}
Promise.all([
fetch('./projects.json',{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
fetch('./archive-data.json',{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
fetch('./real-estate-extra.json',{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[]),
fetch('./graphic-design-data.json',{cache:'no-store'}).then(r=>r.ok?r.json():[]).catch(()=>[])
]).then(([projects,archive,realEstateExtra,graphicDesign])=>render([
...(Array.isArray(projects)?projects:[]),
...(Array.isArray(archive)?archive:[]),
...(Array.isArray(realEstateExtra)?realEstateExtra:[]),
...(Array.isArray(graphicDesign)?graphicDesign:[])
]));