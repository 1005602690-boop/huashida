/* ============================================================
   华仕达智能机械 · 内容渲染（内容来自 content/*.json，供 Decap CMS 编辑）
   功能：渲染产品/新闻/案例卡片，并按 settings.json 重建页脚与联系信息
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
  function fetchJSON(u) {
    return fetch(u, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(u + ' -> ' + r.status);
      return r.json();
    });
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

  /* ---------- 产品 ---------- */
  function renderProducts(items) {
    $$('.product-grid[data-grid]').forEach(function (grid) {
      var cat = grid.getAttribute('data-grid');
      var list = (items || []).filter(function (p) { return p.cat === cat; });
      grid.innerHTML = list.map(function (p) {
        var c = CAT[p.cat] || { zh: p.cat, en: p.cat };
        var inquiry = p.inquiry || (p.name_zh + ' | ' + p.name_en);
        return '<div class="product-card" data-cat="' + esc(p.cat) + '">'
          + '<div class="product-card__thumb"></div>'
          + '<div class="product-card__body">'
          + '<span class="cat-tag"><span data-zh>' + esc(c.zh) + '</span><span data-en>' + esc(c.en) + '</span></span>'
          + '<h3><span data-zh>' + esc(p.name_zh) + '</span><span data-en>' + esc(p.name_en) + '</span></h3>'
          + '<p><span data-zh>' + esc(p.desc_zh) + '</span><span data-en>' + esc(p.desc_en) + '</span></p>'
          + '<div class="actions">'
          + '<button class="btn btn--primary" data-inquiry="' + esc(inquiry) + '"><span data-zh>询价</span><span data-en>Quote</span></button>'
          + '<a class="btn btn--ghost" href="contact.html"><span data-zh>咨询</span><span data-en>Ask</span></a>'
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
        + '<div class="news-card__thumb"></div>'
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
      function step(k_zh, k_en, v_zh, v_en, extra) {
        return '<div class="sol-step ' + (extra || '') + '"><div class="k"><span data-zh>' + esc(k_zh) + '</span><span data-en>' + esc(k_en) + '</span></div>'
          + '<div class="v"><span data-zh>' + esc(v_zh) + '</span><span data-en>' + esc(v_en) + '</span></div></div>';
      }
      return '<div class="sol-card" data-ind="' + esc(c.ind) + '">'
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

  /* ---------- 启动 ---------- */
  function boot() {
    fetchJSON('content/settings.json').then(function (s) {
      renderFooterContact(s);
      renderContactInfo(s);
    }).catch(function (e) { console.warn('[cms] settings 加载失败', e); });

    if ($('.product-grid[data-grid]')) {
      fetchJSON('content/products.json').then(function (d) { renderProducts(d.items); })
        .catch(function (e) { console.warn('[cms] products 加载失败', e); });
    }
    if ($('#newsGrid')) {
      fetchJSON('content/news.json').then(function (d) { renderNews(d.items); })
        .catch(function (e) { console.warn('[cms] news 加载失败', e); });
    }
    if ($('#solGrid')) {
      fetchJSON('content/cases.json').then(function (d) { renderCases(d.items); })
        .catch(function (e) { console.warn('[cms] cases 加载失败', e); });
    }
  }

  if (document.readyState !== 'loading') boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
