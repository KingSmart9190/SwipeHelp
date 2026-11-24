/* =====================================================
   SwipeHelp – Page Controllers
   Each section manages its own page render/logic
   ===================================================== */

/* ============================================================
   MODALS & LANDING PAGE HELPERS
   ============================================================ */
function openModal(modalId) {
  closeModals();
  const m = document.getElementById(modalId);
  if (m) {
    m.classList.add('open');
    const firstInput = m.querySelector('input:not([type="radio"])');
    if (firstInput) setTimeout(() => firstInput.focus(), 150);
  }
}

function closeModals() {
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

function selectRole(role) {
  document.querySelectorAll('.role-card').forEach(c => {
    const radio = c.querySelector('input[type="radio"]');
    if (radio && radio.value === role) {
      c.classList.add('selected');
      radio.checked = true;
    } else {
      c.classList.remove('selected');
      if (radio) radio.checked = false;
    }
  });
}

function initModals() {
  // Header buttons
  document.getElementById('open-login')?.addEventListener('click', () => openModal('modal-login'));
  document.getElementById('open-register')?.addEventListener('click', () => openModal('modal-register'));
  document.getElementById('switch-to-login')?.addEventListener('click', () => openModal('modal-login'));
  document.getElementById('switch-to-register')?.addEventListener('click', () => openModal('modal-register'));

  // Close buttons
  document.getElementById('close-login')?.addEventListener('click', closeModals);
  document.getElementById('close-register')?.addEventListener('click', closeModals);

  // Overlay backdrop click to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModals();
    });
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModals();
  });

  // Hero CTAs
  document.getElementById('hero-donate')?.addEventListener('click', () => {
    selectRole('donor');
    openModal('modal-register');
  });
  document.getElementById('hero-post')?.addEventListener('click', () => {
    selectRole('seeker');
    openModal('modal-register');
  });

  // Section CTAs
  document.getElementById('fw-donate')?.addEventListener('click', () => {
    selectRole('donor');
    openModal('modal-register');
  });
  document.getElementById('fw-post')?.addEventListener('click', () => {
    selectRole('seeker');
    openModal('modal-register');
  });

  // Bottom CTA banner
  document.getElementById('cta-donate')?.addEventListener('click', () => {
    selectRole('donor');
    openModal('modal-register');
  });
  document.getElementById('cta-post')?.addEventListener('click', () => {
    selectRole('seeker');
    openModal('modal-register');
  });

  // Footer links
  document.getElementById('fl-discover')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('modal-login');
  });
  document.getElementById('fl-post')?.addEventListener('click', (e) => {
    e.preventDefault();
    selectRole('seeker');
    openModal('modal-register');
  });

  // Mobile hamburger
  document.getElementById('lh-hamburger')?.addEventListener('click', () => {
    openModal('modal-login');
  });

  // App Logo returns to Discover or Landing
  document.querySelector('.desktop-nav .nav-logo')?.addEventListener('click', () => {
    navigate('page-discover', { onEnter: renderDiscover });
  });

  // Avatar click allows logging out
  document.querySelectorAll('.avatar, .nav-avatar').forEach(av => {
    av.setAttribute('title', 'Click to log out');
    av.addEventListener('click', () => {
      if (confirm('Do you want to log out of SwipeHelp?')) {
        AppState.user = null;
        showToast('Logged out');
        navigate('page-landing');
      }
    });
  });
}

/* ============================================================
   AUTH – Login
   ============================================================ */
