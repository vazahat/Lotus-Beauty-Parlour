/* LOTUS — interactions */
(function(){
  "use strict";
  // Force same-tab navigation for all internal links (no new tabs)
  document.querySelectorAll('a[target="_blank"]').forEach(function(a){
    var href = a.getAttribute('href') || '';
    var isInternal = href && !/^https?:\/\//i.test(href) && !href.startsWith('mailto:') && !href.startsWith('tel:');
    if (isInternal || href.endsWith('.html') || href.startsWith('#')) a.removeAttribute('target');
  });
  var header = document.getElementById('siteHeader');
  var burger = document.getElementById('burger');
  var mobileMenu = document.getElementById('mobileMenu');

  // Sticky compact nav
  function onScroll(){ if(header) header.classList.toggle('scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Mobile menu
  if(burger && mobileMenu){
    burger.addEventListener('click', function(){
      var open = mobileMenu.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileMenu.classList.remove('open'); burger.classList.remove('open');
        document.body.style.overflow='';
      });
    });
    document.addEventListener('keydown', function(e){
      if(e.key==='Escape'){ mobileMenu.classList.remove('open'); burger.classList.remove('open'); document.body.style.overflow=''; closeLightbox(); }
    });
  }

  // Reveal on scroll
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('visible'); io.unobserve(en.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  // Active nav
  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(function(a){
    var href = (a.getAttribute('href')||'').toLowerCase();
    if(href === path || (path==='' && href==='index.html')) a.classList.add('active');
  });

  /* ---------- Services tabs (homepage) ---------- */
  var svcTabs = document.querySelectorAll('.svc-tab');
  var svcCards = document.querySelectorAll('[data-svc-cat]');
  if(svcTabs.length){
    svcTabs.forEach(function(btn){
      btn.addEventListener('click', function(){
        svcTabs.forEach(function(b){ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
        btn.classList.add('active'); btn.setAttribute('aria-selected','true');
        var cat = btn.getAttribute('data-filter');
        svcCards.forEach(function(card){
          var show = cat==='all' || card.getAttribute('data-svc-cat')===cat;
          card.style.display = show ? '' : 'none';
          if(show){ card.classList.remove('visible'); requestAnimationFrame(function(){ requestAnimationFrame(function(){ card.classList.add('visible'); }); }); }
        });
      });
    });
  }

  /* ---------- Before / After slider ---------- */
  var baFrames = document.querySelectorAll('.ba-frame');
  baFrames.forEach(function(frame){
    var after = frame.querySelector('.ba-after');
    var handle = frame.querySelector('.ba-handle');
    var dragging = false;
    function setPos(clientX){
      var r = frame.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(4, Math.min(96, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      handle.style.left = pct + '%';
    }
    frame.addEventListener('pointerdown', function(e){ dragging=true; frame.setPointerCapture(e.pointerId); setPos(e.clientX); });
    frame.addEventListener('pointermove', function(e){ if(dragging) setPos(e.clientX); });
    ['pointerup','pointercancel','pointerleave'].forEach(function(ev){ frame.addEventListener(ev, function(){ dragging=false; }); });
    frame.addEventListener('keydown', function(e){
      var cur = parseFloat((handle.style.left||'50%').replace('%','')) || 50;
      if(e.key==='ArrowLeft'){ cur=Math.max(4,cur-4); after.style.clipPath='inset(0 0 0 '+cur+'%)'; handle.style.left=cur+'%'; e.preventDefault(); }
      if(e.key==='ArrowRight'){ cur=Math.min(96,cur+4); after.style.clipPath='inset(0 0 0 '+cur+'%)'; handle.style.left=cur+'%'; e.preventDefault(); }
    });
  });
  // BA category tabs swap images
  var baData = {
    makeup: {before:'assets/images/makeup-editorial.jpg', after:'assets/images/makeup-palette.jpg', label:'Makeup Transformation'},
    hair: {before:'assets/images/beauty-detail.jpg', after:'assets/images/hair-styling.jpg', label:'Hair Transformation'},
    skin: {before:'assets/images/skin-facial.jpg', after:'assets/images/skincare.jpg', label:'Skin Transformation'},
    nails: {before:'assets/images/nails-atelier.jpg', after:'assets/images/manicure.jpg', label:'Nail Transformation'}
  };
  var baTabs = document.querySelectorAll('.ba-tab');
  var baBefore = document.getElementById('baBefore');
  var baAfterImg = document.getElementById('baAfterImg');
  if(baTabs.length && baBefore){
    baTabs.forEach(function(t){
      t.addEventListener('click', function(){
        baTabs.forEach(function(x){x.classList.remove('active');});
        t.classList.add('active');
        var d = baData[t.getAttribute('data-ba')];
        if(d){
          baBefore.style.opacity='0'; baAfterImg.style.opacity='0';
          setTimeout(function(){
            baBefore.src=d.before; baAfterImg.src=d.after;
            baBefore.alt=d.label+' — before'; baAfterImg.alt=d.label+' — after';
            baBefore.onload = function(){ baBefore.style.opacity='1'; };
            baAfterImg.onload = function(){ baAfterImg.style.opacity='1'; };
            setTimeout(function(){ baBefore.style.opacity='1'; baAfterImg.style.opacity='1'; }, 600);
          }, 250);
        }
      });
    });
  }

  /* ---------- Gallery filter + lightbox ---------- */
  var gBtns = document.querySelectorAll('.gal-filters button');
  var gItems = document.querySelectorAll('.g-item');
  if(gBtns.length){
    gBtns.forEach(function(b){
      b.addEventListener('click', function(){
        gBtns.forEach(function(x){x.classList.remove('active');});
        b.classList.add('active');
        var f = b.getAttribute('data-filter');
        gItems.forEach(function(it){
          var show = f==='all' || it.getAttribute('data-cat')===f;
          it.style.display = show ? '' : 'none';
        });
      });
    });
  }
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var currentList = [], currentIdx = 0;
  function visibleItems(){ return Array.prototype.filter.call(gItems, function(i){ return i.style.display!=='none'; }); }
  function openLightbox(item){
    if(!lb) return;
    currentList = visibleItems(); currentIdx = currentList.indexOf(item);
    var img = item.querySelector('img');
    lbImg.src = img.src; lbImg.alt = img.alt;
    lb.classList.add('open'); document.body.style.overflow='hidden';
  }
  function closeLightbox(){ if(!lb) return; lb.classList.remove('open'); document.body.style.overflow=''; }
  function stepLightbox(dir){
    if(!currentList.length) return;
    currentIdx = (currentIdx + dir + currentList.length) % currentList.length;
    var img = currentList[currentIdx].querySelector('img');
    lbImg.src = img.src; lbImg.alt = img.alt;
  }
  window.closeLightbox = closeLightbox;
  gItems.forEach(function(it){
    it.addEventListener('click', function(){ openLightbox(it); });
    it.setAttribute('tabindex','0');
    it.addEventListener('keydown', function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); openLightbox(it); } });
  });
  if(lb){
    lb.addEventListener('click', function(e){ if(e.target===lb) closeLightbox(); });
    var c = lb.querySelector('.lb-close'); if(c) c.addEventListener('click', closeLightbox);
    var p = lb.querySelector('.lb-prev'); if(p) p.addEventListener('click', function(e){ e.stopPropagation(); stepLightbox(-1); });
    var n = lb.querySelector('.lb-next'); if(n) n.addEventListener('click', function(e){ e.stopPropagation(); stepLightbox(1); });
    document.addEventListener('keydown', function(e){
      if(!lb.classList.contains('open')) return;
      if(e.key==='ArrowLeft') stepLightbox(-1);
      if(e.key==='ArrowRight') stepLightbox(1);
    });
  }

  /* ---------- Testimonials ---------- */
  var quotes = document.querySelectorAll('.testi-slide');
  var dotsWrap = document.getElementById('testiDots');
  var tIndex = 0, tTimer = null;
  function showTesti(i){
    tIndex = (i + quotes.length) % quotes.length;
    quotes.forEach(function(q, idx){ q.style.display = idx===tIndex ? '' : 'none'; if(idx===tIndex){ q.style.animation='none'; void q.offsetWidth; q.style.animation='fadeUp .7s cubic-bezier(.22,.61,.21,1)'; } });
    if(dotsWrap){ Array.prototype.forEach.call(dotsWrap.children, function(d, idx){ d.classList.toggle('active', idx===tIndex); }); }
  }
  if(quotes.length){
    quotes.forEach(function(_, idx){
      if(!dotsWrap) return;
      var d = document.createElement('button');
      d.setAttribute('aria-label','Show testimonial '+(idx+1));
      if(idx===0) d.classList.add('active');
      d.addEventListener('click', function(){ showTesti(idx); restartAuto(); });
      dotsWrap.appendChild(d);
    });
    showTesti(0);
    function restartAuto(){ if(tTimer) clearInterval(tTimer); tTimer = setInterval(function(){ showTesti(tIndex+1); }, 6000); }
    restartAuto();
    var prev = document.getElementById('testiPrev'), next = document.getElementById('testiNext');
    if(prev) prev.addEventListener('click', function(){ showTesti(tIndex-1); restartAuto(); });
    if(next) next.addEventListener('click', function(){ showTesti(tIndex+1); restartAuto(); });
  }

  /* ---------- Booking + newsletter ---------- */
  var bookForm = document.getElementById('bookForm');
  if(bookForm){
    // min date = today
    var dateInput = bookForm.querySelector('input[type="date"]');
    if(dateInput){ dateInput.min = new Date().toISOString().split('T')[0]; }
    bookForm.addEventListener('submit', function(e){
      e.preventDefault();
      if(!bookForm.checkValidity()){ bookForm.reportValidity(); return; }
      var name = (bookForm.querySelector('#bkName')||{}).value || 'Guest';
      var service = (bookForm.querySelector('#bkService')||{}).value || 'Signature Service';
      var date = (bookForm.querySelector('#bkDate')||{}).value || '';
      var time = (bookForm.querySelector('#bkTime')||{}).value || '';
      var conf = document.getElementById('bookConfirm');
      var summary = document.getElementById('bookSummary');
      if(summary) summary.textContent = 'Thank you, ' + name + ' — your request for ' + service + (date ? ' on ' + date : '') + (time ? ' at ' + time : '') + ' has been received. Our concierge will confirm shortly on call / WhatsApp.';
      bookForm.style.display='none';
      if(conf) conf.classList.add('show');
      conf && conf.scrollIntoView({behavior:'smooth', block:'center'});
    });
  }
  document.querySelectorAll('.news-form').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var inp = f.querySelector('input[type="email"]');
      if(inp && inp.checkValidity()){
        f.innerHTML = '<p style="padding:14px 16px;font-size:13px;letter-spacing:.08em">Welcome to the Lotus List — please check your inbox.</p>';
      } else if(inp){ inp.reportValidity(); }
    });
  });

  // Smooth anchor offset for sticky header
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var id = a.getAttribute('href');
      if(id.length > 1){
        var t = document.querySelector(id);
        if(t){ e.preventDefault(); var y = t.getBoundingClientRect().top + window.scrollY - 80; window.scrollTo({top:y, behavior:'smooth'}); }
      }
    });
  });
})();
