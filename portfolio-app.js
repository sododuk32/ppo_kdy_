// ===== Portfolio app =====
(function(){
  'use strict';
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>[...r.querySelectorAll(s)];

  const ICONS = {
    mono:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    server:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2"/><line x1="6" y1="6.5" x2="6.01" y2="6.5"/><line x1="6" y1="17.5" x2="6.01" y2="17.5"/></svg>',
    git:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/><circle cx="18" cy="6" r="3"/></svg>',
    sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
  };

  // ---------- node-edge diagram ----------
  function diagramHTML(p){
    if(!p.nodes || !p.nodes.length) return '';
    const zones = (p.zones||[]).map(z=>`<div class="dzone" style="left:${z.x}%;top:${z.y}%;width:${z.w}%;height:${z.h}%"><span class="dzone-l">${z.label}</span></div>`).join('');
    const nodes = p.nodes.map(n=>`<div class="node ${n.t||''}" data-nx="${n.x}" data-ny="${n.y}" style="left:${n.x}%;top:${n.y}%"><span class="nd"></span>${n.l}</div>`).join('');
    return `<div class="dgrid"></div>${zones}<svg class="dsvg" style="position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none"><defs><marker id="da-${p.id}" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto-start-reverse"><path d="M0,0 L8,4.5 L0,9 z" fill="var(--accent)"/></marker></defs></svg>${nodes}`;
  }
  function drawDiagramEdges(box, p){
    const svg = box.querySelector('.dsvg'); if(!svg) return;
    if(!p.nodes || !p.edges) return;
    const NS='http://www.w3.org/2000/svg';
    svg.querySelectorAll('path.de, text.delabel').forEach(x=>x.remove());
    const W = box.clientWidth, H = box.clientHeight;
    function center(i){ const n=p.nodes[i]; return [n.x/100*W, n.y/100*H]; }
    p.edges.forEach(e=>{
      const a=e[0], b=e[1], opt=e[2];
      const bi = opt==='bi' || (opt && opt.bi);
      const label = (opt && typeof opt==='object' && opt.label) ? opt.label : '';
      const [ax,ay]=center(a), [bx,by]=center(b);
      const dx=(bx-ax)*0.5;
      const d=`M ${ax} ${ay} C ${ax+dx} ${ay}, ${bx-dx} ${by}, ${bx} ${by}`;
      const path=document.createElementNS(NS,'path');
      path.setAttribute('d',d); path.setAttribute('class','de');
      path.setAttribute('fill','none'); path.setAttribute('stroke','var(--accent)');
      path.setAttribute('stroke-width','1.6'); path.setAttribute('opacity','.55');
      svg.insertBefore(path, svg.firstChild.nextSibling);
      if(label){
        const t=document.createElementNS(NS,'text');
        t.setAttribute('x',(ax+bx)/2); t.setAttribute('y',(ay+by)/2);
        t.setAttribute('class','delabel'); t.setAttribute('text-anchor','middle');
        t.setAttribute('dominant-baseline','middle'); t.textContent=label;
        svg.appendChild(t);
      }
    });
  }

  // resolve a project OR research item by id (둘 다 같은 node/edge 규격)
  // id가 '<projId>~<key>'면 해당 프로젝트의 보조 다이어그램(diagrams)을 반환
  function findById(id){
    if(id && id.indexOf('~')>=0){
      const [pid,key]=id.split('~');
      const base=(window.PROJECTS||[]).find(x=>x.id===pid);
      if(!base) return null;
      if(key.indexOf('wfig-')===0){ // work item 내 아키텍처 도면 (변경 전/후 등)
        const [,wi,fj]=key.split('-');
        const w=base.work&&base.work[+wi];
        const f=w&&w.figures&&w.figures[+fj];
        return f ? {id, nodes:f.nodes, edges:f.edges} : null;
      }
      const g=base.diagrams&&base.diagrams.find(d=>d.key===key);
      return g ? {id, nodes:g.nodes, edges:g.edges} : null;
    }
    return (window.PROJECTS||[]).find(x=>x.id===id) || (window.RESEARCH||[]).find(x=>x.id===id);
  }

  // ---------- render: chips ----------
  function renderChips(){
    const host = $('#chipbar'); if(!host) return;
    host.innerHTML = window.CHIPS.map(row=>
      '<div class="chiprow">'+row.map(c=>
        `<span class="chip ${c.s?'struct':''}" data-ps="${(c.ps||[]).join(',')}">${c.t}</span>`
      ).join('')+'</div>'
    ).join('');
    let res = $('#chipResults');
    if(!res){ res=document.createElement('div'); res.id='chipResults'; host.parentNode.insertBefore(res, host.nextSibling); }
    res.innerHTML='';
    $$('.chip',host).forEach(ch=>ch.addEventListener('click',()=>{
      $$('.chip',host).forEach(x=>x.classList.remove('on'));
      ch.classList.add('on');
      const ids=(ch.dataset.ps||'').split(',').filter(Boolean);
      const projs=ids.map(id=>(window.PROJECTS||[]).find(x=>x.id===id)).filter(Boolean);
      const hasCV=ids.includes('cv');
      const total=projs.length+(hasCV?1:0);
      if(!total){ res.innerHTML='<div class="chipres-h">매칭 프로젝트 없음</div>'; return; }
      res.innerHTML = `<div class="chipres-h">${ch.textContent.trim()} · ${total}건</div>`
        + projs.map((p,i)=>`<button class="chipres-item" data-id="${p.id}" style="animation-delay:${(i+1)*45}ms"><span class="cri-name">${p.name}</span><span class="cri-meta">${p.year}</span></button>`).join('')
        + (hasCV?`<button class="chipres-item" data-cv="1" style="animation-delay:${(projs.length+1)*45}ms"><span class="cri-name">경력 · 프로젝트</span><span class="cri-meta">2023–2025 · 경력 섹션 보기</span></button>`:'');
      $$('.chipres-item',res).forEach(it=>it.addEventListener('click',()=>{
        if(it.dataset.cv){ const el=$('#career'); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); return; }
        const p=(window.PROJECTS||[]).find(x=>x.id===it.dataset.id);
        if(p) openDetail(p);
      }));
    }));
  }

  // ---------- render: skills ----------
  function renderSkills(){
    const host = $('#skillsGrid'); if(!host) return;
    host.innerHTML = window.SKILLS.map(s=>
      `<div class="skill-card glass-sm reveal">
        <div class="sc-h"><div class="sc-ic">${ICONS[s.icon]||''}</div><div><h3>${s.title}</h3><div class="sc-sub">/* ${s.sub} */</div></div></div>
        <ul class="skill-list">${s.rows.map(r=>`<li>${r.nm}</li>`).join('')}</ul>
      </div>`).join('');
  }

  // ---------- 프로젝트 소개 (about: 비기술 · 전체 설명) ----------
  const ABOUT_ROWS = [
    ['what',    '무엇을'],
    ['problem', '왜'],
    ['role',    '내 역할'],
    ['outcome', '결과'],
  ];
  const ABOUT_META = [['period','기간'],['team','팀 구성'],['client','대상']];
  function aboutHTML(p){
    const a = p.about; if(!a) return '';
    const rows = ABOUT_ROWS.filter(([k])=>a[k]).map(([k,label])=>
      `<div class="dp-about-row"><div class="dp-about-k">${label}</div><div class="dp-about-v">${a[k]}</div></div>`).join('');
    const m = a.meta||{};
    const chips = ABOUT_META.filter(([k])=>m[k]).map(([k,label])=>`<span>${label} · ${m[k]}</span>`).join('');
    if(!rows && !chips) return '';
    return `<div class="dp-about">
      <div class="dp-about-h">프로젝트 소개 <span class="fmt">overview</span></div>
      ${rows}
      ${chips?`<div class="dp-about-meta">${chips}</div>`:''}
    </div>`;
  }

  // ---------- render: projects ----------
  function renderProjects(){
    const col = $('#projCol'); if(!col) return;
    col.innerHTML = window.PROJECTS.map(p=>{
      const stk = p.stack.map(s=>`<span class="stk">${s}</span>`).join('');
      const subTitles = (p.work||[]).map(w=>(w&&typeof w==='object')?w.title:w);
      const subs = subTitles.map(t=>`<li>${t}<span class="ar">›</span></li>`).join('');
      return `<div class="pcard glass reveal" data-id="${p.id}">
        <div class="ptop"><div><span class="pname">${p.name}</span></div><span class="pyear">${p.year}</span></div>
        ${(p.about&&p.about.tagline)?`<div class="ptag">${p.about.tagline}</div>`:''}
        <div class="psum">${p.summary}</div>
        <div class="lbl">기술 스택</div><div class="stack">${stk}</div>
        ${(p.nodes&&p.nodes.length)?`<div class="lbl">아키텍처</div>
        <div class="diag-scroll"><div class="diag-box" data-id="${p.id}">${diagramHTML(p)}</div></div>`:''}
        <div class="lbl">세부 항목 <span style="font-family:var(--font-mono);color:var(--ink-faint);text-transform:none;letter-spacing:0">· 제목만</span></div>
        <ul class="sublist">${subs}</ul>
        <div class="open-cue">상세 페이지 열기 <span class="ar">→</span></div>
      </div>`;
    }).join('');
    // draw card diagrams
    window.PROJECTS.forEach(p=>{
      const box = col.querySelector(`.diag-box[data-id="${p.id}"]`);
      if(box) requestAnimationFrame(()=>drawDiagramEdges(box,p));
    });
    // click → detail
    $$('.pcard',col).forEach(card=>card.addEventListener('click',()=>{
      const p = window.PROJECTS.find(x=>x.id===card.dataset.id);
      if(p) openDetail(p);
    }));
    requestAnimationFrame(drawFlow); setTimeout(drawFlow,250);
  }

  // ---------- render: research (기술 연구) ----------
  function renderResearch(){
    const host=$('#researchCol'); if(!host) return;
    host.innerHTML = (window.RESEARCH||[]).map(r=>{
      const stk = r.stack.map(s=>`<span class="stk">${s}</span>`).join('');
      const topics = r.topics.map(t=>`<li>${t}<span class="ar">›</span></li>`).join('');
      return `<div class="rcard glass reveal">
        <div class="rtop"><span class="rname">${r.title}</span><span class="rstatus">연구 · 대상 미정</span><span class="ryr">${r.tag||''}</span></div>
        <div class="rsum">${r.summary}</div>
        <div class="lbl">사용 기술</div><div class="stack">${stk}</div>
        <div class="lbl">구조 다이어그램</div>
        <div class="diag-scroll"><div class="diag-box" data-id="${r.id}">${diagramHTML(r)}</div></div>
        <div class="lbl">적용 후보 주제</div>
        <ul class="sublist">${topics}</ul>
        <div class="rappeal"><span class="rappeal-h">핵심 어필</span>${r.appeal}</div>
      </div>`;
    }).join('');
    (window.RESEARCH||[]).forEach(r=>{
      const box=host.querySelector(`.diag-box[data-id="${r.id}"]`);
      if(box) requestAnimationFrame(()=>drawDiagramEdges(box,r));
    });
  }

  // narrative item titles per project kind
  function detailItemTitles(p){
    if(p.kind==='build') return ['어떤 구조의 프로젝트','어떤 작업을 했나','구조 결정 이유'];
    return ['어떤 구조의 프로젝트','어떤 작업을 했나','해결한 문제 (As-Is → To-Be)','결과 · 성과'];
  }

  // ---------- flow connectors between cards ----------
  function drawFlow(){
    const svg=$('#flowSvg'), host=$('#projflow'); if(!svg||!host) return;
    svg.querySelectorAll('path.fl').forEach(p=>p.remove());
    const hb=host.getBoundingClientRect();
    const cards=$$('.pcard',host);
    for(let i=0;i<cards.length-1;i++){
      const a=cards[i].getBoundingClientRect(), b=cards[i+1].getBoundingClientRect();
      const ax=a.left-hb.left+a.width/2, ay=a.bottom-hb.top;
      const bx=b.left-hb.left+b.width/2, by=b.top-hb.top;
      const my=(ay+by)/2;
      const d=`M ${ax} ${ay+2} C ${ax} ${my}, ${bx} ${my}, ${bx} ${by-4}`;
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d',d); path.setAttribute('class','fl');
      path.setAttribute('fill','none'); path.setAttribute('stroke','var(--accent)');
      path.setAttribute('stroke-width','2'); path.setAttribute('stroke-dasharray','2 7');
      path.setAttribute('stroke-linecap','round'); path.setAttribute('opacity','.65');
      svg.appendChild(path);
    }
  }

  // ---------- render: timeline ----------
  function renderTimeline(){
    const host=$('#timeline'); if(!host) return;
    const blocks=[];
    window.CAREER.forEach(c=>{
      const stackHtml = (c.stack||[]).map(s=>`<span class="stk">${s}</span>`).join('');
      const dutyHtml = (c.duties||[]).map(d=>`<li>${d}</li>`).join('');
      // 회사 · 역할 소개 카드
      blocks.push(`<div class="tlitem cvintro"><div class="tlcard glass">
        <div class="tlhead"><span class="co">${c.co}</span><span class="ro">${c.role}</span><span class="yr">${c.yr}</span></div>
        ${c.desc?`<div class="tldesc">${c.desc}</div>`:''}
        ${dutyHtml?`<div class="cvblock"><span class="lbl">담당 업무</span><ul class="dolist">${dutyHtml}</ul></div>`:''}
        ${stackHtml?`<div class="cvblock"><span class="lbl">사용 기술 스택</span><div class="stack">${stackHtml}</div></div>`:''}
      </div></div>`);
      // 프로젝트별 개별 카드
      (c.projects||[]).forEach(pr=>{
        const secHtml = (pr.sections||[]).map(s=>`<div class="wsec"><div class="wsec-h">${s.h}</div><ul class="dolist">${s.items.map(t=>`<li>${t}</li>`).join('')}</ul></div>`).join('');
        const itemHtml = (pr.items&&pr.items.length) ? `<ul class="dolist">${pr.items.map(t=>`<li>${t}</li>`).join('')}</ul>` : '';
        const prStack = (pr.stack||[]).map(s=>`<span class="stk">${s}</span>`).join('');
        const stackBlock = prStack ? `<div class="cv-stack"><span class="lbl">사용 기술</span><div class="stack">${prStack}</div></div>` : '';
        const inner = `${secHtml}${itemHtml}${stackBlock}`;
        const toggle = inner ? `<div class="cvtoggle"><span class="car">▸</span> 세부 · 성과 보기</div><div class="cvbody">${inner}</div>` : '';
        blocks.push(`<div class="tlitem cvcard"><div class="tlcard glass">
          <div class="cvproj-h"><span class="cvp-t">${pr.title}</span><span class="cvp-p">${pr.period||''}</span></div>
          ${pr.overview?`<p class="cvp-ov">${pr.overview}</p>`:''}
          ${toggle}
        </div></div>`);
      });
    });
    host.innerHTML = blocks.join('');
    $$('#timeline .cvtoggle').forEach(tg=>tg.addEventListener('click',()=>{
      tg.classList.toggle('open');
      const b=tg.nextElementSibling;
      if(b&&b.classList.contains('cvbody')) b.classList.toggle('open');
    }));
  }

  // ---------- render: ways ----------
  function renderWays(){
    const host=$('#waysGrid'); if(!host) return;
    host.innerHTML = window.WAYS.map((w,i)=>
      `<div class="way glass-sm reveal"><div class="wn">${w.n}</div><h3>${w.t}</h3><p>${w.p}</p>${i<2?'<span class="warw">→</span>':''}</div>`).join('');
  }

  // ---------- DETAIL PAGE ----------
  const detailPage=$('#detailPage');
  function bodyForKind(p){
    const sec=(no,ti,fmt,inner)=>
      `<div class="ditem"><div class="ditem-h"><span class="no">${no}</span><span class="ti">${ti}</span><span class="fmt">${fmt}</span></div>${inner}</div>`;
    const out=[];
    const norm = v => Array.isArray(v) ? v.filter(Boolean) : (v ? [v] : []);
    // 순번(①.. 또는 (1)..)이 있으면 한 줄씩 분리
    const NUMRE = /^(\(\s*\d+\s*\)|[①-⑳])/;
    // 번호로 '시작'하는 문자열만 목록으로 간주. 산문이 본문에서 (4)·(5)처럼
    // 항목을 참조만 하는 경우까지 쪼개지 않도록 NUMRE 를 먼저 통과시킨다.
    const splitNum = t => (typeof t!=='string' || !NUMRE.test(t)) ? [t]
      : ((t.match(/[①-⑳]/g)||[]).length>=2) ? t.split(/(?=[①-⑳])/).map(s=>s.trim()).filter(Boolean)
      : ((t.match(/\(\s*\d+\s*\)/g)||[]).length>=2) ? t.split(/(?=\(\s*\d+\s*\))/).map(s=>s.trim()).filter(Boolean)
      : [t];
    const field = (label,cls,val) => {
      const items = norm(val).flatMap(splitNum);
      if(!items.length) return '';
      if(items.length===1) return `<div class="wf"><span class="wfl ${cls}">${label}</span><p>${items[0]}</p></div>`;
      const lis = items.map(t=>`<li class="${NUMRE.test(t)?'num':''}">${t}</li>`).join('');
      return `<div class="wf"><span class="wfl ${cls}">${label}</span><ul class="dolist">${lis}</ul></div>`;
    };

    // 1. 핵심 기능 — depth3: 제목 + 한 줄 요약(brief) / depth4: 배경·한 일·도면 '세부 보기'로 접음
    const work = `<div class="worklist2">${p.work.map((w,i)=>{
      const isObj = w && typeof w==='object';
      const title = isObj ? w.title : w;
      const brief = isObj ? (w.brief||'') : '';
      const tag = isObj ? (w.tag||'') : '';
      const tk = !tag ? '' : (tag==='V1' ? 'v1' : (tag.indexOf('→')>=0 ? 'mix' : 'v2'));
      const tagHtml = tag ? `<span class="wtag wtag-${tk}">${tag}</span>` : '';
      const bg = isObj ? w.background : '';
      const dos = isObj ? w.detail : '';
      const figs = (isObj && w.figures) ? w.figures : [];
      const briefHtml = brief ? `<p class="wi-brief">${brief}</p>` : '';
      const bgHtml = field('배경','bg',bg);
      const doHtml = field('한 일','do',dos);
      const figHtml = figs.map((f,j)=>{
        const fid=p.id+'~wfig-'+i+'-'+j;
        return `<div class="fig-block"><div class="fig-cap">${f.title||''}</div><div class="diag-scroll"><div class="diag-box" data-id="${fid}">${diagramHTML({id:fid,nodes:f.nodes,edges:f.edges,zones:f.zones})}</div></div></div>`;
      }).join('');
      const figWrap = figHtml ? `<div class="figrow">${figHtml}</div>` : '';
      // sections: {h, items[]} 그룹형 세부 (수집/가공/점수 등)
      const secs = (isObj && w.sections) ? w.sections : [];
      const secHtml = secs.map(s=>{
        const lis = norm(s.items).flatMap(splitNum).map(t=>`<li class="${NUMRE.test(t)?'num':''}">${t}</li>`).join('');
        return `<div class="wsec"><div class="wsec-h">${s.h}</div><ul class="dolist">${lis}</ul></div>`;
      }).join('');
      // 실제 화면 스크린샷 (클릭 시 라이트박스 확대)
      const shots = (isObj && w.shots) ? w.shots : [];
      const shotHtml = shots.length ? `<div class="shotrow">${shots.map(s=>`<figure class="shot"><img src="${s.src}" alt="${(s.cap||'').replace(/"/g,'&quot;')}" loading="lazy"><figcaption>${s.cap||''}</figcaption></figure>`).join('')}</div>` : '';
      let expand = '';
      if(bgHtml||doHtml||secHtml||figWrap||shotHtml){
        expand = `<div class="d4toggle"><span class="car">▸</span> 세부 보기</div><div class="d4">${bgHtml}${doHtml}${secHtml}${figWrap}${shotHtml}</div>`;
      }
      return `<div class="witem"><div class="wi-h"><span class="wn">${i+1}</span><span class="wt">${title}</span>${tagHtml}</div>${briefHtml}${expand}</div>`;
    }).join('')}</div>`;
    out.push(sec(1,'핵심 기능','제목·요약 · 세부는 펼치기', work));

    // 2. 결과 · 성과 (지표가 있을 때만)
    let n=2;
    if(p.metrics && p.metrics.length){
      const metrics = `<div class="metrics">${p.metrics.map(m=>`<div class="metric"><div class="big">${m.big}</div><div class="cap">${m.cap}</div></div>`).join('')}</div>`;
      out.push(sec(n++,'결과 · 성과','지표', metrics));
    }

    // 3. 실제 화면 (제품·대시보드 스크린샷) — 성과 영역
    if(p.shots && p.shots.length){
      const note = p.shotsNote ? `<p class="shot-note">${p.shotsNote}</p>` : '';
      const gallery = `<div class="shot-gallery">${p.shots.map(s=>`<figure class="shot"><img src="${s.src}" alt="${(s.cap||'').replace(/"/g,'&quot;')}" loading="lazy"><figcaption>${s.cap||''}</figcaption></figure>`).join('')}</div>`;
      out.push(sec(n++,'실제 화면','대시보드 · 스크린샷', note+gallery));
    }

    // 4. 보조 다이어그램 (구독 갱신 · 배포 구조 등)
    if(p.diagrams && p.diagrams.length){
      p.diagrams.forEach(g=>{
        const did=p.id+'~'+g.key;
        const cls='diag-box'+(g.flat?' deploy-box':'');
        const box=`<div class="diag-scroll"><div class="${cls}" data-id="${did}">${diagramHTML({id:did,nodes:g.nodes,edges:g.edges})}</div></div>`;
        out.push(sec(n++, g.title, g.fmt||'', box));
      });
    }
    return out.join('');
  }
  function openDetail(p){
    $('#dpCrumb').textContent=p.name;
    $('#dpTitle').textContent=p.name;
    $('#dpYear').textContent=p.year;
    $('#dpStack').innerHTML=p.stack.map(s=>`<span class="stk">${s}</span>`).join('');
    const tagEl=$('#dpTagline');
    if(tagEl){ const tl=(p.about&&p.about.tagline)||''; tagEl.innerHTML=tl; tagEl.style.display=tl?'':'none'; }
    const abEl=$('#dpAbout');
    if(abEl){ const ab=aboutHTML(p); abEl.innerHTML=ab; abEl.style.display=ab?'':'none'; }
    const techH=$('#dpTechH'); if(techH) techH.style.display=p.overview?'':'none';
    $('#dpOverview').textContent=p.overview;
    $('#dpStructWrap').innerHTML=`<span class="dp-struct-chip"><span style="width:7px;height:7px;border-radius:2px;background:var(--struct);display:inline-block"></span> 구조 유형 · ${p.struct}</span>`;
    const diag=$('#dpDiag');
    const diagScroll=diag.closest('.diag-scroll');
    const archH=diagScroll?diagScroll.previousElementSibling:null;
    if(p.nodes && p.nodes.length){
      if(diagScroll) diagScroll.style.display='';
      if(archH && archH.classList.contains('dp-arch-h')) archH.style.display='';
      diag.classList.toggle('tall', !!p.bigDiag); diag.innerHTML=diagramHTML(p);
      requestAnimationFrame(()=>drawDiagramEdges(diag,p));
      setTimeout(()=>drawDiagramEdges(diag,p),80);
    } else {
      diag.innerHTML='';
      if(diagScroll) diagScroll.style.display='none';
      if(archH && archH.classList.contains('dp-arch-h')) archH.style.display='none';
    }
    const body=$('#dpBody'); body.innerHTML=bodyForKind(p);
    // wire "세부 보기"(depth4) — 배경·한 일·도면 펼치기/접기
    $$('.d4toggle',body).forEach(tg=>tg.addEventListener('click',()=>{
      tg.classList.toggle('open');
      const d4=tg.nextElementSibling;
      if(!d4 || !d4.classList.contains('d4')) return;
      d4.classList.toggle('open');
      if(d4.classList.contains('open')){ // 펼쳐질 때 내부 도면(변경 전/후) 그리기
        $$('.diag-box',d4).forEach(b=>{
          const dg=findById(b.dataset.id);
          if(dg){ requestAnimationFrame(()=>drawDiagramEdges(b,dg)); setTimeout(()=>drawDiagramEdges(b,dg),60); }
        });
      }
    }));
    // draw any embedded diagrams in the body (배포 구조 등)
    $$('.diag-box',body).forEach(b=>{
      const dg=findById(b.dataset.id);
      if(dg){ requestAnimationFrame(()=>drawDiagramEdges(b,dg)); setTimeout(()=>drawDiagramEdges(b,dg),80); }
    });
    detailPage.classList.add('on');
    const dsc=$('#dpScroll'); if(dsc) dsc.scrollTop=0;
    document.body.style.overflow='hidden';
    history.pushState({detail:p.id},'', '#'+p.id);
  }
  function closeDetail(){
    detailPage.classList.remove('on');
    document.body.style.overflow='';
    if(location.hash) history.replaceState(null,'',location.pathname+location.search);
  }
  $('#backBtn').addEventListener('click',()=>{ closeDetail(); });
  window.addEventListener('popstate',()=>{ if(detailPage.classList.contains('on')) closeDetail(); });

  // ---------- nav ----------
  $$('#nav a[data-go]').forEach(a=>a.addEventListener('click',e=>{
    e.preventDefault();
    const el=document.getElementById(a.dataset.go);
    if(el) window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-70, behavior:'smooth'});
  }));

  // ---------- theme ----------
  const root=document.documentElement, tt=$('#themeToggle');
  let themeAnimT=null;
  function setTheme(t,animate){
    if(animate){ // 최초 로드에는 걸지 않는다 — 첫 페인트가 번져 보임
      root.classList.add('theme-anim');
      clearTimeout(themeAnimT);
      themeAnimT=setTimeout(()=>root.classList.remove('theme-anim'),500);
    }
    root.setAttribute('data-theme',t);
    tt.innerHTML = t==='dark' ? ICONS.sun : ICONS.moon;
    try{localStorage.setItem('pf_theme',t);}catch(e){}
    setTimeout(()=>{ drawFlow(); document.querySelectorAll('.diag-box,.dp-diag').forEach(b=>{ const id=b.dataset.id; const p=findById(id)|| (detailPage.classList.contains('on')&&window.PROJECTS.find(x=>x.name===$('#dpTitle').textContent)); if(p) drawDiagramEdges(b,p); }); },60);
  }
  let savedTheme='light'; try{savedTheme=localStorage.getItem('pf_theme')||'light';}catch(e){}
  setTheme(savedTheme);
  tt.addEventListener('click',()=>setTheme(root.getAttribute('data-theme')==='dark'?'light':'dark',true));

  // ---------- tutorial ----------
  const TUT=[
    {t:'위에서부터 훑어 내려오세요', b:'상단 <b>키워드 칩</b>을 누르면 그 키워드가 쓰인 <b>프로젝트 상세 페이지</b>로 바로 이동합니다. 칩은 <b>실선=기술명</b>, <b>점선=구조·설계 키워드</b>예요. 위쪽 메뉴로 섹션 사이도 빠르게 오갈 수 있습니다.'},
    {t:'프로젝트는 깊이별로 열립니다', b:'목록 카드는 <b>제목만(1depth)</b> 보여줘요. 카드를 누르면 <b>별도 상세 페이지</b>로 넘어가 구조·작업·해결한 문제(2depth)가 펼쳐지고, 각 항목의 <b>내용 펼치기</b>로 설계도·세부 내용(3depth)이 그 자리에서 열립니다.'},
  ];
  const tut=$('#tut'), tutCard=$('#tutCard'); let ti=0;
  function renderTut(){
    $('#tutStep').textContent='STEP '+(ti+1)+' / '+TUT.length;
    $('#tutTitle').textContent=TUT[ti].t;
    $('#tutBody').innerHTML=TUT[ti].b;
    $('#tutDots').innerHTML=TUT.map((_,i)=>`<i class="${i===ti?'a':''}"></i>`).join('');
    $('#tutNext').textContent= ti<TUT.length-1 ? '다음 →' : '시작하기 ✓';
    const sl=$('#tutSlide'); // step 전환 애니메이션 재생 (reflow로 재트리거)
    if(sl){ sl.classList.remove('tut-in'); void sl.offsetWidth; sl.classList.add('tut-in'); }
  }
  function openTut(){ ti=0; renderTut(); tut.classList.add('on'); }
  function closeTut(){ tut.classList.remove('on'); try{localStorage.setItem('pf_tut','1');}catch(e){} }
  function advTut(){ if(ti<TUT.length-1){ ti++; renderTut(); } else closeTut(); }
  $('#tutNext').addEventListener('click',e=>{e.stopPropagation(); advTut();});
  $('#tutSkip').addEventListener('click',e=>{e.stopPropagation(); closeTut();});
  tut.addEventListener('click',e=>{ if(e.target===tut) advTut(); });
  tutCard.addEventListener('click',e=>{ if(e.target===tutCard) advTut(); });
  $('#replayTut').addEventListener('click',openTut);

  // ---------- reveal (no-op; content always visible) ----------
  function checkReveal(){}
  function initReveal(){}

  // ---------- init ----------
  renderChips(); renderSkills(); renderProjects(); renderTimeline(); renderWays();
  initReveal();
  // 다이어그램 가로 스크롤러(.diag-scroll)가 세로 휠을 삼켜 depth-3 페이지 스크롤이 막히는 문제 방지 —
  // 세로 휠은 상세 페이지(또는 문서)로 넘기고, 가로 의도만 다이어그램이 처리하게 함
  document.addEventListener('wheel', (e)=>{
    const sc = e.target && e.target.closest && e.target.closest('.diag-scroll');
    if(!sc) return;
    if(Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // 가로 스크롤 의도는 그대로 둠
    const scroller = sc.closest('.dp-scroll') || document.scrollingElement || document.documentElement;
    scroller.scrollTop += e.deltaY;
    e.preventDefault();
  }, { passive:false });
  // 스크린샷 라이트박스 (클릭 확대 / 배경·ESC 닫기)
  const lb = document.getElementById('lightbox');
  if(lb){
    const lbImg = lb.querySelector('img');
    document.addEventListener('click', (e)=>{
      const img = e.target && e.target.closest && e.target.closest('.shot img');
      if(img){ lbImg.src = img.getAttribute('src'); lb.classList.add('on'); return; }
      if(e.target===lb || e.target===lbImg) lb.classList.remove('on');
    });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') lb.classList.remove('on'); });
  }
  window.addEventListener('resize',()=>{
    drawFlow();
    document.querySelectorAll('.diag-box').forEach(b=>{ const p=findById(b.dataset.id); if(p) drawDiagramEdges(b,p); });
    const dp=$('#dpDiag'); if(detailPage.classList.contains('on')&&dp){ const p=window.PROJECTS.find(x=>x.name===$('#dpTitle').textContent); if(p) drawDiagramEdges(dp,p); }
  });
  // first-visit tutorial
  let seen=null; try{seen=localStorage.getItem('pf_tut');}catch(e){}
  if(!seen) setTimeout(openTut,500);
})();
