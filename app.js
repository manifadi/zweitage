function start(DATA){
  const RUB = {}; DATA.rubrics.forEach(r => RUB[r.key] = r);
  const ISSUES = DATA.issues;
  const ALL = []; const BY_ID = {};
  ISSUES.forEach(is => is.articles.forEach(a => { a.issue = is; ALL.push(a); BY_ID[a.id] = a; }));
  const app = document.getElementById('app');
  const tabbar = document.getElementById('tabbar');
  const FOCUS = ['oesterreich','wirtschaft','sport'];
  const MONTHS = ['Jän.','Feb.','März','Apr.','Mai','Juni','Juli','Aug.','Sept.','Okt.','Nov.','Dez.'];
  let filter = 'alle'; let curIssue = null;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const col = r => 'var(--c-' + r + ')';
  const shortDate = id => { const p = id.split('-'); return (+p[2]) + '. ' + MONTHS[+p[1]-1]; };
  const readMin = a => Math.max(2, Math.round((a.lead + ' ' + a.body.join(' ')).split(/\s+/).length / 200));
  const ico = {
    arrow:'<svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    back:'<svg class="i" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    link:'<svg class="i" viewBox="0 0 24 24"><path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/></svg>',
    home:'<svg class="i" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z"/></svg>',
    flag:'<svg class="i" viewBox="0 0 24 24"><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>',
    chart:'<svg class="i" viewBox="0 0 24 24"><path d="M4 19h16M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/></svg>',
    ball:'<svg class="i" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z"/></svg>',
    archive:'<svg class="i" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="5" rx="1.5"/><path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4"/></svg>'
  };
  const MARK = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="15" fill="var(--accent)"/><path d="M10 22.5 16.5 9.5M15.5 22.5l6.5-13" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>';

  /* ---------- fallback cover art ---------- */
  function seedRand(str){ let h = 2166136261; for (let i=0;i<str.length;i++){ h ^= str.charCodeAt(i); h = Math.imul(h,16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h>>>0) % 10000)/10000; }; }
  let uidc = 0;
  function art(a){
    const c = getComputedStyle(document.documentElement).getPropertyValue('--c-' + a.r).trim() || '#888';
    const R = seedRand(a.id); const u = 'g' + (uidc++);
    const fg = 'style="fill:var(--art-fg)"';
    let s = '';
    const W = 800, H = 500;
    switch(a.art){
      case 'drop': { const pts = []; let y = 330;
        for (let i=0;i<=12;i++){ y += (R()-0.62)*42; y = Math.max(110, Math.min(360,y)); pts.push([20+i*46, y]); }
        pts.push([620, 150]); pts.push([670, 400]);
        const d = pts.map((p,i)=> (i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
        s += '<path d="'+d+' L670 500 L20 500 Z" fill="'+c+'" opacity=".14"/><path d="'+d+'" fill="none" stroke="'+c+'" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="670" cy="400" r="14" fill="'+c+'"/>'; break; }
      case 'cloud': { for (let i=0;i<8;i++){ const h = 70 + i*38 + R()*20; const x = 70 + i*86; const last = i===7;
          s += '<rect x="'+x+'" y="'+(440-h)+'" width="62" height="'+h+'" rx="18" '+(last?'fill="'+c+'"':fg+' opacity="'+(0.08+i*0.025)+'"')+'/>'; } break; }
      case 'rings': { for (let i=7;i>=1;i--) s += '<circle cx="400" cy="250" r="'+(i*34)+'" fill="none" style="stroke:var(--art-fg)" stroke-opacity="'+(0.05+0.02*(7-i))+'" stroke-width="2"/>';
        s += '<circle cx="400" cy="250" r="62" fill="'+c+'"/>'; break; }
      case 'chip': { s += '<rect x="270" y="120" width="260" height="260" rx="44" fill="'+c+'"/><rect x="330" y="180" width="140" height="140" rx="26" style="fill:var(--art-bg)" opacity=".9"/><rect x="375" y="225" width="50" height="50" rx="12" fill="'+c+'"/>'; break; }
      case 'grid': { for (let y=0;y<7;y++) for (let x=0;x<12;x++){ const on = (x+y===10)||(x+y===11 && R()>.4); s += '<circle cx="'+(84+x*58)+'" cy="'+(76+y*58)+'" r="'+(on?14:8)+'" '+(on?'fill="'+c+'"':fg+' opacity=".14"')+'/>'; } break; }
      case 'dial': { s += '<path d="M150 400 A250 250 0 0 1 650 400" fill="none" style="stroke:var(--art-fg)" stroke-opacity=".1" stroke-width="44" stroke-linecap="round"/><path d="M150 400 A250 250 0 0 1 512 177" fill="none" stroke="'+c+'" stroke-width="44" stroke-linecap="round"/>'; break; }
      case 'wave': { for (let k=0;k<5;k++){ let d = 'M-20 ' + (150+k*60); for (let x=0;x<=840;x+=20){ d += ' L'+x+' '+(150+k*60 + Math.sin(x/90 + k*.8)*(34-k*4)).toFixed(1); }
          s += '<path d="'+d+'" fill="none" '+(k===0?'stroke="'+c+'" stroke-width="12"':'style="stroke:var(--art-fg)" stroke-opacity="'+(0.16-k*0.025)+'" stroke-width="8"')+' stroke-linecap="round"/>'; } break; }
      case 'eu': { for (let i=0;i<12;i++){ const t = i*Math.PI/6; s += '<circle cx="'+(400+150*Math.cos(t)).toFixed(1)+'" cy="'+(250+150*Math.sin(t)).toFixed(1)+'" r="18" fill="'+c+'"/>'; } break; }
      case 'nodes': { const n = []; for (let i=0;i<14;i++) n.push([90+R()*620, 70+R()*360]);
        for (let i=0;i<n.length;i++) for (let j=i+1;j<n.length;j++){ const dx=n[i][0]-n[j][0], dy=n[i][1]-n[j][1]; if (dx*dx+dy*dy < 40000) s += '<line x1="'+n[i][0].toFixed(0)+'" y1="'+n[i][1].toFixed(0)+'" x2="'+n[j][0].toFixed(0)+'" y2="'+n[j][1].toFixed(0)+'" style="stroke:var(--art-fg)" stroke-opacity=".12" stroke-width="2"/>'; }
        n.forEach((p,i)=> s += '<circle cx="'+p[0].toFixed(0)+'" cy="'+p[1].toFixed(0)+'" r="'+(i<3?20:9)+'" '+(i<3?'fill="'+c+'"':fg+' opacity=".5"')+'/>'); break; }
      case 'ball': { s += '<circle cx="400" cy="250" r="170" fill="'+c+'"/>'; break; }
      case 'pitch': { const st = 'style="stroke:var(--art-fg)" stroke-opacity=".22" stroke-width="5" fill="none"';
        s += '<rect x="70" y="60" width="660" height="380" rx="26" '+st+'/><line x1="400" y1="60" x2="400" y2="440" '+st+'/><circle cx="400" cy="250" r="70" '+st+'/><circle cx="'+(470+R()*120)+'" cy="'+(170+R()*150)+'" r="20" fill="'+c+'"/>'; break; }
      default: s += '<circle cx="400" cy="250" r="120" fill="'+c+'"/>';
    }
    return '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration: '+esc(a.title)+'"><defs><radialGradient id="'+u+'" cx="78%" cy="18%" r="80%"><stop offset="0" stop-color="'+c+'" stop-opacity=".22"/><stop offset=".7" stop-color="'+c+'" stop-opacity="0"/></radialGradient></defs><rect width="'+W+'" height="'+H+'" style="fill:var(--art-bg)"/><rect width="'+W+'" height="'+H+'" fill="url(#'+u+')"/>' + s + '</svg>';
  }
  const hasPhoto = a => !!(a.img && a.img.ph);
  const imgUrl = (a, w) => 'https://images.unsplash.com/' + a.img.ph + '?ixlib=rb-4.1.0&auto=format&fit=crop&q=75&w=' + w;
  const media = (a, big) => '<div class="media">' + (hasPhoto(a) ? '<img src="'+esc(imgUrl(a, big?1800:800))+'" srcset="'+esc(imgUrl(a,600))+' 600w, '+esc(imgUrl(a,1000))+' 1000w, '+esc(imgUrl(a,1800))+' 1800w" sizes="'+(big?'100vw':'(max-width:640px) 82vw, 340px')+'" alt="'+esc(a.img.alt||'')+'" '+(big?'fetchpriority="high"':'loading="lazy"')+' decoding="async">' : art(a)) + '</div>';
  const utm = '?utm_source=zwei_tage&utm_medium=referral';

  /* ---------- pieces ---------- */
  const src = a => '<div class="src"><i style="background:'+col(a.r)+'">'+esc(RUB[a.r].name.slice(0,2).toUpperCase())+'</i>'+esc(RUB[a.r].name)+'<span>· '+esc(a.kicker)+'</span></div>';
  const card = a => '<a class="card" href="#'+a.id+'">'+media(a)+'<div class="body">'+src(a)+'<h3>'+esc(a.title)+'</h3><div class="card-meta"><span>Nr. '+a.issue.nr+' · '+shortDate(a.issue.id)+'</span><span>'+readMin(a)+' Min. Lesezeit</span></div></div></a>';
  const feature = a => '<a class="feature reveal" href="#'+a.id+'">'+media(a, true)+'<div class="over"><span class="badge">Top-Thema</span><h2>'+esc(a.title)+'</h2><p>'+esc(a.lead)+'</p><span class="over-meta">'+esc(RUB[a.r].name)+' · '+readMin(a)+' Min. Lesezeit</span></div></a>';
  const chipsHome = () => '<div class="chips" role="group" aria-label="Rubrik filtern"><button class="chip" type="button" data-f="alle" aria-pressed="'+(filter==='alle')+'">Alle</button>' + DATA.rubrics.map(r => '<button class="chip" type="button" data-f="'+r.key+'" aria-pressed="'+(filter===r.key)+'">'+esc(r.name)+'</button>').join('') + '</div>';
  const chipsNav = active => '<nav class="chips" aria-label="Rubriken"><a class="chip" href="#start">Alle</a>' + DATA.rubrics.map(r => '<a class="chip" href="#'+r.key+'"'+(r.key===active?' aria-current="page"':'')+'>'+esc(r.name)+'</a>').join('') + '</nav>';

  function marketsHTML(is){
    const m = is.markets; if (!m) return '';
    const row = x => { const inner = '<div class="mk-name">'+esc(x.name)+'<small>'+esc(x.sub)+'</small></div><span class="mk-chg '+x.dir+'">'+esc(x.chg)+'</span><div class="mk-note">'+esc(x.note)+'</div>';
      return x.a ? '<a class="mk-row" href="#'+x.a+'">'+inner+'</a>' : '<div class="mk-row">'+inner+'</div>'; };
    return '<div class="markets reveal"><div class="mk-group">Aktien</div>'+m.stocks.map(row).join('')+'<div class="mk-group">ETFs</div>'+m.etfs.map(row).join('')+'<div class="mk-foot">'+esc(m.asof)+'</div></div>'
      + (m.take ? '<div class="take reveal" style="margin-top:16px"><h4>Einschätzung: Was als Nächstes passieren könnte</h4><p>'+esc(m.take)+'</p><p class="disc">Mutmaßung auf Basis der aktuellen Nachrichtenlage. Keine verlässliche Prognose, keine Anlageberatung.</p></div>' : '');
  }
  const railFor = list => list.length ? '<div class="rail">'+list.map(card).join('')+'</div>' : '<p class="meta">In dieser Rubrik gibt es in dieser Ausgabe keine Berichte.</p>';

  /* ---------- views ---------- */
  function viewIssue(is){
    curIssue = is;
    const top = BY_ID[is.top]; const latest = is === ISSUES[0];
    const pool = is.articles.filter(a => a.id !== is.top);
    const filtered = filter==='alle' ? pool : is.articles.filter(a => a.r===filter);
    let h = '<div class="wrap"><section class="hero"><span class="hero-meta"><b>Ausgabe Nr. '+is.nr+'</b> · '+esc(is.dateLabel)+(latest?'':' · Archiv')+'</span><h1 class="display">'+esc(is.headline)+'</h1>'+chipsHome()+'</section>';
    h += '<section class="blk" style="margin-top:28px"><div class="sec-head"><h2 class="h-sec">'+(filter==='alle'?'Diese Ausgabe':esc(RUB[filter].name))+'</h2>'+(filter==='alle'?'':'<a class="see-all" href="#'+filter+'">Alle ansehen</a>')+'</div><div id="railSlot">'+railFor(filtered)+'</div></section>';
    if (top) h += '<section class="blk"><div class="sec-head"><h2 class="h-sec">Top-Thema</h2><a class="see-all" href="#'+top.id+'">Weiterlesen</a></div>'+feature(top)+'</section>';
    h += '<section class="blk"><div class="brief reveal"><div class="sec-head" style="margin:0"><h2 class="h-sec">Das Wichtigste in 60 Sekunden</h2></div><ol>'
      + is.brief.map(b => '<li><span class="dot" style="background:'+col(b.r)+'"></span><a href="#'+b.a+'">'+esc(b.t)+'</a></li>').join('') + '</ol></div></section>';
    h += '<section class="blk"><div class="sec-head"><h2 class="h-sec">Märkte & Watchlist</h2><a class="see-all" href="#wirtschaft">Alle Berichte</a></div>'+marketsHTML(is)+'</section>';
    FOCUS.forEach(k => { const list = is.articles.filter(a => a.r===k && a.id!==is.top);
      if (list.length) h += '<section class="blk"><div class="sec-head"><h2 class="h-sec"><span class="dot" style="background:'+col(k)+';margin-right:10px;vertical-align:middle"></span>'+esc(RUB[k].name)+'</h2><a class="see-all" href="#'+k+'">Alle ansehen</a></div>'+railFor(list)+'</section>'; });
    const more = is.articles.filter(a => ['usa','eu','tech'].includes(a.r) && a.id!==is.top);
    if (more.length) h += '<section class="blk"><div class="sec-head"><h2 class="h-sec">USA, EU, Technologie & KI</h2></div>'+railFor(more)+'</section>';
    h += '<section class="blk"><div class="sec-head"><h2 class="h-sec">Rubriken</h2><a class="see-all" href="#archiv">Alle Ausgaben</a></div><div class="tiles">'
      + DATA.rubrics.map(r => '<a class="tile" href="#'+r.key+'"><span class="dot" style="background:'+col(r.key)+';width:12px;height:12px"></span><div style="display:grid;gap:4px"><b>'+esc(r.name)+'</b><span>'+ALL.filter(a=>a.r===r.key).length+' Berichte</span></div></a>').join('') + '</div></section></div>';
    return h;
  }

  function viewRubric(key){
    const r = RUB[key]; const list = ALL.filter(a => a.r===key);
    let h = '<div class="wrap"><section class="rub-hero"><span class="hero-meta"><b>Rubrik</b></span><h1 class="display" style="font-size:clamp(40px,8vw,88px)">'+esc(r.name)+'</h1><p class="lead">'+esc(r.desc)+'</p>'+chipsNav(key)+'</section>';
    if (key==='wirtschaft') h += '<section class="blk"><div class="sec-head"><h2 class="h-sec">Watchlist</h2><span class="meta">Ausgabe Nr. '+ISSUES[0].nr+'</span></div>'+marketsHTML(ISSUES[0])+'</section>';
    let last = null; let grid = [];
    const flush = () => { if (grid.length){ h += '<div class="grid">'+grid.map(card).join('')+'</div>'; grid=[]; } };
    list.forEach(a => { if (a.issue !== last){ flush(); h += '<div class="sec-head" style="margin-top:40px"><h2 class="h-sec">Ausgabe Nr. '+a.issue.nr+'</h2><span class="meta">'+esc(a.issue.dateLabel)+'</span></div>'; last = a.issue; } grid.push(a); });
    flush();
    if (!list.length) h += '<p class="meta" style="margin-top:32px">In dieser Rubrik gibt es noch keine Berichte.</p>';
    return h + '</div>';
  }

  function viewArticle(a){
    const is = a.issue;
    const back = is===ISSUES[0] ? 'start' : 'ausgabe-'+is.id;
    const credit = hasPhoto(a) ? '<p class="photo-note">Symbolfoto: <a href="https://unsplash.com/@'+esc(a.img.user)+utm+'" target="_blank" rel="noopener">'+esc(a.img.by)+'</a> (<a href="https://unsplash.com/photos/'+esc(a.img.id)+utm+'" target="_blank" rel="noopener">Originalfoto</a>) auf <a href="https://unsplash.com/'+utm+'" target="_blank" rel="noopener">Unsplash</a></p>' : '';
    let h = '<article><div class="a-hero">'+media(a, true)+'<div class="a-top"><a class="glass-btn" href="#'+back+'" aria-label="Zurück zu Ausgabe Nr. '+is.nr+'">'+ico.back+'</a><button class="glass-btn" type="button" data-copy aria-label="Link kopieren">'+ico.link+'</button></div>'
      + '<div class="a-over"><div class="a-over-in"><h1>'+esc(a.title)+'</h1><span class="over-meta">'+esc(RUB[a.r].name)+' · '+esc(a.kicker)+' · '+readMin(a)+' Min. Lesezeit</span></div></div></div>'
      + '<div class="sheet wrap"><div class="sheet-in"><div class="byline"><span class="who">'+MARK+'Zwei Tage</span><time datetime="'+is.id+'">Nr. '+is.nr+' · '+shortDate(is.id)+'</time></div>'
      + '<p class="standfirst">'+esc(a.lead)+'</p><div class="prose">';
    if (a.facts && a.facts.length) h += '<ul class="facts">'+a.facts.map(f => '<li><span>'+esc(f[0])+'</span><span>'+esc(f[1])+'</span></li>').join('')+'</ul>';
    h += a.body.map(p => '<p>'+esc(p)+'</p>').join('');
    if (a.take) h += '<div class="take" style="margin-top:24px"><h4>Einschätzung</h4><p>'+esc(a.take)+'</p><p class="disc">Mutmaßung über mögliche Entwicklungen, keine verlässliche Information und keine Anlageberatung.</p></div>';
    h += '</div>';
    if (a.sources && a.sources.length) h += '<div class="sources"><h4>Quellen</h4>'+a.sources.map(s => '<a href="'+esc(s.u)+'" target="_blank" rel="noopener">'+esc(s.t)+'</a>').join('')+'</div>';
    h += credit + '</div></div></article>';
    const rel = ALL.filter(x => x.r===a.r && x.id!==a.id).slice(0,6);
    const other = rel.length ? rel : is.articles.filter(x => x.id!==a.id).slice(0,6);
    h += '<div class="wrap"><section class="blk"><div class="sec-head"><h2 class="h-sec">'+(rel.length?'Mehr aus '+esc(RUB[a.r].name):'Weiterlesen')+'</h2></div>'+railFor(other)+'</section></div>';
    return h;
  }

  function viewArchive(){
    return '<div class="wrap"><section class="rub-hero"><span class="hero-meta"><b>Archiv</b></span><h1 class="display" style="font-size:clamp(40px,8vw,88px)">Alle Ausgaben</h1></section><section class="blk" style="margin-top:28px"><div class="arch">'
      + ISSUES.map((is,i) => '<a href="#'+(i===0?'start':'ausgabe-'+is.id)+'"><span class="nr">Nr. '+String(is.nr).padStart(3,'0')+'</span><span class="ttl">'+esc(is.headline)+'<br><span class="meta">'+esc(is.dateLabel)+' · '+is.articles.length+' Berichte</span></span>'+ico.arrow+'</a>').join('')
      + '</div></section></div>';
  }

  /* ---------- router ---------- */
  function renderTabs(active){
    const items = [['start','Start',ico.home],['oesterreich','Österreich',ico.flag],['wirtschaft','Märkte',ico.chart],['sport','Sport',ico.ball],['archiv','Archiv',ico.archive]];
    tabbar.innerHTML = items.map(i => '<a class="tab" href="#'+i[0]+'" aria-label="'+i[1]+'"'+(i[0]===active?' aria-current="page"':'')+'>'+i[2]+'<span>'+i[1]+'</span></a>').join('');
  }
  function route(){
    const h = (location.hash || '').slice(1) || 'start';
    let html, active = 'start', title = 'Zwei Tage', isArt = false;
    if (h === 'start') html = viewIssue(ISSUES[0]);
    else if (h.indexOf('ausgabe-') === 0){ const is = ISSUES.find(x => 'ausgabe-'+x.id === h); html = viewIssue(is || ISSUES[0]); active = 'archiv'; }
    else if (RUB[h]) { html = viewRubric(h); active = h; title = RUB[h].name + ' · Zwei Tage'; }
    else if (h === 'archiv') { html = viewArchive(); active = 'archiv'; }
    else if (BY_ID[h]) { const a = BY_ID[h]; html = viewArticle(a); active = ['oesterreich','wirtschaft','sport'].includes(a.r) ? a.r : ''; title = a.title + ' · Zwei Tage'; isArt = true; }
    else html = viewIssue(ISSUES[0]);
    document.body.classList.toggle('is-article', isArt);
    app.innerHTML = html; renderTabs(active); document.title = title;
    window.scrollTo(0, 0);
  }

  function toast(msg){ const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 1800); }
  function copyLink(){
    const url = location.href;
    try { navigator.clipboard.writeText(url).then(() => toast('Link kopiert'), () => toast('Kopieren nicht möglich')); }
    catch(e){ toast('Kopieren nicht möglich'); }
  }
  document.getElementById('copyLink').addEventListener('click', copyLink);
  app.addEventListener('click', e => {
    const c = e.target.closest('[data-copy]'); if (c){ copyLink(); return; }
    const f = e.target.closest('.chip[data-f]'); if (!f) return;
    filter = f.dataset.f;
    app.querySelectorAll('.chip[data-f]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.f===filter)));
    const is = curIssue || ISSUES[0]; const pool = is.articles.filter(a => a.id !== is.top);
    const list = filter==='alle' ? pool : is.articles.filter(a => a.r===filter);
    const slot = document.getElementById('railSlot'); if (!slot) return;
    slot.innerHTML = railFor(list);
    const head = slot.previousElementSibling;
    head.innerHTML = '<h2 class="h-sec">'+(filter==='alle'?'Diese Ausgabe':esc(RUB[filter].name))+'</h2>'+(filter==='alle'?'':'<a class="see-all" href="#'+filter+'">Alle ansehen</a>');
  });
  window.addEventListener('hashchange', route);
  route();
}

fetch('data/zwei-tage.json', {cache: 'no-cache'})
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(start)
  .catch(() => { document.getElementById('app').innerHTML = '<div class="wrap"><p class="meta" style="padding-top:40px">Die Ausgabe konnte nicht geladen werden. Bitte später erneut versuchen.</p></div>'; });
