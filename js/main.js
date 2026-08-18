/* ============================================================
   华仕达智能机械 · 交互脚本
   功能：响应式导航 / 中英双语切换 / 标签页筛选 / 询盘弹窗 / 表单提交 / 返回顶部
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 工具 ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2600);
  }

  /* ---------- 双语切换 ---------- */
  var langToggle = $('#langToggle');
  function applyLang(lang) {
    document.body.classList.remove('lang-zh', 'lang-en');
    document.body.classList.add('lang-' + lang);
    if (langToggle) {
      $$('button', langToggle).forEach(function (b) {
        b.classList.toggle('is-active', b.dataset.lang === lang);
      });
    }
    try { localStorage.setItem('hsd-lang', lang); } catch (e) {}
  }
  if (langToggle) {
    langToggle.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-lang]');
      if (btn) applyLang(btn.dataset.lang);
    });
  }
  // 记忆语言偏好
  try {
    var saved = localStorage.getItem('hsd-lang');
    if (saved && (saved === 'zh' || saved === 'en')) applyLang(saved);
  } catch (e) {}

  /* ---------- 移动端导航 ---------- */
  var navToggle = $('#navToggle');
  var navMenu = $('#navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      navMenu.classList.toggle('is-open');
    });
    // 点击菜单项后收起
    navMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) navMenu.classList.remove('is-open');
    });
  }

  /* ---------- 当前导航高亮（按文件名） ---------- */
  var path = location.pathname.split('/').pop() || 'index.html';
  $$('#navMenu a').forEach(function (a) {
    var href = a.getAttribute('href');
    if (href === path) a.classList.add('is-active');
    else a.classList.remove('is-active');
  });

  /* ---------- FAQ 手风琴 ---------- */
  $$('#faqList .faq-item__q').forEach(function (q) {
    q.addEventListener('click', function () {
      q.parentElement.classList.toggle('is-open');
    });
  });

  /* ---------- 通用标签页筛选 ---------- */
  function setupTabs(tabsId, gridAttr, itemAttr) {
    var tabs = $('#' + tabsId);
    if (!tabs) return;
    var container = tabs.parentElement;
    function getItems() {
      return $$('[' + itemAttr + ']', container).filter(function (el) {
        return !el.classList.contains('tab-btn');
      });
    }
    tabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab-btn');
      if (!btn) return;
      $$('.tab-btn', tabs).forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var key = btn.dataset[gridAttr];
      getItems().forEach(function (it) {
        var match = key === 'all' || it.getAttribute(itemAttr) === key;
        it.style.display = match ? '' : 'none';
      });
    });
  }
  setupTabs('prodTabs', 'cat', 'data-cat');
  setupTabs('solTabs', 'ind', 'data-ind');
  setupTabs('newsTabs', 'cat', 'data-cat');

  /* ---------- 询盘弹窗（产品页） ---------- */
  var modal = $('#inquiryModal');
  var modalName = $('#modalProdName');
  function openModal(name) {
    if (!modal) return;
    if (modalName && name) {
      // 以 | 分隔时，按当前语言显示
      var parts = String(name).split('|');
      var lang = document.body.classList.contains('lang-en') ? 'en' : 'zh';
      modalName.textContent = lang === 'en' && parts[1] ? parts[1].trim() : (parts[0] || '').trim();
    }
    modal.classList.add('is-open');
  }
  function closeModal() { if (modal) modal.classList.remove('is-open'); }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-inquiry]');
    if (btn) openModal(btn.getAttribute('data-inquiry'));
  });
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-close]')) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- 表单提交 ---------- */
  function bindForm(formId, okMsg) {
    var form = $('#' + formId);
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var lang = document.body.classList.contains('lang-en') ? 'en' : 'zh';
      toast(lang === 'en' ? (okMsg.en || 'Submitted!') : (okMsg.zh || '提交成功！'));
      if (modal) closeModal();
      form.reset();
    });
  }
  bindForm('contactForm', { zh: '留言已提交，我们会尽快与您联系！', en: 'Message sent! We will contact you soon.' });
  bindForm('inquiryForm', { zh: '询盘已提交，商务将尽快与您对接！', en: 'Inquiry sent! Our team will reach you soon.' });

  /* ---------- 返回顶部 ---------- */
  var toTop = $('#toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('is-show', window.scrollY > 400);
    });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 在线客服浮窗（全局注入） ---------- */
  function injectCustomerService() {
    if ($('#csWidget')) return;
    var isContact = /contact\.html$/.test(location.pathname);
    var icPhone = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 0 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    var icWechat = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>';
    var icMail = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>';
    var qrImg = '<img src="assets/images/wechat.png" alt="微信二维码" style="width:150px;height:150px;border-radius:10px">';
    var html =
      '<div class="cs-widget" id="csWidget">' +
        '<div class="cs-panel">' +
          '<div class="cs-header"><h4><span data-zh>在线客服</span><span data-en>Live Support</span></h4>' +
            '<p><span data-zh>专业团队 1 个工作日内回复</span><span data-en>We reply within 1 business day</span></p></div>' +
          '<div class="cs-body">' +
            '<a class="cs-row" href="tel:13412109295"><span class="cs-ic">' + icPhone + '</span><span class="cs-meta"><b>罗先生</b><span>134 1210 9295</span></span></a>' +
            '<a class="cs-row" href="tel:18692606891"><span class="cs-ic">' + icPhone + '</span><span class="cs-meta"><b>孙小姐</b><span>186 9260 6891</span></span></a>' +
            '<div class="cs-row" id="csWechat"><span class="cs-ic">' + icWechat + '</span><span class="cs-meta"><b><span data-zh>微信咨询</span><span data-en>WeChat</span></b><span>huashida168</span></span></div>' +
            '<div class="cs-qr">' + qrImg + '<p><span data-zh>扫一扫，添加微信咨询</span><span data-en>Scan to add WeChat</span></p></div>' +
            '<a class="cs-row" href="mailto:huashida168@foxmail.com"><span class="cs-ic">' + icMail + '</span><span class="cs-meta"><b>Email</b><span>huashida168@foxmail.com</span></span></a>' +
            '<a class="cs-btn" id="csMsg" href="' + (isContact ? '#contactForm' : 'contact.html') + '"><span data-zh>在线留言</span><span data-en>Leave a Message</span></a>' +
          '</div>' +
          '<div class="cs-caption"><span data-zh>服务时间：周一至周六 9:00–18:00</span><span data-en>Mon–Sat 9:00–18:00</span></div>' +
        '</div>' +
        '<button class="cs-fab" id="csFab" aria-label="在线客服">' +
          '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>' +
        '</button>' +
      '</div>';
    var wrap = document.createElement('div');
    wrap.innerHTML = html.trim();
    document.body.appendChild(wrap.firstChild);
    var widget = $('#csWidget');
    $('#csFab').addEventListener('click', function () { widget.classList.toggle('is-open'); });
    $('#csWechat').addEventListener('click', function () { widget.classList.toggle('show-qr'); });
    if (isContact) {
      var msgBtn = $('#csMsg');
      if (msgBtn) msgBtn.addEventListener('click', function (e) {
        var f = $('#contactForm');
        if (f) { e.preventDefault(); f.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });
    }
  }
  injectCustomerService();

  /* ---------- 腾讯地图（仅联系页，自有 Key 模式） ---------- */
  function initContactMap() {
    var el = $('#map');
    if (!el) return;
    if (typeof TMap === 'undefined') {
      el.innerHTML = '<div style="height:100%;display:grid;place-items:center;color:#8a99a8;font-size:14px;text-align:center;padding:0 16px">地图未加载：请在 contact.html 填入自有腾讯地图 Key 与安全密钥</div>';
      return;
    }
    var ADDRESS = '广东省东莞市凤岗镇风清路7号1号108室';
    var fallback = new TMap.LatLng(22.8722, 114.0765); // 凤岗镇中心近似坐标(GCJ-02)
    var pinSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 36 48"><path d="M18 0C8 0 0 8 0 18c0 13 18 30 18 30s18-17 18-30C36 8 28 0 18 0z" fill="#1f9bff"/><circle cx="18" cy="18" r="7" fill="#fff"/></svg>';
    var map = new TMap.Map(el, { zoom: 15, center: fallback });
    var marker = new TMap.MultiMarker({
      map: map,
      styles: { hs: new TMap.MarkerStyle({ width: 36, height: 48, anchor: { x: 18, y: 48 }, src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pinSvg) }) },
      geometries: [{ id: 'hq', styleId: 'hs', position: fallback }]
    });
    var info = new TMap.InfoWindow({
      map: map, position: fallback,
      content: '<div style="padding:8px 12px;font-size:13px;line-height:1.5;color:#0a2a4a"><b>华仕达智能机械设备</b><br>' + ADDRESS + '</div>'
    });
    info.close();
    marker.on('click', function () { info.open(); });
    // 地理编码精修定位（代理模式下经后端路由，无需前端 Key）
    try {
      var geocoder = new TMap.service.Geocoder();
      geocoder.getLocation({ address: ADDRESS }).then(function (res) {
        var r = res && res.result && res.result.location;
        if (r) {
          var ll = new TMap.LatLng(r.lat, r.lng);
          map.setCenter(ll);
          marker.setGeometries([{ id: 'hq', styleId: 'hs', position: ll }]);
          info.setPosition(ll);
        }
      }).catch(function () {});
    } catch (e) {}
  }
  initContactMap();
})();