function initLogin() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email    = form.email.value.trim();
    const password = form.password.value;
    if (!email || !password) { showToast('Please fill in all fields.', 'error'); return; }

    closeModals();
    /* Simulate login */
    AppState.user = { name: 'Kofi A.', email, role: 'donor', initials: 'KA' };
    showToast('Welcome back! 👋', 'success');
    setTimeout(() => {
      navigate('page-discover', { onEnter: renderDiscover });
    }, 400);
  });

  /* Password toggle */
  document.getElementById('toggle-login-pw')?.addEventListener('click', () => {
    const inp = document.getElementById('login-password');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}

/* ============================================================
   AUTH – Register
   ============================================================ */
function initRegister() {
  const form = document.getElementById('register-form');
  if (!form) return;

  /* Role cards */
  document.querySelectorAll('.role-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.role-card').forEach(c => {
        c.classList.remove('selected');
        c.querySelector('input')?.removeAttribute('checked');
      });
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name  = form.fullname.value.trim();
    const email = form.email.value.trim();
    const pw    = form.password.value;
    if (!name || !email || !pw) { showToast('Please fill in all fields.', 'error'); return; }
    if (pw.length < 8) { showToast('Password must be at least 8 characters.', 'error'); return; }

    closeModals();
    const role = form.role.value;
    const ini  = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    AppState.user = { name, email, role, initials: ini };
    showToast('Account created! Welcome to SwipeHelp ✉️', 'success');
    setTimeout(() => {
      if (role === 'seeker') {
        navigate('page-post', { onEnter: initPostNeed });
      } else {
        navigate('page-discover', { onEnter: renderDiscover });
      }
    }, 500);
  });
}

/* ============================================================
   DISCOVER – Swipe Feed
   ============================================================ */
let swipeEngine = null;

function renderDiscover() {
  updateAvatar();
  const container = document.getElementById('swipe-container');
  const noCards   = document.getElementById('no-cards-state');
  if (!container) return;

  /* Clear previous */
  container.innerHTML = '';
  noCards.classList.remove('show');

  const remaining = AppState.needsQueue.slice(AppState.currentNeedIdx);
  if (remaining.length === 0) {
    showNoCrards();
    return;
  }

  /* Update aside panel with top card */
  if (window._updateAsidePanel) window._updateAsidePanel(remaining[0]);

  /* Render top 3 cards (stack illusion) */
  const toRender = remaining.slice(0, 3);
  toRender.reverse().forEach((need, i) => {
    const isTop = i === toRender.length - 1;
    container.appendChild(buildNeedCard(need, isTop));
  });

  /* Init swipe engine once */
  if (!swipeEngine) {
    swipeEngine = new SwipeEngine({
      cardSelector: '.need-card',
      threshold: 70,
      onSwipeRight: (card) => handleSwipeRight(card),
      onSwipeLeft:  (card) => handleSwipeLeft(card),
    });
  }

  /* Button actions */
  document.getElementById('btn-pass')?.addEventListener('click', () => {
    swipeEngine.triggerSwipe('left');
  });
  document.getElementById('btn-contribute')?.addEventListener('click', () => {
    openPayPage();
  });
}

function buildNeedCard(need, isTop) {
  const pctVal = pct(need.amount, need.goal);
  const rem    = need.goal - need.amount;
  const bc     = categoryBadgeClass(need.category);

  const div = document.createElement('div');
  div.className = 'need-card';
  div.dataset.id = need.id;
  if (!isTop) {
    div.style.position  = 'absolute';
    div.style.top       = '0';
    div.style.left      = '0';
    div.style.right     = '0';
    div.style.transform = 'scale(0.97) translateY(8px)';
    div.style.zIndex    = '0';
    div.style.pointerEvents = 'none';
  }

  div.innerHTML = `
    <div class="stamp stamp-yes">HELP ♥</div>
    <div class="stamp stamp-no">SKIP</div>
    <div class="card-header">
      <div class="tag-row">
        <span class="badge ${bc}">${need.category}</span>
        ${need.verified ? '<span class="verif-pill">✔ Verified</span>' : ''}
      </div>
      <h3>${need.title}</h3>
      <p class="meta">${need.name} · ${need.location}</p>
      <p class="story">${need.story}</p>
    </div>
    <div class="proof-row">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
      ${need.proof}
    </div>
    <div class="amount-row">
      <span class="amount-big">${formatGHS(need.amount)}</span>
      <span class="amount-goal">of ${formatGHS(need.goal)} goal</span>
    </div>
    ${buildProgressBar(need.amount, need.goal)}
    ${buildStatsRow(need.amount, need.goal, need.donors)}
  `;
  return div;
}

function handleSwipeRight(card) {
  const id   = parseInt(card.dataset.id);
  const need = AppState.needsQueue.find(n => n.id === id);
  AppState.nextNeed();
  showToast(`💚 Saved: ${need?.title}`, 'success');
  if (need) AppState.savedNeeds.push(need);
  refreshDiscoverAfterSwipe();
  if (window._updateSidebarImpact) window._updateSidebarImpact();
  openPayPage(need);
}

