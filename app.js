/* Zwei Tage – app shell with four tabs (Entdecken, Start, Ausgaben, Märkte) and an article reader that grows out of the tapped card */
function start(DATA){
  const RUB = {}; DATA.rubrics.forEach(r => RUB[r.key] = r);
  const ISSUES = DATA.issues;
  const ALL = []; const BY_ID = {};
  ISSUES.forEach(is => is.articles.forEach(a => { a.issue = is; ALL.push(a); BY_ID[a.id] = a; }));
  const app = document.getElementById('app');
  const tabbar = document.getElementById('tabbar');
  const reader = document.getElementById('reader');
  const MONTHS = ['Jän.','Feb.','März','Apr.','Mai','Juni','Juli','Aug.','Sept.','Okt.','Nov.','Dez.'];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const col = r => 'var(--c-' + r + ')';
  const shortDate = id => { const p = id.split('-'); return (+p[2]) + '. ' + MONTHS[+p[1]-1]; };
  const readMin = a => Math.max(2, Math.round((a.lead + ' ' + a.body.join(' ')).split(/\s+/).length / 200));
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } };
  const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
  const svg = (p, extra) => '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"'+(extra||'')+'>'+p+'</svg>';
  const ico = {
    cards: svg('<rect x="6" y="3.5" width="12" height="17" rx="3"/><path d="M3.5 7v10M20.5 7v10"/>'),
    home: svg('<path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z"/>'),
    issues: svg('<rect x="4" y="3.5" width="16" height="17" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>'),
    chart: svg('<path d="M4 19h16M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>'),
    back: svg('<path d="M15 5l-7 7 7 7"/>'),
    link: svg('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
    x: svg('<path d="M6 6l12 12M18 6 6 18"/>'),
    later: svg('<path d="M4 12a8 8 0 1 0 2.3-5.6"/><path d="M4 4v4.5h4.5"/><path d="M12 8v4l3 2"/>'),
    read: svg('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5zM20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z"/>'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    chev: svg('<path d="M9 5l7 7-7 7"/>')
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
  const SIZES = { hero: '100vw', card: '(max-width:640px) 92vw, 520px', rail: '260px', thumb: '96px' };
  const media = (a, kind, eager) => '<div class="media">' + (hasPhoto(a)
    ? '<img src="'+esc(imgUrl(a, kind==='thumb'?400:1000))+'" srcset="'+[200,400,800,1200,1800].map(w => esc(imgUrl(a,w))+' '+w+'w').join(', ')+'" sizes="'+SIZES[kind]+'" alt="'+esc(a.img.alt||'')+'" draggable="false" '+(eager?'fetchpriority="high"':'loading="lazy"')+' decoding="async">'
    : art(a)) + '</div>';
  const utm = '?utm_source=zwei_tage&utm_medium=referral';

  /* ---------- small pieces ---------- */
  const rubLabel = a => '<span class="rub"><span class="dot" style="background:'+col(a.r)+'"></span>'+esc(RUB[a.r].name)+'</span>';
  const metaText = a => 'Nr. '+a.issue.nr+' · '+shortDate(a.issue.id)+' · '+readMin(a)+' Min.';
  const row = a => '<a class="row" href="#'+a.id+'" data-open="'+a.id+'"><div class="row-media">'+media(a,'thumb')+'</div><div class="row-body">'+rubLabel(a)+'<h3>'+esc(a.title)+'</h3><span class="meta">'+metaText(a)+'</span></div></a>';
  const railCard = a => '<a class="rcard" href="#'+a.id+'" data-open="'+a.id+'"><div class="rcard-media">'+media(a,'rail')+'</div>'+rubLabel(a)+'<h3>'+esc(a.title)+'</h3><span class="meta">'+metaText(a)+'</span></a>';
  const filterTabs = (scope, active) => '<div class="ftabs" role="tablist" aria-label="Rubrik filtern" data-scope="'+scope+'">'
    + [['alle','Alle']].concat(DATA.rubrics.map(r => [r.key, r.name])).map(([k,n]) => '<button type="button" role="tab" class="ftab" data-f="'+k+'" aria-selected="'+(k===active)+'">'+esc(n)+'</button>').join('') + '</div>';
  const filterList = (list, f) => f === 'alle' ? list : list.filter(a => a.r === f);
  const listHTML = list => list.length ? '<div class="list">'+list.map(row).join('')+'</div>' : '<p class="empty">In dieser Rubrik gibt es hier keine Berichte.</p>';
  const pageHead = (title, sub, back) => '<header class="page-head">'+(back ? '<a class="back-link" href="'+back+'">'+ico.back+'<span>Ausgaben</span></a>' : '')+'<h1>'+esc(title)+'</h1>'+(sub ? '<p class="page-sub">'+sub+'</p>' : '')+'</header>';

  function marketsHTML(is){
    const m = is.markets; if (!m) return '<p class="empty">Für diese Ausgabe gibt es keine Marktdaten.</p>';
    const rowM = x => { const inner = '<div class="mk-name">'+esc(x.name)+'<small>'+esc(x.sub)+'</small></div><span class="mk-chg '+x.dir+(/\d/.test(x.chg)?'':' word')+'">'+esc(x.chg)+'</span><div class="mk-note">'+esc(x.note)+'</div>';
      return x.a && BY_ID[x.a] ? '<a class="mk-row" href="#'+x.a+'" data-open="'+x.a+'">'+inner+'</a>' : '<div class="mk-row">'+inner+'</div>'; };
    return '<div class="markets"><div class="mk-group">Aktien</div>'+m.stocks.map(rowM).join('')+'<div class="mk-group">ETFs</div>'+m.etfs.map(rowM).join('')+'<div class="mk-foot">'+esc(m.asof)+'</div></div>'
      + (m.take ? '<div class="take"><h4>Einschätzung: Was als Nächstes passieren könnte</h4><p>'+esc(m.take)+'</p><p class="disc">Mutmaßung auf Basis der aktuellen Nachrichtenlage. Keine verlässliche Prognose, keine Anlageberatung.</p></div>' : '');
  }

  function factsBlock(facts){
    return '<section class="facts" aria-label="In Zahlen"><h4>In Zahlen</h4><dl>'
      + facts.map(f => '<div class="fact"><dt>'+esc(f[0])+'</dt><dd>'+esc(f[1])+'</dd></div>').join('') + '</dl></section>';
  }

  /* ---------- tab 1: Entdecken (swipe deck) ---------- */
  const DECK_KEY = 'zt-deck';
  function freshDeck(issueId){
    const is = ISSUES.find(i => i.id === issueId) || ISSUES[0];
    const ids = is.articles.map(a => a.id).sort((x, y) => (y === is.top) - (x === is.top));
    return { latest: ISSUES[0].id, issue: is.id, order: ids, hidden: [] };
  }
  let deck = null;
  function loadDeck(){
    let s = load(DECK_KEY, null);
    if (!s || s.latest !== ISSUES[0].id || !ISSUES.some(i => i.id === s.issue) || !Array.isArray(s.order)) s = freshDeck(ISSUES[0].id);
    s.order = s.order.filter(id => BY_ID[id]);
    return s;
  }
  const saveDeck = () => save(DECK_KEY, deck);
  function viewDeck(){
    deck = loadDeck(); saveDeck();
    return '<div class="page deck-page">'+pageHead('Entdecken', '<span id="deck-sub"></span>')
      + '<div class="deck" id="deck" aria-live="polite"></div>'
      + '<div class="deck-actions" id="deck-actions">'
      + '<button type="button" class="dbtn nope" data-act="hide" aria-label="Ausblenden">'+ico.x+'</button>'
      + '<button type="button" class="dbtn read" data-act="read" aria-label="Lesen">'+ico.read+'</button>'
      + '<button type="button" class="dbtn like" data-act="later" aria-label="Später nochmal zeigen">'+ico.later+'</button>'
      + '</div><p class="deck-hint">Nach rechts wischen: später nochmal · nach links: ausblenden</p></div>';
  }
  const deckCard = (a, depth) => '<article class="dcard" data-open="'+a.id+'" data-depth="'+depth+'" style="--d:'+depth+'"'+(depth ? ' aria-hidden="true"' : '')+'>'
    + '<div class="dcard-media">'+media(a, 'card', depth === 0)+'</div>'
    + '<div class="dcard-over">'+rubLabel(a)+'<h2>'+esc(a.title)+'</h2><p>'+esc(a.lead)+'</p><span class="meta">'+metaText(a)+' Lesezeit</span></div>'
    + '<span class="stamp like">Später nochmal</span><span class="stamp nope">Ausblenden</span></article>';
  function renderDeck(shift){
    const el = document.getElementById('deck'); if (!el) return;
    const is = ISSUES.find(i => i.id === deck.issue) || ISSUES[0];
    const sub = document.getElementById('deck-sub');
    const actions = document.getElementById('deck-actions');
    if (!deck.order.length){
      const idx = ISSUES.indexOf(is); const prev = ISSUES[idx + 1];
      sub.textContent = 'Ausgabe Nr. '+is.nr+' · alles gesehen';
      actions.hidden = true;
      el.innerHTML = '<div class="deck-done"><div class="done-mark">'+MARK+'</div><h2>Du bist durch</h2><p>Alle Meldungen aus Ausgabe Nr. '+is.nr+' gesehen.</p>'
        + (prev ? '<button type="button" class="pill-btn" data-act="prev">Ausgabe Nr. '+prev.nr+' durchwischen</button>' : '')
        + '<button type="button" class="pill-btn ghost" data-act="reset">Von vorne beginnen</button></div>';
      return;
    }
    actions.hidden = false;
    sub.textContent = 'Ausgabe Nr. '+is.nr+' · noch '+deck.order.length+(deck.order.length === 1 ? ' Meldung' : ' Meldungen');
    el.innerHTML = deck.order.slice(0, 3).map((id, i) => deckCard(BY_ID[id], i)).reverse().join('');
    if (shift && !reduce){
      const cards = el.querySelectorAll('.dcard');
      cards.forEach(c => { c.style.transition = 'none'; c.style.setProperty('--d', +c.dataset.depth + 1); });
      el.getBoundingClientRect();
      requestAnimationFrame(() => cards.forEach(c => { c.style.transition = ''; c.style.setProperty('--d', c.dataset.depth); }));
    }
    const top = el.querySelector('.dcard[data-depth="0"]');
    if (top) bindDrag(top);
  }
  function decide(kind, card, dir){
    if (!card || card.dataset.leaving) return;
    card.dataset.leaving = '1';
    const id = card.dataset.open;
    card.style.transition = 'transform .45s var(--ease), opacity .45s var(--ease)';
    card.style.transform = 'translate('+(dir * window.innerWidth * 1.15)+'px, 30px) rotate('+(dir * 18)+'deg)';
    card.style.opacity = '0';
    deck.order = deck.order.filter(x => x !== id);
    if (kind === 'later') deck.order.push(id); else deck.hidden.push(id);
    saveDeck();
    setTimeout(() => renderDeck(true), reduce ? 0 : 200);
  }
  function bindDrag(card){
    const LIMIT = 100;
    let sx = 0, sy = 0, dx = 0, dy = 0, pid = null, moved = false;
    const setStamp = () => { const p = Math.max(-1, Math.min(1, dx / LIMIT)); card.style.setProperty('--like', Math.max(0, p)); card.style.setProperty('--nope', Math.max(0, -p)); };
    const reset = () => { card.style.transition = ''; card.style.transform = ''; dx = dy = 0; setStamp(); };
    card.addEventListener('pointerdown', e => {
      if (e.button > 0 || card.dataset.leaving) return;
      pid = e.pointerId; sx = e.clientX; sy = e.clientY; dx = dy = 0; moved = false;
      card.style.transition = 'none';
    });
    card.addEventListener('pointermove', e => {
      if (e.pointerId !== pid) return;
      dx = e.clientX - sx; dy = e.clientY - sy;
      if (!moved && Math.abs(dx) > 8){ moved = true; try { card.setPointerCapture(pid); } catch(err){} }
      if (!moved) return;
      card.style.transform = 'translate('+dx+'px,'+(dy * 0.25)+'px) rotate('+(dx / 20)+'deg)';
      setStamp();
    });
    const end = e => {
      if (e.pointerId !== pid) return;
      pid = null;
      if (!moved){ card.style.transition = ''; return; }
      card.dataset.dragged = '1'; setTimeout(() => { delete card.dataset.dragged; }, 50);
      if (dx > LIMIT) decide('later', card, 1);
      else if (dx < -LIMIT) decide('hide', card, -1);
      else reset();
    };
    card.addEventListener('pointerup', end);
    card.addEventListener('pointercancel', e => { if (e.pointerId === pid){ pid = null; reset(); } });
  }

  /* ---------- tab 2: Start ---------- */
  const filters = { start: 'alle', issue: 'alle', maerkte: 'alle' };
  function viewStart(){
    const is = ISSUES[0];
    const top = BY_ID[is.top] || is.articles[0];
    const rest = is.articles.filter(a => a !== top);
    const recent = ISSUES.slice(0, 3).flatMap(i => i.articles);
    return '<div class="start">'
      + '<a class="lead-story" href="#'+top.id+'" data-open="'+top.id+'"><div class="lead-media">'+media(top, 'hero', true)+'</div>'
      + '<div class="lead-over"><span class="glass-pill">News des Tages</span><h2>'+esc(top.title)+'</h2><span class="lead-more">Weiterlesen '+ico.arrow+'</span></div></a>'
      + '<div class="page page-flat">'
      + '<section class="sec"><div class="sec-head"><h2>Aktuell</h2><a class="sec-link" href="#ausgabe-'+is.id+'">Mehr</a></div><div class="rail">'+rest.map(railCard).join('')+'</div></section>'
      + '<section class="sec"><div class="sec-head"><h2>Alle News</h2><span class="meta">Letzte 3 Ausgaben</span></div>'+filterTabs('start', filters.start)
      + '<div class="flist" data-list="start">'+listHTML(filterList(recent, filters.start))+'</div></section>'
      + '</div></div>';
  }

  /* ---------- tab 3: Ausgaben ---------- */
  function viewIssues(){
    const t = document.documentElement.getAttribute('data-theme') || 'system';
    return '<div class="page">'+pageHead('Ausgaben', 'Alle zwei Tage eine neue Ausgabe')
      + '<div class="issues">'+ISSUES.map(is => '<a class="issue" href="#ausgabe-'+is.id+'"><span class="nr">Nr. '+String(is.nr).padStart(3,'0')+'</span><span class="issue-body"><b>'+esc(is.headline)+'</b><span class="meta">'+esc(is.dateLabel)+' · '+is.articles.length+' Berichte</span></span>'+ico.chev+'</a>').join('')+'</div>'
      + '<section class="sec"><div class="sec-head"><h2>Darstellung</h2></div><div class="seg" role="radiogroup" aria-label="Darstellung">'
      + [['system','Automatisch'],['light','Hell'],['dark','Dunkel']].map(([k,n]) => '<button type="button" role="radio" data-theme-set="'+k+'" aria-checked="'+(k===t)+'">'+n+'</button>').join('')
      + '</div></section>'
      + '<footer class="about"><p><b>Zwei Tage</b> erscheint alle zwei Tage. Die Ausgaben werden automatisch aus öffentlich zugänglichen Quellen recherchiert und mit KI (Claude von Anthropic) zusammengefasst. Jede Meldung verlinkt ihre Quellen. Fotos sind Symbolbilder von Unsplash.</p><p>Markt-Einschätzungen sind Mutmaßungen über mögliche Szenarien, keine verlässlichen Prognosen und keine Anlageberatung.</p></footer>'
      + '</div>';
  }
  function viewIssue(is){
    return '<div class="page">'+pageHead('Ausgabe Nr. '+is.nr, esc(is.dateLabel), '#ausgaben')
      + '<p class="issue-headline">'+esc(is.headline)+'</p>'
      + filterTabs('issue', filters.issue)
      + '<div class="flist" data-list="issue" data-issue="'+is.id+'">'+listHTML(filterList(is.articles, filters.issue))+'</div></div>';
  }

  /* ---------- tab 4: Märkte ---------- */
  function viewMarkets(){
    const is = ISSUES[0];
    const reports = ISSUES.slice(0, 3).flatMap(i => i.articles).filter(a => a.r === 'wirtschaft');
    return '<div class="page">'+pageHead('Märkte', 'Watchlist · Ausgabe Nr. '+is.nr+' · '+esc(is.dateLabel))
      + marketsHTML(is)
      + '<section class="sec"><div class="sec-head"><h2>Berichte</h2><span class="meta">Wirtschaft & Börse</span></div>'+listHTML(reports)+'</section></div>';
  }

  /* ---------- article (reader) ---------- */
  function viewArticle(a){
    const is = a.issue;
    const credit = hasPhoto(a) ? '<p class="photo-note">Symbolfoto: <a href="https://unsplash.com/@'+esc(a.img.user)+utm+'" target="_blank" rel="noopener">'+esc(a.img.by)+'</a> (<a href="https://unsplash.com/photos/'+esc(a.img.id)+utm+'" target="_blank" rel="noopener">Originalfoto</a>) auf <a href="https://unsplash.com/'+utm+'" target="_blank" rel="noopener">Unsplash</a></p>' : '';
    let h = '<article><div class="a-hero">'+media(a, 'hero', true)+'<div class="a-top"><button class="glass-btn" type="button" data-back aria-label="Zurück">'+ico.back+'</button><button class="glass-btn" type="button" data-copy aria-label="Teilen">'+ico.link+'</button></div>'
      + '<div class="a-over"><div class="a-over-in">'+rubLabel(a)+'<h1>'+esc(a.title)+'</h1><span class="over-meta">'+esc(a.kicker)+' · '+readMin(a)+' Min. Lesezeit</span></div></div></div>'
      + '<div class="sheet"><div class="sheet-in"><div class="byline"><span class="who">'+MARK+'Zwei Tage</span><time datetime="'+is.id+'">Nr. '+is.nr+' · '+shortDate(is.id)+'</time></div>'
      + '<p class="standfirst">'+esc(a.lead)+'</p><div class="prose">';
    if (a.facts && a.facts.length) h += factsBlock(a.facts);
    h += a.body.map(p => '<p>'+esc(p)+'</p>').join('');
    if (a.take) h += '<div class="take"><h4>Einschätzung</h4><p>'+esc(a.take)+'</p><p class="disc">Mutmaßung über mögliche Entwicklungen, keine verlässliche Information und keine Anlageberatung.</p></div>';
    h += '</div>';
    if (a.sources && a.sources.length) h += '<div class="sources"><h4>Quellen</h4>'+a.sources.map(s => '<a href="'+esc(s.u)+'" target="_blank" rel="noopener">'+esc(s.t)+'</a>').join('')+'</div>';
    h += credit;
    const rel = ALL.filter(x => x.r === a.r && x.id !== a.id).slice(0, 4);
    if (rel.length) h += '<section class="sec"><div class="sec-head"><h2>Mehr aus '+esc(RUB[a.r].name)+'</h2></div>'+listHTML(rel)+'</section>';
    return h + '</div></div></article>';
  }

  // Card-to-fullscreen transition: the tapped image grows into the article hero while the white sheet with the text
  // glides up from below; closing runs the same motion backwards (sheet glides down, image shrinks into its card).
  const DUR = 560;
  function ghostOf(el){
    const r = el.getBoundingClientRect();
    const g = el.cloneNode(true);
    g.className = 'ghost';
    g.removeAttribute('style'); g.querySelectorAll('.stamp').forEach(x => x.remove());
    g.querySelectorAll('img').forEach(im => { if (im.currentSrc) im.src = im.currentSrc; im.removeAttribute('srcset'); im.removeAttribute('loading'); });
    Object.assign(g.style, { left: r.left+'px', top: r.top+'px', width: r.width+'px', height: r.height+'px', borderRadius: getComputedStyle(el).borderTopLeftRadius });
    document.body.appendChild(g);
    return g;
  }
  function moveGhost(g, el){
    const r = el.getBoundingClientRect();
    const t = DUR+'ms var(--ease)';
    g.style.transition = ['left','top','width','height','border-radius'].map(p => p+' '+t).join(', ');
    g.classList.add('run');
    Object.assign(g.style, { left: r.left+'px', top: r.top+'px', width: r.width+'px', height: r.height+'px', borderRadius: getComputedStyle(el).borderTopLeftRadius });
  }
  const dropGhost = g => { g.style.transition = 'opacity .26s var(--ease-out)'; g.style.opacity = '0'; setTimeout(() => g.remove(), 280); };
  let readerOpen = false, readerArticle = null, openFrom = null, pendingFrom = null, navFromApp = false, animTimer = null, finishClose = null;
  const visible = el => { if (!el || !el.isConnected) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight; };
  function openReader(a){
    if (finishClose) finishClose();
    const swap = readerOpen;
    readerArticle = a;
    reader.innerHTML = viewArticle(a);
    reader.scrollTop = 0;
    document.title = a.title + ' · Zwei Tage';
    if (swap) return;
    const from = pendingFrom; pendingFrom = null;
    openFrom = from;
    reader.hidden = false; readerOpen = true;
    document.documentElement.classList.add('reading');
    const hero = reader.querySelector('.a-hero .media');
    if (from && hero && visible(from) && !reduce){
      reader.classList.add('opening');
      const g = ghostOf(from);
      reader.getBoundingClientRect();
      requestAnimationFrame(() => { moveGhost(g, hero); reader.classList.add('run'); });
      clearTimeout(animTimer);
      animTimer = setTimeout(() => { reader.classList.remove('opening', 'run'); dropGhost(g); }, DUR + 20);
    } else {
      reader.classList.add('fading'); reader.getBoundingClientRect();
      requestAnimationFrame(() => reader.classList.remove('fading'));
    }
  }
  function closeReader(){
    if (!readerOpen) return;
    readerOpen = false;
    const hero = reader.querySelector('.a-hero .media');
    const target = openFrom; openFrom = null; readerArticle = null;
    const done = () => {
      finishClose = null; clearTimeout(animTimer);
      reader.hidden = true; reader.innerHTML = ''; reader.classList.remove('closing', 'run', 'fading');
      document.documentElement.classList.remove('reading');
    };
    document.title = titleFor(viewKey);
    if (target && hero && visible(target) && !reduce){
      const g = ghostOf(hero);
      reader.classList.add('closing');
      reader.getBoundingClientRect();
      requestAnimationFrame(() => { moveGhost(g, target); reader.classList.add('run'); });
      finishClose = () => { done(); dropGhost(g); };
      clearTimeout(animTimer);
      animTimer = setTimeout(() => finishClose && finishClose(), DUR + 20);
    } else if (!reduce){
      reader.classList.add('fading');
      finishClose = done;
      clearTimeout(animTimer);
      animTimer = setTimeout(() => finishClose && finishClose(), 260);
    } else done();
  }

  /* ---------- shell + router ---------- */
  const TABS = [['entdecken','Entdecken',ico.cards],['start','Start',ico.home],['ausgaben','Ausgaben',ico.issues],['maerkte','Märkte',ico.chart]];
  function renderTabs(active){
    tabbar.innerHTML = TABS.map(t => '<a class="tab" href="#'+t[0]+'"'+(t[0]===active?' aria-current="page"':'')+'>'+t[2]+'<span>'+t[1]+'</span></a>').join('');
  }
  const titleFor = key => key === 'start' ? 'Zwei Tage' : key === 'ausgaben' ? 'Ausgaben · Zwei Tage' : key === 'maerkte' ? 'Märkte · Zwei Tage' : key && key.indexOf('ausgabe-') === 0 ? 'Ausgabe · Zwei Tage' : 'Entdecken · Zwei Tage';
  let viewKey = null;
  function showView(key){
    if (key === viewKey) return;
    viewKey = key;
    let html, tab = key;
    if (key === 'start') html = viewStart();
    else if (key === 'ausgaben') html = viewIssues();
    else if (key === 'maerkte') html = viewMarkets();
    else if (key.indexOf('ausgabe-') === 0){ const is = ISSUES.find(i => 'ausgabe-'+i.id === key); filters.issue = 'alle'; html = viewIssue(is); tab = 'ausgaben'; }
    else { html = viewDeck(); tab = 'entdecken'; }
    app.innerHTML = html;
    if (!reduce){ app.classList.remove('enter'); app.getBoundingClientRect(); app.classList.add('enter'); }
    document.body.dataset.view = tab;
    renderTabs(tab);
    if (tab === 'entdecken' && key === 'entdecken') renderDeck();
    window.scrollTo(0, 0);
    document.title = titleFor(key);
  }
  function route(){
    let h = decodeURIComponent((location.hash || '').slice(1));
    if (h === 'archiv') h = 'ausgaben';
    if (h === 'wirtschaft') h = 'maerkte';
    else if (RUB[h]){ filters.start = h; h = 'start'; }
    if (BY_ID[h]){
      if (!viewKey) showView('start');
      openReader(BY_ID[h]);
      return;
    }
    closeReader();
    if (h.indexOf('ausgabe-') === 0 && ISSUES.some(i => 'ausgabe-'+i.id === h)) showView(h);
    else if (TABS.some(t => t[0] === h)) showView(h);
    else showView('entdecken');
  }

  /* ---------- interactions ---------- */
  document.addEventListener('click', e => {
    const open = e.target.closest('[data-open]');
    if (open && !e.target.closest('[data-act]')){
      if (open.dataset.dragged) { e.preventDefault(); return; }
      e.preventDefault();
      pendingFrom = readerOpen ? null : (open.classList.contains('dcard') ? open : (open.querySelector('.media') || null));
      navFromApp = true;
      location.hash = open.dataset.open;
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act){
      const top = document.querySelector('#deck .dcard[data-depth="0"]');
      const a = act.dataset.act;
      if (a === 'hide') decide('hide', top, -1);
      else if (a === 'later') decide('later', top, 1);
      else if (a === 'read' && top){ pendingFrom = top; navFromApp = true; location.hash = top.dataset.open; }
      else if (a === 'prev'){ const idx = ISSUES.findIndex(i => i.id === deck.issue); const prev = ISSUES[idx + 1]; if (prev){ deck = freshDeck(prev.id); saveDeck(); renderDeck(); } }
      else if (a === 'reset'){ deck = freshDeck(deck.issue); saveDeck(); renderDeck(); }
      return;
    }
    if (e.target.closest('[data-back]')){
      if (navFromApp && history.length > 1){ navFromApp = false; history.back(); }
      else location.hash = viewKey || 'entdecken';
      return;
    }
    if (e.target.closest('[data-copy]')){ shareLink(); return; }
    const ft = e.target.closest('.ftab');
    if (ft){
      const bar = ft.closest('.ftabs'); const scope = bar.dataset.scope; const f = ft.dataset.f;
      filters[scope] = f;
      bar.querySelectorAll('.ftab').forEach(b => b.setAttribute('aria-selected', String(b === ft)));
      ft.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
      const box = document.querySelector('.flist[data-list="'+scope+'"]');
      if (box){
        const src = scope === 'start' ? ISSUES.slice(0, 3).flatMap(i => i.articles) : (ISSUES.find(i => i.id === box.dataset.issue) || ISSUES[0]).articles;
        box.innerHTML = listHTML(filterList(src, f));
        if (!reduce){ box.classList.remove('enter'); box.getBoundingClientRect(); box.classList.add('enter'); }
      }
      return;
    }
    const th = e.target.closest('[data-theme-set]');
    if (th){ setTheme(th.dataset.themeSet); document.querySelectorAll('[data-theme-set]').forEach(b => b.setAttribute('aria-checked', String(b === th))); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && readerOpen){ document.querySelector('[data-back]')?.click(); return; }
    if (viewKey === 'entdecken' && !readerOpen){
      const top = document.querySelector('#deck .dcard[data-depth="0"]');
      if (e.key === 'ArrowLeft') decide('hide', top, -1);
      if (e.key === 'ArrowRight') decide('later', top, 1);
    }
  });

  function toast(msg){ const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role','status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 1800); }
  function shareLink(){
    const url = location.origin + location.pathname + location.hash;
    if (navigator.share && (window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(pointer: coarse)').matches)){
      navigator.share({ title: document.title, url }).catch(() => {});
      return;
    }
    try { navigator.clipboard.writeText(url).then(() => toast('Link kopiert'), () => toast('Kopieren nicht möglich')); }
    catch(e){ toast('Kopieren nicht möglich'); }
  }

  window.addEventListener('hashchange', route);
  route();

  window.ZT = { isReading: () => readerOpen };

  // When the app returns to the foreground, check quietly whether a newer issue exists
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    fetch('data/zwei-tage.json', {cache: 'no-store'}).then(r => r.ok ? r.json() : null).then(d => {
      if (d && d.issues && d.issues[0] && d.issues[0].id !== ISSUES[0].id) hardReload();
    }).catch(() => {});
  });
}

