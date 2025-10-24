// script.js — interactive articles UI
async function fetchConstitutionData() {
    // If an inline dataset was embedded (data-inline.js), use it to avoid network fetch.
    if(window.CONSTITUTION_DATA && Array.isArray(window.CONSTITUTION_DATA) && window.CONSTITUTION_DATA[0]){
        console.log('Using inline CONSTITUTION_DATA provided by data-inline.js');
        return window.CONSTITUTION_DATA[0];
    }
    const tried = [];
    const candidates = ['data.json','./data.json','/data.json'];
    let res, data;
    for(const c of candidates){
        tried.push(c);
        try{
            res = await fetch(c);
            if(!res.ok) { console.warn('fetch ok=false for', c, res.status); continue; }
            data = await res.json();
            break;
        }catch(e){
            console.warn('fetch failed for', c, e.message || e);
            continue;
        }
    }
        if(!data) {
            const errEl = document.getElementById('dataError');
            if(errEl){
                errEl.style.display = 'block';
                errEl.textContent = 'Unable to load articles data (tried: ' + tried.join(', ') + '). Showing a minimal offline fallback. To view full data, run a local server (see instructions).';
            }

            // Minimal fallback dataset so the UI still works when data.json can't be fetched
            data = [[
                { ArtNo: '0', Name: 'PREAMBLE', ArtDesc: 'WE, THE PEOPLE OF INDIA ... (fallback preamble)' },
                { ArtNo: '1', Name: 'Name and territory of the Union', ArtDesc: 'India shall be a union of states.', Clauses: [ { ClauseNo: '1', ClauseDesc: 'India, that is Bharat, shall be a Union of States.' } ] },
                { ArtNo: '14', Name: 'Equality before law', ArtDesc: 'The State shall not deny to any person equality before the law or the equal protection of the laws within the territory of India.' }
            ]];
        }
    // data is an array; first element contains articles array
    const articles = data[0];
    return articles;
}

// public helper to attempt full network load (used by UI)
async function tryLoadFullData(){
    try{
        const candidates = ['data.json','./data.json','/data.json'];
        for(const c of candidates){
            try{
                const r = await fetch(c);
                if(r.ok){ const d = await r.json(); return d[0]; }
            }catch(e){}
        }
    }catch(e){ console.warn('tryLoadFullData failed', e); }
    return null;
}

function createArticleElement(article, favorites, highlight){
    const el = document.createElement('article');
    el.className = 'article-card card-right';
    el.id = `article-${article.ArtNo}`;

    const header = document.createElement('header');
    header.className = 'article-header';
    // Highlight ArtNo or Name matches in the header if highlight query provided
    let headerText = `Article ${article.ArtNo}: ${article.Name}`;
    if(highlight){
        // highlight numbers like "56" and words in the header
        try{
            const esc = highlight.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
            const re = new RegExp(`(${esc})`,`ig`);
            headerText = headerText.replace(re, '<mark>$1</mark>');
        }catch(e){ /* ignore regex errors */ }
    }
    header.innerHTML = `<h3>${headerText}</h3>`;

    const actions = document.createElement('div');
    actions.className = 'article-actions';
    const favBtn = document.createElement('button');
    favBtn.className = 'btn-icon';
    favBtn.title = 'Toggle favorite';
    favBtn.innerText = favorites.has(article.ArtNo) ? '★' : '☆';
    favBtn.addEventListener('click', () => {
        toggleFavorite(article.ArtNo);
        favBtn.innerText = favorites.has(article.ArtNo) ? '★' : '☆';
    });

    const anchor = document.createElement('a');
    anchor.href = `#article-${article.ArtNo}`;
    anchor.innerText = '🔗';
    anchor.className = 'btn-icon';
    anchor.title = 'Link to this article';

    actions.appendChild(favBtn);
    actions.appendChild(anchor);
    header.appendChild(actions);

    el.appendChild(header);

        const desc = document.createElement('div');
        desc.className = 'article-desc';
        if (article.ArtDesc) desc.innerHTML = `<p>${highlightText(article.ArtDesc, highlight)}</p>`;
    el.appendChild(desc);

    if (article.Clauses && article.Clauses.length) {
        const list = document.createElement('div');
        list.className = 'clauses';
            article.Clauses.forEach(c => {
            const item = document.createElement('details');
            const summary = document.createElement('summary');
            summary.innerHTML = `<strong>Clause ${c.ClauseNo}</strong>`;
            const body = document.createElement('div');
            body.className = 'clause-body';
                body.innerHTML = `<p>${highlightText((c.ClauseDesc||''), highlight)}</p>`;
            item.appendChild(summary);
            item.appendChild(body);
            list.appendChild(item);
        });
        el.appendChild(list);
    }

    return el;
}

