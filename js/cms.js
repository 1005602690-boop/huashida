/* ============================================================
   华仕达智能机械 · 内容渲染（内容来自 content/*.json 与 content/pages/*.md，供 Decap CMS 编辑）
   功能：
     - 渲染产品 / 新闻 / 案例 卡片（支持后台上传的图片与视频）
     - 按 menu.json 渲染顶部导航（全站，可后台编辑）
     - 按 settings.json 重建页脚与联系信息
     - page.html 查看器：渲染 content/pages/*.md（支持插图/视频的 Markdown）
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function fetchText(u) {
    return fetch(u, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(u + ' -> ' + r.status);
      return r.text();
    });
  }
  function fetchJSON(u) {
    return fetch(u, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(u + ' -> ' + r.status);
      return r.json();
    });
  }
  function thumbStyle(img) {
    return img ? ' style="background-image:url(\'' + esc(img) + '\');background-size:cover;background-position:center"' : '';
  }
  function isVideo(u) { return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(u || ''); }
  function videoBtn(v) {
    return v ? '<a class="btn btn--ghost" href="' + esc(v) + '" target="_blank" rel="noopener"><span data-zh>▶ 观看视频</span><span data-en>▶ Video</span></a>' : '';
  }

  var CAT = {
    hf: { zh: '高周波', en: 'HF' },
    ultrasonic: { zh: '超声波', en: 'Ultrasonic' },
    auto: { zh: '自动化', en: 'Auto' },
    pack: { zh: '包装', en: 'Pack' },
    mold: { zh: '模具', en: 'Tooling' }
  };
  var NEWS_TAG = {
    company: { zh: '企业动态', en: 'Company' },
    trend: { zh: '行业趋势', en: 'Trend' },
    new: { zh: '新品发布', en: 'New' },
    expo: { zh: '展会信息', en: 'Expo' }
  };
  var IND = {
    plastic: { zh: '塑胶行业', en: 'Plastics' },
    toy: { zh: '玩具行业', en: 'Toys' },
    appliance: { zh: '电器行业', en: 'Appliances' },
    electronic: { zh: '电子行业', en: 'Electronics' },
    hardware: { zh: '五金行业', en: 'Hardware' },
    print: { zh: '印刷行业', en: 'Printing' }
  };

  /* ---------- 导航（来自 menu.json，全站） ---------- */
  function renderMenu(items) {
    var nav = $('#navMenu');
    if (!nav || !items) return;
    var current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    nav.innerHTML = (items || []).map(function (m) {
      var url = m.url || '#';
      var u = url.toLowerCase().split('?')[0].split('#')[0];
      var active = (u === current) ? ' class="is-active"' : '';
      return '<a href="' + esc(url) + '"' + active + '><span data-zh>' + esc(m.label_zh) + '</span><span data-en>' + esc(m.label_en) + '</span></a>';
    }).join('');
  }

  /* ---------- 产品 ---------- */
  function renderProducts(items) {
    $$('.product-grid[data-grid]').forEach(function (grid) {
      var cat = grid.getAttribute('data-grid');
      var list = (items || []).filter(function (p) { return p.cat === cat; });
      grid.innerHTML = list.map(function (p) {
        var c = CAT[p.cat] || { zh: p.cat, en: p.cat };
        var inquiry = p.inquiry || (p.name_zh + ' | ' + p.name_en);
        return '<div class="product-card" data-cat="' + esc(p.cat) + '">'
          + '<div class="product-card__thumb"' + thumbStyle(p.image) + '></div>'
          + '<div class="product-card__body">'
          + '<span class="cat-tag"><span data-zh>' + esc(c.zh) + '</span><span data-en>' + esc(c.en) + '</span></span>'
          + '<h3><span data-zh>' + esc(p.name_zh) + '</span><span data-en>' + esc(p.name_en) + '</span></h3>'
          + '<p><span data-zh>' + esc(p.desc_zh) + '</span><span data-en>' + esc(p.desc_en) + '</span></p>'
          + '<div class="actions">'
          + '<button class="btn btn--primary" data-inquiry="' + esc(inquiry) + '"><span data-zh>询价</span><span data-en>Quote</span></button>'
          + '<a class="btn btn--ghost" href="contact.html"><span data-zh>咨询</span><span data-en>Ask</span></a>'
          + videoBtn(p.video)
          + '</div></div></div>';
      }).join('');
    });
  }

  /* ---------- 新闻 ---------- */
  function renderNews(items) {
    var grid = $('#newsGrid');
    if (!grid) return;
    grid.innerHTML = (items || []).map(function (n) {
      var t = NEWS_TAG[n.cat] || { zh: n.cat, en: n.cat };
      return '<div class="news-card" data-cat="' + esc(n.cat) + '">'
        + '<div class="news-card__thumb"' + thumbStyle(n.image) + '></div>'
        + '<div class="news-card__body">'
        + '<div class="news-card__meta"><span class="tag"><span data-zh>' + esc(t.zh) + '</span><span data-en>' + esc(t.en) + '</span></span>' + esc(n.date) + '</div>'
        + '<h3><span data-zh>' + esc(n.title_zh) + '</span><span data-en>' + esc(n.title_en) + '</span></h3>'
        + '<p><span data-zh>' + esc(n.summary_zh) + '</span><span data-en>' + esc(n.summary_en) + '</span></p>'
        + '</div></div>';
    }).join('');
  }

  /* ---------- 案例 ---------- */
  function renderCases(items) {
    var grid = $('#solGrid');
    if (!grid) return;
    grid.innerHTML = (items || []).map(function (c) {
      var ind = IND[c.ind] || { zh: c.ind_zh || c.ind, en: c.ind_en || c.ind };
      var media = '';
      if (c.video && isVideo(c.video)) {
        media = '<div class="sol-card__media"><video src="' + esc(c.video) + '" controls preload="none" poster="' + esc(c.image || '') + '"></video></div>';
      } else if (c.image) {
        media = '<div class="sol-card__media"><img src="' + esc(c.image) + '" alt="' + esc(c.title_zh) + '"></div>';
      }
      function step(k_zh, k_en, v_zh, v_en, extra) {
        return '<div class="sol-step ' + (extra || '') + '"><div class="k"><span data-zh>' + esc(k_zh) + '</span><span data-en>' + esc(k_en) + '</span></div>'
          + '<div class="v"><span data-zh>' + esc(v_zh) + '</span><span data-en>' + esc(v_en) + '</span></div></div>';
      }
      return '<div class="sol-card" data-ind="' + esc(c.ind) + '">'
        + media
        + '<div class="sol-card__head">'
        + '<span class="ind"><span data-zh>' + esc(ind.zh) + '</span><span data-en>' + esc(ind.en) + '</span></span>'
        + '<h3><span data-zh>' + esc(c.title_zh) + '</span><span data-en>' + esc(c.title_en) + '</span></h3>'
        + '</div>'
        + step('客户背景', 'Background', c.bg_zh, c.bg_en)
        + step('解决方案', 'Solution', c.sol_zh, c.sol_en)
        + step('实施效果', 'Result', c.res_zh, c.res_en, 'sol-step--result')
        + '</div>';
    }).join('');
  }

  /* ---------- 主页大图（来自 settings.hero_image） ---------- */
  function renderHeroImage(s) {
    if (!s) return;
    var img = $('#heroImg');
    if (img && s.hero_image) img.src = s.hero_image;
  }

  /* ---------- 分类卡片背景图（来自 settings.cat_images / cat_img_*） ---------- */
  function renderCatImages(s) {
    if (!s) return;
    // 支持两种格式：cat_images 对象 或 cat_img_* 扁平字段
    var map = s.cat_images || {};
    map.hf   = s.cat_img_hf   || (map.hf || '');
    map.ultrasonic = s.cat_img_ultrasonic || (map.ultrasonic || '');
    map.auto = s.cat_img_auto || (map.auto || '');
    map.pack = s.cat_img_pack || (map.pack || '');
    map.mold = s.cat_img_mold || (map.mold || '');

    $$('.cat-card[data-cat]').forEach(function (card) {
      var cat = card.getAttribute('data-cat');
      var url = map[cat];
      if (!url) return;
      var bg = card.querySelector('.cat-card__bg');
      if (bg) bg.style.backgroundImage = "url('" + esc(url) + "')";
    });
  }

  /* ---------- 主页案例卡片（来自 cases.json，前 3 条） ---------- */
  function renderHomeCases(items) {
    var grid = $('#homeCaseGrid');
    if (!grid) return;
    var list = (items || []).slice(0, 3);
    if (!list.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = list.map(function (c) {
      var ind = IND[c.ind] || { zh: c.ind_zh || c.ind, en: c.ind_en || c.ind };
      var thumb = c.image
        ? '<div class="case-card__thumb" style="background-image:url(\'' + esc(c.image) + '\');background-size:cover;background-position:center"></div>'
        : '<div class="case-card__thumb"><svg viewBox="0 0 320 200" preserveAspectRatio="none"><rect width="320" height="200" fill="#0d3a63"/><rect x="40" y="60" width="240" height="90" rx="8" fill="#1f9bff" opacity=".3"/><circle cx="160" cy="105" r="30" fill="#00c2d6"/></svg></div>';
      return '<div class="case-card">'
        + thumb
        + '<div class="case-card__body">'
        + '<span class="ind"><span data-zh>' + esc(ind.zh) + '</span><span data-en>' + esc(ind.en) + '</span></span>'
        + '<h3><span data-zh>' + esc(c.title_zh) + '</span><span data-en>' + esc(c.title_en) + '</span></h3>'
        + '<p><span data-zh>' + esc(c.bg_zh || '') + '</span><span data-en>' + esc(c.bg_en || '') + '</span></p>'
        + '</div></div>';
    }).join('');
  }

  /* ---------- 设置：页脚与联系信息 ---------- */
  var IC_LOC = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>';
  var IC_TEL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"/></svg>';
  var IC_MAIL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';

  function renderFooterContact(s) {
    if (!s) return;
    $$('.footer-contact').forEach(function (fc) {
      fc.innerHTML =
        '<h4><span data-zh>联系我们</span><span data-en>Contact</span></h4>'
        + '<div class="row"><b><span data-zh>地址</span><span data-en>Addr</span></b><span><span data-zh>' + esc(s.address_zh) + '</span><span data-en>' + esc(s.address_en) + '</span></span></div>'
        + '<div class="row"><b><span data-zh>罗先生</span><span data-en>Mr. Luo</span></b><span>' + esc(s.phone_luo) + '</span></div>'
        + '<div class="row"><b><span data-zh>孙小姐</span><span data-en>Ms. Sun</span></b><span>' + esc(s.phone_sun) + '</span></div>'
        + '<div class="row"><b>Email</b><span>' + esc(s.email) + '</span></div>';
    });
  }

  function renderContactInfo(s) {
    if (!s) return;
    var card = $('.info-card');
    if (!card) return;
    card.innerHTML =
      '<h3><span data-zh>联系方式</span><span data-en>Get in Touch</span></h3>'
      + '<div class="info-row"><div class="ic">' + IC_LOC + '</div><div class="txt"><b><span data-zh>公司地址</span><span data-en>Address</span></b><span><span data-zh>' + esc(s.address_zh) + '</span><span data-en>' + esc(s.address_en) + '</span></span></div></div>'
      + '<div class="info-row"><div class="ic">' + IC_TEL + '</div><div class="txt"><b><span data-zh>罗先生</span><span data-en>Mr. Luo</span></b><span>' + esc(s.phone_luo) + '</span></div></div>'
      + '<div class="info-row"><div class="ic">' + IC_TEL + '</div><div class="txt"><b><span data-zh>孙小姐</span><span data-en>Ms. Sun</span></b><span>' + esc(s.phone_sun) + '</span></div></div>'
      + '<div class="info-row"><div class="ic">' + IC_MAIL + '</div><div class="txt"><b>Email</b><span>' + esc(s.email) + '</span></div></div>';
  }

  /* ---------- 轻量 Markdown 解析（用于页面管理） ---------- */
  function mdInline(s) {
    return esc(s)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (m, t, u) {
        return '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>';
      });
  }
  function renderMarkdown(md) {
    if (!md) return '';
    var html = '', listOpen = false;
    md.replace(/\r/g, '').split('\n').forEach(function (line) {
      var m;
      if ((m = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/))) {
        if (listOpen) { html += '</ul>'; listOpen = false; }
        var src = m[2], alt = m[1];
        html += isVideo(src)
          ? '<div class="md-media"><video src="' + esc(src) + '" controls preload="none"></video></div>'
          : '<div class="md-media"><img src="' + esc(src) + '" alt="' + esc(alt) + '"></div>';
        return;
      }
      if ((m = line.match(/^(#{1,3})\s+(.*)$/))) {
        if (listOpen) { html += '</ul>'; listOpen = false; }
        var lvl = m[1].length;
        html += '<h' + lvl + '>' + mdInline(m[2]) + '</h' + lvl + '>';
        return;
      }
      if ((m = line.match(/^>\s?(.*)$/))) {
        if (listOpen) { html += '</ul>'; listOpen = false; }
        html += '<blockquote>' + mdInline(m[1]) + '</blockquote>';
        return;
      }
      if ((m = line.match(/^[-*]\s+(.*)$/))) {
        if (!listOpen) { html += '<ul>'; listOpen = true; }
        html += '<li>' + mdInline(m[1]) + '</li>';
        return;
      }
      if (line.trim() === '') {
        if (listOpen) { html += '</ul>'; listOpen = false; }
        return;
      }
      if (listOpen) { html += '</ul>'; listOpen = false; }
      html += '<p>' + mdInline(line) + '</p>';
    });
    if (listOpen) html += '</ul>';
    return html;
  }

  /* ---------- 页面查看器（page.html?p=slug） ---------- */
  function renderPage() {
    var box = $('#pageContent');
    if (!box) return;
    var slug = new URLSearchParams(location.search).get('p');
    if (!slug) {
      box.innerHTML = '<div class="container"><p style="padding:60px 0;color:#8a99a8">未指定页面（?p=页面名）。</p></div>';
      return;
    }
    fetchText('content/pages/' + slug + '.md').then(function (txt) {
      var body = txt, title = slug;
      var fm = txt.match(/^---\n([\s\S]*?)\n---\n?/);
      if (fm) {
        body = txt.slice(fm[0].length);
        fm[1].split('\n').forEach(function (ln) {
          var kv = ln.match(/^([a-z_]+):\s?(.*)$/i);
          if (kv) {
            if (kv[1] === 'title_zh') title = kv[2];
            if (kv[1] === 'title_en') box.setAttribute('data-title-en', kv[2]);
          }
        });
      }
      box.innerHTML = '<article class="page-article"><h1>' + esc(title) + '</h1>' + renderMarkdown(body) + '</article>';
    }).catch(function (e) {
      box.innerHTML = '<div class="container"><p style="padding:60px 0;color:#8a99a8">页面不存在或加载失败：' + esc(slug) + '</p></div>';
      console.warn('[cms] 页面加载失败', e);
    });
  }

  /* ---------- 启动 ---------- */
  function boot() {
    fetchJSON('content/settings.json').then(function (s) {
      renderFooterContact(s);
      renderContactInfo(s);
      renderHeroImage(s);
      renderCatImages(s);
    }).catch(function (e) { console.warn('[cms] settings 加载失败', e); });

    fetchJSON('content/menu.json').then(function (m) {
      renderMenu(m.items);
    }).catch(function (e) { console.warn('[cms] menu 加载失败（沿用静态导航）', e); });

    if ($('.product-grid[data-grid]')) {
      fetchJSON('content/products.json').then(function (d) { renderProducts(d.items); })
        .catch(function (e) { console.warn('[cms] products 加载失败', e); });
    }
    if ($('#newsGrid')) {
      fetchJSON('content/news.json').then(function (d) { renderNews(d.items); })
        .catch(function (e) { console.warn('[cms] news 加载失败', e); });
    }
    fetchJSON('content/cases.json').then(function (d) {
      if ($('#solGrid')) renderCases(d.items);
      if ($('#homeCaseGrid')) renderHomeCases(d.items);
    }).catch(function (e) { console.warn('[cms] cases 加载失败', e); });
    if ($('#pageContent')) {
      renderPage();
    }
  }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