fetch('data/zwei-tage.json', {cache: 'no-store'})
  .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then(start)
  .catch(() => { document.getElementById('app').innerHTML = '<div class="page"><p class="empty">Die Ausgabe konnte nicht geladen werden. Bitte später erneut versuchen.</p></div>'; });

/* ---------- full reload without caches ---------- */
async function hardReload(){
  try { if (window.caches) { const keys = await caches.keys(); await Promise.all(keys.map(k => caches.delete(k))); } } catch(e){}
  try { if (navigator.serviceWorker) { const regs = await navigator.serviceWorker.getRegistrations(); await Promise.all(regs.map(r => r.unregister())); } } catch(e){}
  location.replace(location.pathname + '?r=' + Date.now() + location.hash);
}

/* ---------- light / dark (setting lives in the Ausgaben tab) ---------- */
function syncThemeColor(){
  const root = document.documentElement;
  const t = root.getAttribute('data-theme');
  const dark = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.setAttribute('content', dark ? '#0c0c0d' : '#ffffff'); m.removeAttribute('media'); });
}
function setTheme(t){
  const root = document.documentElement;
  if (t === 'dark' || t === 'light'){ root.setAttribute('data-theme', t); try { localStorage.setItem('zt-theme', t); } catch(e){} }
  else { root.removeAttribute('data-theme'); try { localStorage.removeItem('zt-theme'); } catch(e){} }
  syncThemeColor();
}
syncThemeColor();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', syncThemeColor);