function handleSwipeLeft(card) {
  const id   = parseInt(card.dataset.id);
  const need = AppState.needsQueue.find(n => n.id === id);
  AppState.nextNeed();
  showToast(`Skipped – ${need?.title}`);
  refreshDiscoverAfterSwipe();
  /* Update aside with the new top card */
  const nextNeed = AppState.currentNeed;
  if (nextNeed && window._updateAsidePanel) window._updateAsidePanel(nextNeed);
}

function refreshDiscoverAfterSwipe() {
  /* Promote next card */
  const remaining = document.querySelectorAll('.swipe-wrapper .need-card:not([style*="display: none"])');
  if (remaining.length > 0) {
    const next = remaining[remaining.length - 1];
    next.style.position     = '';
    next.style.transform    = '';
    next.style.zIndex       = '';
    next.style.pointerEvents = '';
  } else if (AppState.currentNeedIdx >= AppState.needsQueue.length) {
    showNoCrards();
  }
}

function showNoCrards() {
  const noCards   = document.getElementById('no-cards-state');
  const container = document.getElementById('swipe-container');
  if (container) container.innerHTML = '';
  if (noCards)   noCards.classList.add('show');
}

/* ============================================================
   PAY – Chip In
   ============================================================ */
let selectedAmount  = 50;
let selectedMethod  = 'momo';
let currentPayNeed  = null;

function openPayPage(need) {
  if (!need) {
    need = AppState.needsQueue[AppState.currentNeedIdx - 1]
        || AppState.needsQueue[AppState.currentNeedIdx]
        || AppState.needsQueue[0];
  }
  currentPayNeed = need;
  navigate('page-pay', { onEnter: () => renderPayPage(need) });
}

function renderPayPage(need) {
  if (!need) return;
  const pctVal = pct(need.amount, need.goal);
  const rem    = need.goal - need.amount;

  /* Mini card */
  document.getElementById('pay-mini-title').textContent  = need.title;
  document.getElementById('pay-mini-meta').textContent   = `${need.name} · ${need.location}`;
  document.getElementById('pay-mini-pct').textContent    = `${pctVal}% complete`;
  document.getElementById('pay-mini-donors').textContent = `${need.donors} donors`;
  document.getElementById('pay-mini-rem').textContent    = `${formatGHS(rem)} to go`;
  const bar = document.getElementById('pay-progress-bar');
  if (bar) bar.style.width = pctVal + '%';

  /* Reset to default selection */
  selectedAmount = 50;
  updateAmountSelection();
  updateImpactBanner();

  /* Submit */
  document.getElementById('pay-submit-btn').onclick = submitContribution;
}

function updateAmountSelection() {
  document.querySelectorAll('.amount-chip').forEach(chip => {
    const val = parseInt(chip.dataset.amount);
    chip.classList.toggle('selected', val === selectedAmount);
  });
  const btn = document.getElementById('pay-submit-btn');
  if (btn) btn.textContent = `Contribute ${formatGHS(selectedAmount)}`;
}

function updateImpactBanner() {
  if (!currentPayNeed) return;
  const newPct = Math.min(Math.round(((currentPayNeed.amount + selectedAmount) / currentPayNeed.goal) * 100), 100);
  const banner = document.getElementById('impact-banner');
  if (banner) banner.textContent = `With your ${formatGHS(selectedAmount)}, this need reaches ${newPct}%.`;
}

function initPayPage() {
  /* Amount chips */
  document.querySelectorAll('.amount-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      selectedAmount = parseInt(chip.dataset.amount);
      document.getElementById('custom-amount').value = '';
      updateAmountSelection();
      updateImpactBanner();
    });
  });

  /* Custom amount */
  document.getElementById('custom-amount')?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val > 0) {
      selectedAmount = val;
      document.querySelectorAll('.amount-chip').forEach(c => c.classList.remove('selected'));
      updateImpactBanner();
      const btn = document.getElementById('pay-submit-btn');
      if (btn) btn.textContent = `Contribute ${formatGHS(selectedAmount)}`;
    }
  });

  /* Payment method */
  document.querySelectorAll('.pay-method').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.pay-method').forEach(m => {
        m.classList.remove('selected');
        m.querySelector('input').checked = false;
      });
      el.classList.add('selected');
      el.querySelector('input').checked = true;
      selectedMethod = el.dataset.method;
      const momoField = document.getElementById('momo-field');
      if (momoField) momoField.style.display = selectedMethod === 'momo' ? 'block' : 'none';
    });
  });
}