function loadFavorites() {
    try { return new Set(JSON.parse(localStorage.getItem('favArticles') || '[]')) } catch(e){ return new Set(); }
}

function saveFavorites(set) {
    localStorage.setItem('favArticles', JSON.stringify(Array.from(set)));
}

function toggleFavorite(artNo){
    const set = loadFavorites();
    if(set.has(artNo)) set.delete(artNo); else set.add(artNo);
    saveFavorites(set);
}

function matchesQuery(article, q){
    if(!q) return true;
    q = q.toLowerCase().trim();

    // If the query contains an article number, match ArtNo.
    // Accept forms anywhere in the text: "56", "article 56", "art 56", "artno 56"
    let n = null;
    const anyNum = q.match(/\b(\d+)\b/);
    const articleNumForm = q.match(/\b(?:article|art|artno)\b\D*(\d+)/i);
    if(articleNumForm && articleNumForm[1]) n = articleNumForm[1];
    else if(anyNum && anyNum[1]) n = anyNum[1];
    if(n){
        const artNoStr = String(article.ArtNo || '').replace(/^0+/, '');
        const qNumStr = String(n).replace(/^0+/, '');
        if(artNoStr === qNumStr) return true;
        // If ArtNo includes numeric component (e.g., '56A'), check inclusion
        if(artNoStr.toLowerCase().includes(qNumStr.toLowerCase())) return true;
    }

    // normal match across title and description
    if((article.Name||'').toLowerCase().includes(q)) return true;
    if((article.ArtDesc||'').toLowerCase().includes(q)) return true;
    if(article.Clauses){
        for(const c of article.Clauses){
            if((c.ClauseDesc||'').toLowerCase().includes(q)) return true;
        }
    }
    return false;
}

function debounce(fn, wait=250){
    let t;
    return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); }
}

function highlightText(text, q){
    if(!q) return text.replace(/\n/g,'<br>');
    try{
        const esc = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
        const re = new RegExp(`(${esc})`,`ig`);
        return text.replace(re, '<mark>$1</mark>').replace(/\n/g,'<br>');
    } catch(e){ return text.replace(/\n/g,'<br>'); }
}