/* ---------- pull to refresh ---------- */
(function(){
  const ptr = document.getElementById('ptr'); if (!ptr) return;
  const LIMIT = 80;
  let startY = null, dist = 0, busy = false;
  const show = d => { const p = Math.min(d / LIMIT, 1); ptr.style.opacity = String(p); ptr.style.transform = 'translateY(' + (Math.min(d, LIMIT + 20) - 60) + 'px) rotate(' + (p * 270) + 'deg)'; ptr.classList.toggle('ready', d >= LIMIT); };
  const reset = () => { ptr.style.transition = 'transform .25s, opacity .25s'; ptr.style.opacity = '0'; ptr.style.transform = 'translateY(-80px)'; ptr.classList.remove('ready'); setTimeout(() => { ptr.style.transition = ''; }, 260); };
  window.addEventListener('touchstart', e => {
    const reading = window.ZT && window.ZT.isReading();
    if (busy || reading || e.touches.length !== 1 || window.scrollY > 0 || e.target.closest('.deck, .rail, .ftabs')) { startY = null; return; }
    startY = e.touches[0].clientY; dist = 0;
  }, {passive: true});
  window.addEventListener('touchmove', e => {
    if (startY === null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0 || window.scrollY > 0) { dist = 0; show(0); return; }
    dist = dy * 0.5; show(dist);
  }, {passive: true});
  window.addEventListener('touchcancel', () => { if (startY === null) return; startY = null; dist = 0; reset(); });
  window.addEventListener('touchend', () => {
    if (startY === null) return;
    startY = null;
    if (dist >= LIMIT) {
      busy = true; ptr.classList.add('loading'); ptr.style.opacity = '1'; ptr.style.transform = 'translateY(30px)';
      hardReload();
    } else reset();
    dist = 0;
  });
})();