function submitContribution() {
  const need = currentPayNeed;
  if (!need) return;

  if (selectedMethod === 'momo') {
    const momoNum = document.getElementById('momo-number')?.value.trim();
    if (!momoNum) { showToast('Please enter your mobile money number.', 'error'); return; }
  }

  /* Simulate success */
  AppState.addToActivity({
    type: 'donation',
    title: need.title,
    name:  need.name,
    amount: selectedAmount,
  });

  /* Update mock state */
  need.amount  = Math.min(need.amount + selectedAmount, need.goal);
  need.donors += 1;

  if (window._updateSidebarImpact) window._updateSidebarImpact();

  showToast(`💚 GH₵ ${selectedAmount} contributed! Thank you.`, 'success');
  setTimeout(() => {
    navigate('page-activity', { onEnter: renderActivity });
  }, 500);
}

/* ============================================================
   POST A NEED
   ============================================================ */
function initPostNeed() {
  const form = document.getElementById('post-form');
  if (!form) return;

  /* File upload */
  const uploadZone  = document.getElementById('upload-zone');
  const fileInput   = document.getElementById('proof-file');
  const filePreview = document.getElementById('file-preview');
  const fileName    = document.getElementById('file-name');

  uploadZone?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', () => {
    const f = fileInput.files[0];
    if (f) {
      fileName.textContent = f.name;
      filePreview.classList.add('show');
    }
  });
  document.getElementById('remove-file')?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.value = '';
    filePreview.classList.remove('show');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const title    = form.need_title.value.trim();
    const category = form.category.value;
    const amount   = parseInt(form.amount.value);
    const story    = form.story.value.trim();

    if (!title || !amount || !story) { showToast('Please fill in all required fields.', 'error'); return; }
    if (amount < 1) { showToast('Amount must be at least GH₵ 1.', 'error'); return; }

    const newNeed = {
      id:       Date.now(),
      title,
      name:     AppState.user?.name?.split(' ')[0] + ' ' + (AppState.user?.name?.split(' ')[1]?.[0] || '') + '.',
      location: 'Ghana',
      category,
      story,
      amount:   0,
      goal:     amount,
      donors:   0,
      proof:    fileInput?.files[0]?.name ? fileInput.files[0].name + ' attached' : 'No document attached',
      verified: false,
    };

    AppState.needsQueue.unshift(newNeed);
    form.reset();
    filePreview.classList.remove('show');

    showToast('✅ Your need has been posted!', 'success');
    setTimeout(() => navigate('page-discover', { onEnter: renderDiscover }), 600);
  });
}

/* ============================================================
   ACTIVITY
   ============================================================ */