function populateFavsSidebar(favorites, articles){
    const list = document.getElementById('favList');
    const noFavs = document.getElementById('noFavs');
    list.innerHTML = '';
    const favArray = Array.from(favorites);
    if(favArray.length === 0){ noFavs.style.display = 'block'; return; }
    noFavs.style.display = 'none';
    for(const id of favArray){
        const art = articles.find(a=>a.ArtNo===id);
        if(!art) continue;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#article-${art.ArtNo}`;
        a.textContent = `Article ${art.ArtNo}: ${art.Name}`;
        li.appendChild(a);
        list.appendChild(li);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
        const articles = await fetchConstitutionData();
        console.log('fetchConstitutionData -> loaded articles count:', Array.isArray(articles) ? articles.length : 'not-array');
        if(Array.isArray(articles)){
            console.log('sample ArtNos:', articles.slice(0,12).map(a=>a.ArtNo).join(', '));
        }

    const preambleEl = document.getElementById('preamble-content');
    if(articles && articles[0] && articles[0].ArtDesc){
        preambleEl.innerHTML = `<p>${articles[0].ArtDesc.replace(/\n/g,'<br>')}</p>`;
    }

    const container = document.getElementById('articles-content');
    const searchInput = document.getElementById('searchInput');
    const favToggle = document.getElementById('favToggle');
    const expandAll = document.getElementById('expandAll');
    const resultsCount = document.getElementById('resultsCount');

    let favorites = loadFavorites();

    // expose articles for debugging
    window._articles = articles;

        function render(){
            container.innerHTML = '';
            const q = (searchInput && searchInput.value || '').trim();
            const showFavs = favToggle && favToggle.checked;
            const clauseOnly = document.getElementById('clauseOnly') && document.getElementById('clauseOnly').checked;
            let shown = 0;
            for(const art of articles){
                if(art && (art.ArtNo === '0' || art.ArtNo === 0)) continue; // skip preamble
                        try{
                            const isFav = favorites.has(art.ArtNo);
                            if(showFavs && !isFav) continue;
                            // clauseOnly: match only within clauses
                            if(clauseOnly){
                                const clausesArr = Array.isArray(art.Clauses) ? art.Clauses : (art.Clauses ? Object.values(art.Clauses) : []);
                                const matchInClauses = clausesArr && clausesArr.some(c=> (c.ClauseDesc||'').toLowerCase().includes(q.toLowerCase()));
                                if(q && !matchInClauses) continue;
                            } else {
                                if(!matchesQuery(art, q)) continue;
                            }

                            // guard: ensure Clauses is an array for later code that expects forEach
                            if(art.Clauses && !Array.isArray(art.Clauses)){
                                try{
                                    art.Clauses = Object.values(art.Clauses);
                                }catch(e){ art.Clauses = []; }
                            }

                            const el = createArticleElement(art, favorites, q);
                            container.appendChild(el);
                            shown++;
                        }catch(err){
                            console.error('Failed to render article', art && art.ArtNo, err);
                            const errEl = document.getElementById('dataError');
                            if(errEl){ errEl.style.display='block'; errEl.textContent = 'Some articles could not be rendered. See console for details.'; }
                            continue; // keep rendering remaining articles
                        }
                    }
            resultsCount.textContent = `${shown} / ${Math.max(0, (Array.isArray(articles)? articles.length-1:0))} articles shown`;
            populateFavsSidebar(favorites, articles);

            if(shown === 0){
                container.innerHTML = `<div class="card-right" style="padding:18px;text-align:center;"><p class="muted">No articles matched your search.</p><p class="small">Try removing filters or searching for a different keyword.</p></div>`;
            }
        }

        const debouncedRender = debounce(render, 180);
        searchInput && searchInput.addEventListener('input', debouncedRender);
        favToggle && favToggle.addEventListener('change', render);

        // Listen for clicks on article fav buttons to refresh favorites set and sidebar
        container.addEventListener('click', (e)=>{
            if(e.target && e.target.nodeName === 'BUTTON'){
                // small heuristic: a favorite toggle will change storage — re-load and render
                setTimeout(()=>{ favorites = loadFavorites(); render(); }, 60);
            }
        });

    expandAll && expandAll.addEventListener('click', () => {
        const details = container.querySelectorAll('details');
        const anyClosed = Array.from(details).some(d => !d.open);
        details.forEach(d => d.open = anyClosed);
    });

    // Re-render when favorites change (localStorage might have been updated elsewhere)
    window.addEventListener('storage', () => { favorites = loadFavorites(); render(); });

    render();

    // If URL has hash, scroll to it
    if(location.hash){
        const el = document.querySelector(location.hash);
        el && el.scrollIntoView({behavior:'smooth'});
    }

        // wire load full data button and file input
        const loadBtn = document.getElementById('loadFullData');
        const dataErr = document.getElementById('dataError');
        const dataErrMsg = document.getElementById('dataErrorMsg');
        const fileInput = document.getElementById('loadLocalFile');

        if(dataErr){
            dataErr.style.display = 'block';
            dataErrMsg.textContent = 'If the page shows only a subset, load the full dataset from the server or choose a local data.json file.';
            loadBtn.style.display = 'inline-block';
        }

        if(loadBtn){
            loadBtn.addEventListener('click', async ()=>{
                loadBtn.disabled = true;
                loadBtn.textContent = 'Trying...';
                const full = await tryLoadFullData();
                loadBtn.disabled = false;
                loadBtn.textContent = 'Load full data from server';
                if(full){
                    // replace articles and rerender
                    articles.length = 0; // clear
                    for(const a of full) articles.push(a);
                    window._articles = articles;
                    render();
                    dataErr.style.display = 'none';
                } else {
                    alert('Could not fetch data.json from server. Check server or try uploading a local file.');
                }
            });
        }

        if(fileInput){
            fileInput.addEventListener('change', (ev)=>{
                const f = ev.target.files && ev.target.files[0];
                if(!f) return;
                const reader = new FileReader();
                reader.onload = (e)=>{
                    try{
                        const parsed = JSON.parse(e.target.result);
                        if(Array.isArray(parsed) && parsed[0]){
                            articles.length = 0;
                            for(const a of parsed[0]) articles.push(a);
                            window._articles = articles;
                            render();
                            dataErr.style.display = 'none';
                        } else alert('Selected file does not contain expected data structure.');
                    }catch(err){ alert('Failed to parse JSON file: '+err.message); }
                };
                reader.readAsText(f);
            });
        }
});

