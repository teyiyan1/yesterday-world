// ── 搜索模块（内联下拉）──────────────────────────────────────
(async function () {
  const searchWrapper     = document.getElementById('searchWrapper');
  const inlineSearch      = document.getElementById('inlineSearch');
  const input             = document.getElementById('inlineSearchInput');
  const clearBtn          = document.getElementById('inlineSearchClear');
  const searchDropdown    = document.getElementById('searchDropdown');
  const searchResults     = document.getElementById('searchResults');
  const searchRecent      = document.getElementById('searchRecent');
  const searchRecentTags  = document.getElementById('searchRecentTags');
  const searchBackdrop    = document.getElementById('searchBackdrop');
  const trigger           = document.getElementById('searchTrigger');
  const bookDrawer        = document.getElementById('bookDrawer');
  const bookDrawerChapter = document.getElementById('bookDrawerChapter');
  const bookDrawerBody    = document.getElementById('bookDrawerBody');
  const bookDrawerClose   = document.getElementById('bookDrawerClose');
  const bookDrawerBackdrop = document.getElementById('bookDrawerBackdrop');

  if (!searchWrapper || !input) return;

  // ── 页面滚动锁定 ─────────────────────────────────────────
  let _scrollLock = null;
  function lockPageScroll(allowedEl) {
    if (_scrollLock) return;
    _scrollLock = (e) => {
      if (!allowedEl || !allowedEl.contains(e.target)) {
        e.preventDefault();
      }
    };
    window.__lenis?.stop();
    document.addEventListener('wheel',     _scrollLock, { passive: false });
    document.addEventListener('touchmove', _scrollLock, { passive: false });
  }
  function unlockPageScroll() {
    if (!_scrollLock) return;
    document.removeEventListener('wheel',     _scrollLock);
    document.removeEventListener('touchmove', _scrollLock);
    _scrollLock = null;
    window.__lenis?.start();
  }

  // ── 原文抽屉 ────────────────────────────────────────────
  function openBookDrawer(item, matches) {
    if (!bookDrawer) return;

    bookDrawerChapter.textContent = item.chapter || '';

    // 取前后各 3 段（同章节），用 allDocs 而非私有 fuse._docs
    const idx = allDocs.findIndex(d => d.id === item.id);
    const BEFORE = 3, AFTER = 4;
    const paragraphs = [];
    for (let i = Math.max(0, idx - BEFORE); i <= Math.min(allDocs.length - 1, idx + AFTER); i++) {
      const doc = allDocs[i];
      if (doc.type !== 'book' || doc.chapter !== item.chapter) continue;
      paragraphs.push({ doc, isCurrent: doc.id === item.id });
    }

    bookDrawerBody.innerHTML = paragraphs.map(({ doc, isCurrent }) => {
      let text;
      if (isCurrent) {
        // 全文高亮（先插标记 → escape → 还原标签）
        const textMatches = (matches || []).filter(m => m.key === 'text');
        const ranges = [];
        textMatches.forEach(m => ranges.push(...m.indices));
        ranges.sort((a, b) => b[0] - a[0]);
        let arr = [...doc.text];
        ranges.forEach(([s, e]) => {
          arr.splice(e + 1, 0, '\x01');
          arr.splice(s, 0, '\x00');
        });
        text = escapeHtml(arr.join(''))
          .replace(/\x00/g, '<mark class="mark-book">')
          .replace(/\x01/g, '</mark>');
      } else {
        text = escapeHtml(doc.text);
      }
      return `<p class="drawer-paragraph${isCurrent ? ' drawer-paragraph--current' : ''}"${isCurrent ? ' id="drawerCurrentPara"' : ''}>${text}</p>`;
    }).join('');

    bookDrawer.classList.add('open');
    bookDrawerBackdrop.classList.add('visible');
    // 使用 body overflow 锁定背景，避免锁住抽屉内部的 wheel/touchmove 导致无法滑动
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();

    setTimeout(() => {
      const cur = document.getElementById('drawerCurrentPara');
      if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 400);
  }

  function closeBookDrawer() {
    if (!bookDrawer) return;
    bookDrawer.classList.remove('open');
    bookDrawerBackdrop.classList.remove('visible');
    document.body.style.overflow = '';
    window.__lenis?.start();
  }

  if (bookDrawerClose)    bookDrawerClose.addEventListener('click', closeBookDrawer);
  if (bookDrawerBackdrop) bookDrawerBackdrop.addEventListener('click', closeBookDrawer);

  // 触控板/滚轮：抽屉打开时手动处理 wheel，避免被 Lenis 等拦截
  if (bookDrawerBody) {
    bookDrawerBody.addEventListener('wheel', (e) => {
      if (!bookDrawer?.classList.contains('open')) return;
      if (!bookDrawer.contains(e.target)) return;
      e.stopPropagation();
      e.preventDefault();
      bookDrawerBody.scrollTop += e.deltaY;
    }, { passive: false, capture: true });
  }

  // 触控板/滚轮：搜索下拉打开时手动处理 wheel，使结果列表可滑动
  if (searchDropdown) {
    searchDropdown.addEventListener('wheel', (e) => {
      if (!searchWrapper?.classList.contains('open')) return;
      if (!searchWrapper.contains(e.target)) return;
      e.stopPropagation();
      e.preventDefault();
      searchDropdown.scrollTop += e.deltaY;
    }, { passive: false, capture: true });
  }

  let timer;
  const RECENT_KEY = 'yesterday-world-search-recent';
  const RECENT_MAX = 8;

  function getRecent() {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }
  function saveRecent(list) {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
    } catch (e) {}
  }
  function addRecent(q) {
    if (!q || !q.trim()) return;
    let list = getRecent().filter(s => s !== q.trim());
    list.unshift(q.trim());
    saveRecent(list);
  }

  // ── 构建索引 ────────────────────────────────────────────
  let fuse = null;
  let allDocs = [];  // 自维护文档列表，避免依赖 fuse._docs 私有 API

  async function buildIndex() {
    const docs = [];
    try {
      const res  = await fetch('./book-content.json');
      const book = await res.json();
      book.forEach((item, i) => docs.push({
        id: 'book-' + i,
        type: 'book',
        chapter: item.chapter,
        text: item.text,
      }));
    } catch (e) { console.warn('book-content.json 加载失败', e); }
    document.querySelectorAll('.timeline-card').forEach((card, i) => {
      const title = card.querySelector('.timeline-card-title')?.textContent.trim() || '';
      const quote = card.querySelector('.timeline-quote')?.textContent.trim()      || '';
      const year  = card.querySelector('.timeline-year')?.textContent.trim()       || '';
      docs.push({ id: 'tl-' + i, type: 'timeline', title, text: quote, year, el: card });
    });
    document.querySelectorAll('.quote-item').forEach((item, i) => {
      const text = item.querySelector('.quote-text')?.textContent.trim() || '';
      docs.push({ id: 'qt-' + i, type: 'quote', text, el: item });
    });
    document.querySelectorAll('.thought-item').forEach((item, i) => {
      const original = item.querySelector('.thought-original-text')?.textContent.trim() || '';
      const thought  = item.querySelector('.thought-text')?.textContent.trim()          || '';
      docs.push({ id: 'th-' + i, type: 'thought', text: original + ' ' + thought, original, thought, el: item });
    });
    allDocs = docs;
    fuse = new Fuse(docs, {
      keys: ['text', 'title', 'chapter', 'year', 'original', 'thought'],
      threshold: 0.35,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }

  // ── 打开 / 关闭 ─────────────────────────────────────────
  function openSearch() {
    if (searchWrapper.classList.contains('open')) return; // 幂等守卫
    searchWrapper.classList.add('open');
    if (searchBackdrop) searchBackdrop.classList.add('visible');
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    input.focus();
    if (!fuse) buildIndex();
    renderRecentTags();
    const q = input.value.trim();
    if (!q) {
      searchResults.innerHTML = '<p class="search-hint">输入关键词搜索《昨日的世界》全书及笔记</p>';
    }
  }
  function closeSearch() {
    searchWrapper.classList.remove('open');
    if (searchBackdrop) searchBackdrop.classList.remove('visible');
    document.body.style.overflow = '';
    window.__lenis?.start();
    updateClearVisibility();
  }
  function updateClearVisibility() {
    if (clearBtn) clearBtn.classList.toggle('visible', !!input.value.trim());
  }

  // ── 最近搜索标签 ────────────────────────────────────────
  function renderRecentTags() {
    if (!searchRecent) return;
    searchRecent.style.display = '';
    if (!searchRecentTags) return;
    const list = getRecent();
    if (!list.length) {
      searchRecentTags.innerHTML = '<span class="search-hint" style="padding:0 0 8px; display:block;">暂无最近搜索</span>';
      return;
    }
    searchRecentTags.innerHTML = list.map(q => `
      <span class="search-tag" data-q="${escapeAttr(q)}">
        ${escapeHtml(q)}
        <button type="button" class="search-tag-del" data-q="${escapeAttr(q)}" aria-label="删除">
          <span class="material-symbols-rounded">close</span>
        </button>
      </span>
    `).join('');
    searchRecentTags.querySelectorAll('.search-tag').forEach(el => {
      const q = el.dataset.q || '';
      el.addEventListener('click', (e) => {
        if (e.target.closest('.search-tag-del')) return;
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        updateClearVisibility();
      });
    });
    searchRecentTags.querySelectorAll('.search-tag-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const q = (btn.dataset.q || '').trim();
        let list = getRecent().filter(s => s !== q);
        saveRecent(list);
        renderRecentTags();
      });
    });
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function escapeAttr(s) {
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ── 事件绑定 ────────────────────────────────────────────
  if (inlineSearch) {
    inlineSearch.addEventListener('click', (e) => {
      if (e.target === clearBtn || clearBtn?.contains(e.target)) return;
      openSearch();
    });
  }
  if (input) {
    input.addEventListener('focus', openSearch);
    input.addEventListener('input', () => {
      updateClearVisibility();
      clearTimeout(timer); // 先清定时器，防止空输入时旧查询仍触发
      const q = input.value.trim();
      if (!q) {
        if (searchWrapper.classList.contains('open')) {
          renderRecentTags();
          if (searchResults) searchResults.innerHTML = '<p class="search-hint">输入关键词搜索《昨日的世界》全书及笔记</p>';
        }
        return;
      }
      timer = setTimeout(() => {
        if (!fuse) return;
        const res = fuse.search(q, { limit: 30 });
        renderResults(res);
      }, 180);
    });
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      input.value = '';
      input.focus();
      updateClearVisibility();
      renderRecentTags();
      searchResults.innerHTML = '<p class="search-hint">输入关键词搜索《昨日的世界》全书及笔记</p>';
    });
  }
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);
  if (trigger) trigger.addEventListener('click', openSearch);
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearch();
    }
    if (e.key === 'Escape') {
      // 抽屉优先，再关搜索
      if (bookDrawer?.classList.contains('open')) {
        closeBookDrawer();
      } else {
        closeSearch();
      }
    }
  });

  // ── 搜索逻辑 ────────────────────────────────────────────
  const LABEL = { book: '原文', timeline: '时间轴', quote: '金句', thought: '想法' };
  const COLOR = { book: '#9B59B6', timeline: '#3498DB', quote: '#FF6B6B', thought: '#1ABC9C' };

  // 通用高亮（非书籍，从头截取）
  function highlight(text, matches, keys = ['text', 'original']) {
    if (!matches || !matches.length) return escapeHtml(text);
    const ranges = [];
    matches.forEach(m => { if (keys.includes(m.key)) ranges.push(...m.indices); });
    ranges.sort((a, b) => b[0] - a[0]);
    let arr = [...text];
    ranges.forEach(([s, e]) => {
      arr.splice(e + 1, 0, '\x01');
      arr.splice(s, 0, '\x00');
    });
    // 先 escape，再还原标记为 HTML 标签（顺序重要，避免 > 被错误转义）
    return escapeHtml(arr.join(''))
      .replace(/\x00/g, '<mark>')
      .replace(/\x01/g, '</mark>');
  }

  // 书籍原文：提取关键词上下文窗口并高亮
  function bookExcerpt(text, matches) {
    const textMatches = (matches || []).filter(m => m.key === 'text' && m.indices.length);
    if (!textMatches.length) {
      return escapeHtml(text.slice(0, 150)) + (text.length > 150 ? '…' : '');
    }
    const [matchStart, matchEnd] = textMatches[0].indices[0];
    const CTX = 60;
    const ctxStart = Math.max(0, matchStart - CTX);
    const ctxEnd   = Math.min(text.length, matchEnd + CTX + 1);
    const excerpt  = text.slice(ctxStart, ctxEnd);

    const ranges = [];
    textMatches.forEach(m =>
      m.indices.forEach(([s, e]) => {
        const ns = s - ctxStart, ne = e - ctxStart;
        if (ns >= 0 && ne < excerpt.length) ranges.push([ns, ne]);
      })
    );
    ranges.sort((a, b) => b[0] - a[0]);

    let arr = [...excerpt];
    ranges.forEach(([s, e]) => {
      arr.splice(e + 1, 0, '\x01');
      arr.splice(s, 0, '\x00');
    });
    const hl = escapeHtml(arr.join(''))
      .replace(/\x00/g, '<mark class="mark-book">')
      .replace(/\x01/g, '</mark>');

    return (ctxStart > 0 ? '…' : '') + hl + (ctxEnd < text.length ? '…' : '');
  }

  function renderResults(items) {
    if (!searchResults) return;
    if (!items.length) {
      searchResults.innerHTML = '<p class="search-hint">没有找到相关内容</p>';
      return;
    }
    const groups = {};
    items.forEach(r => {
      const t = r.item.type;
      if (!groups[t]) groups[t] = [];
      groups[t].push(r);
    });
    const typeOrder = ['timeline', 'quote', 'thought', 'book'];
    let html = '';

    typeOrder.forEach(type => {
      if (!groups[type]) return;
      const color = COLOR[type];
      const list  = groups[type].slice(0, type === 'book' ? 10 : 99);

      if (type === 'book') {
        // 书籍原文：按章节分组展示
        const byChapter = {};
        list.forEach(r => {
          const ch = r.item.chapter || '未知章节';
          if (!byChapter[ch]) byChapter[ch] = [];
          byChapter[ch].push(r);
        });
        html += `<div class="search-group search-group--book">
          <div class="search-group-label" style="color:${color}">${LABEL[type]}</div>`;
        Object.entries(byChapter).forEach(([chapter, results]) => {
          html += `<div class="book-chapter-group">
            <div class="book-chapter-name">${escapeHtml(chapter)}</div>`;
          results.forEach(r => {
            const excerpt = bookExcerpt(r.item.text || '', r.matches);
            html += `<div class="search-result-item search-result-item--book" data-type="book" data-id="${r.item.id}">
              <p class="search-result-text">${excerpt}</p>
            </div>`;
          });
          html += '</div>';
        });
        html += '</div>';
      } else {
        html += `<div class="search-group">
          <div class="search-group-label" style="color:${color}">${LABEL[type]}</div>`;
        list.forEach(r => {
          const item = r.item;
          const previewText = (item.text || '').slice(0, 120);
          const hl = highlight(previewText, r.matches);
          let meta = '';
          if (type === 'timeline') meta = `<span class="search-meta">${escapeHtml(item.year)} · ${escapeHtml(item.title)}</span>`;
          html += `<div class="search-result-item" data-type="${type}" data-id="${item.id}">
            ${meta}
            <p class="search-result-text">${hl}…</p>
          </div>`;
        });
        html += '</div>';
      }
    });

    searchResults.innerHTML = html;
    if (searchRecent) searchRecent.style.display = 'none';

    // 书籍原文结果：点击打开侧拉抽屉
    searchResults.querySelectorAll('.search-result-item--book').forEach(el => {
      el.style.cursor = 'pointer';
      el.addEventListener('click', () => {
        const id  = el.dataset.id;
        const doc = allDocs.find(d => d.id === id);
        if (!doc) return;
        const q = input.value.trim();
        if (q) addRecent(q);
        // 找该结果对应的 fuse 搜索 matches
        const resultItem = groups['book']?.find(r => r.item.id === id);
        closeSearch();
        openBookDrawer(doc, resultItem?.matches || []);
      });
    });

    // 非书籍结果：切换 tab 并滚动
    searchResults.querySelectorAll('.search-result-item:not([data-type="book"])').forEach(el => {
      el.addEventListener('click', () => {
        const id   = el.dataset.id;
        const type = el.dataset.type;
        const q    = input.value.trim();
        if (q) addRecent(q);
        const map  = { timeline: 'timeline', quote: 'quotes', thought: 'thoughts' };
        const feature = document.querySelector(`.feature[data-feature="${map[type]}"]`);
        if (feature) feature.click();
        setTimeout(() => {
          const docEl = allDocs.find(d => d.id === id)?.el;
          if (docEl) {
            docEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            docEl.style.outline = `2px solid ${COLOR[type]}`;
            setTimeout(() => docEl.style.outline = '', 2000);
          }
          closeSearch();
        }, 200);
      });
    });
  }

  updateClearVisibility();
})();