function renderActivity() {
  updateAvatar();
  const list = document.getElementById('activity-list');
  const stats = document.getElementById('activity-stats');
  if (!list) return;

  const totalDonated = AppState.activityLog
    .filter(e => e.type === 'donation')
    .reduce((s, e) => s + e.amount, 0);
  const totalCount = AppState.activityLog.filter(e => e.type === 'donation').length;

  /* Stats */
  if (stats) {
    stats.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total given</div>
        <div class="stat-value">${formatGHS(totalDonated)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Lives helped</div>
        <div class="stat-value">${totalCount}</div>
      </div>
    `;
  }

  if (AppState.activityLog.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤲</div>
        <h3>No activity yet</h3>
        <p>Start swiping to discover real needs and make a difference.</p>
      </div>`;
    return;
  }

  list.innerHTML = AppState.activityLog.map(entry => `
    <div class="activity-item">
      <div class="activity-icon">💚</div>
      <div class="activity-info">
        <div class="act-title">${entry.title}</div>
        <div class="act-sub">${entry.name} · ${entry.ts ? entry.ts.toLocaleDateString() : 'Today'}</div>
      </div>
      <span class="activity-amt">${formatGHS(entry.amount)}</span>
    </div>
  `).join('');
}

/* ============================================================
   AVATAR
   ============================================================ */
function updateAvatar() {
  document.querySelectorAll('.avatar').forEach(el => {
    el.textContent = AppState.user?.initials || 'U';
  });
}

/* ============================================================
   CATEGORY FILTER CHIPS
   ============================================================ */
function initChipFilters() {
  document.querySelectorAll('[data-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const filter = chip.dataset.filter;

      if (filter === 'all') {
        AppState.currentNeedIdx = 0;
      } else {
        /* Reorder: matching category first */
        const matching    = AppState.needsQueue.filter(n => n.category === filter);
        const nonMatching = AppState.needsQueue.filter(n => n.category !== filter);
        AppState.needsQueue    = [...matching, ...nonMatching];
        AppState.currentNeedIdx = 0;
      }
      renderDiscover();
    });
  });
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  /* Start on Landing Page */
  navigate('page-landing');

  /* Init auth forms and modal dialog triggers */
  initLogin();
  initRegister();
  initModals();

  /* Category chip filters (mobile chips + desktop sidebar filters) */
  initChipFilters();

  /* Card vs MoMo payment toggle */
  document.querySelectorAll('.pay-method').forEach(el => {
    el.addEventListener('click', () => {
      const method = el.dataset.method;
      const momoF = document.getElementById('momo-field');
      const cardF = document.getElementById('card-field');
      if (momoF) momoF.style.display = method === 'momo' ? 'block' : 'none';
      if (cardF) cardF.style.display = method === 'card' ? 'block' : 'none';
    });
  });

  /* Back buttons */
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.back;
      navigate(target, { onEnter: target === 'page-discover' ? renderDiscover : undefined });
    });
  });

  /* All nav links — mobile bottom nav + desktop top nav + sidebar buttons */
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      const target = link.dataset.nav;
      if (target === 'page-discover') navigate(target, { onEnter: renderDiscover });
      else if (target === 'page-post')     navigate(target, { onEnter: initPostNeed });
      else if (target === 'page-activity') navigate(target, { onEnter: renderActivity });
    });
  });

  /* Pay page static init */
  initPayPage();

  /* ---- Desktop nav active state ---- */
  const originalNavigate = window._navigateOrig || navigate;
  function updateDesktopNav(pageId) {
    document.querySelectorAll('.desktop-nav .nav-links a').forEach(a => {
      a.classList.remove('active');
      if (a.dataset.nav === pageId) a.classList.add('active');
    });
  }
  /* Patch navigate to also update desktop nav */
  const _origNav = navigate;
  window.navigate = function(pageId, opts) {
    _origNav(pageId, opts);
    updateDesktopNav(pageId);
  };

  /* ---- Keyboard shortcuts (desktop) ---- */
  document.addEventListener('keydown', (e) => {
    if (AppState.currentPage !== 'page-discover') return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft')  swipeEngine?.triggerSwipe('left');
    if (e.key === 'ArrowRight') swipeEngine?.triggerSwipe('right');
    if (e.key === ' ') { e.preventDefault(); swipeEngine?.triggerSwipe('right'); }
  });

  /* ---- Aside panel: live preview update ---- */
  window._updateAsidePanel = function(need) {
    if (!need) return;
    const bc = categoryBadgeClass(need.category);
    const badgeRow = document.getElementById('aside-badge-row');
    if (badgeRow) badgeRow.innerHTML = `<span class="badge ${bc}">${need.category}</span>${need.verified ? '<span class="verif-pill">✔ Verified</span>' : ''}`;
    const setT = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setT('aside-title', need.title);
    setT('aside-meta', `${need.name} · ${need.location}`);
    setT('aside-story', need.story);
    setT('aside-amount', formatGHS(need.amount));
    setT('aside-goal', ` of ${formatGHS(need.goal)} goal`);
    const bar = document.getElementById('aside-progress');
    if (bar) bar.style.width = pct(need.amount, need.goal) + '%';
  };

  /* ---- Sidebar impact counter update ---- */
  window._updateSidebarImpact = function() {
    const total = AppState.activityLog.filter(e => e.type === 'donation').reduce((s, e) => s + e.amount, 0);
    const count = AppState.activityLog.filter(e => e.type === 'donation').length;
    const sv = document.getElementById('sidebar-total');
    const sc = document.getElementById('sidebar-count');
    if (sv) sv.textContent = formatGHS(total);
    if (sc) sc.textContent = `${count} ${count === 1 ? 'life' : 'lives'} helped`;
  };
});
