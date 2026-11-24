/* =====================================================
   SwipeHelp – App State & Navigation
   ===================================================== */

/* ---- Mock Data ---- */
const MOCK_NEEDS = [
  {
    id: 1,
    title: 'School fees for Term 2',
    name: 'Ama M.',
    location: 'Kumasi',
    category: 'Education',
    story: 'I am a nursing student. I need help covering this term\'s fees so I can sit my exams in December.',
    amount: 1450,
    goal: 2000,
    donors: 23,
    proof: 'Fee invoice attached',
    verified: true,
    deadline: 'Dec 15, 2026',
  },
  {
    id: 2,
    title: 'Electricity bill – 3 months overdue',
    name: 'Kwame A.',
    location: 'Accra',
    category: 'Utilities',
    story: 'Lost my job three months ago. My electricity has been disconnected and I have two children at home. Any help is deeply appreciated.',
    amount: 320,
    goal: 480,
    donors: 7,
    proof: 'ECG bill attached',
    verified: true,
    deadline: 'Nov 20, 2026',
  },
  {
    id: 3,
    title: 'Emergency medical treatment',
    name: 'Efua D.',
    location: 'Tamale',
    category: 'Health',
    story: 'My mother needs surgery for a hernia. The hospital requires a deposit before the procedure can begin. We cannot afford it.',
    amount: 1200,
    goal: 3500,
    donors: 41,
    proof: 'Hospital invoice attached',
    verified: true,
    deadline: 'Nov 30, 2026',
  },
  {
    id: 4,
    title: 'Rent for December',
    name: 'Yaw K.',
    location: 'Tema',
    category: 'Rent',
    story: 'My landlord has given me notice. I am a single father and need GH₵ 900 to avoid eviction before the end of November.',
    amount: 450,
    goal: 900,
    donors: 15,
    proof: 'Tenancy agreement attached',
    verified: false,
    deadline: 'Nov 25, 2026',
  },
  {
    id: 5,
    title: 'Laptop for final year project',
    name: 'Abena S.',
    location: 'Cape Coast',
    category: 'Education',
    story: 'My laptop broke down two months before my final year thesis submission. I am a computer science student and cannot work at all without one.',
    amount: 800,
    goal: 1800,
    donors: 29,
    proof: 'Quote from shop attached',
    verified: true,
    deadline: 'Dec 10, 2026',
  },
];

/* ---- App State ---- */
const AppState = {
  currentPage:   'page-login',
  user:          null,          // { name, email, role }
  needsQueue:    [...MOCK_NEEDS],
  currentNeedIdx: 0,
  savedNeeds:    [],
  activityLog:   [],
  contributionAmounts: [20, 50, 100, 200],

  get currentNeed() {
    return this.needsQueue[this.currentNeedIdx] || null;
  },

  nextNeed() {
    this.currentNeedIdx++;
  },

  addToActivity(entry) {
    this.activityLog.unshift({ ...entry, ts: new Date() });
  },
};

/* ---- Navigation ---- */
function navigate(pageId, options = {}) {
  if (pageId === 'page-landing') {
    document.body.classList.remove('state-app');
    document.body.classList.add('state-landing');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    AppState.currentPage = 'page-landing';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (options.onEnter) options.onEnter();
    return;
  }

  // Entering an application page
  document.body.classList.remove('state-landing');
  document.body.classList.add('state-app');
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.add('active');
    AppState.currentPage = pageId;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    page.scrollTop = 0;
    if (options.onEnter) options.onEnter();
  }
}

/* ---- Toast ---- */
function showToast(msg, type = 'default') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.textContent = `${icon}  ${msg}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ---- Helpers ---- */
function formatGHS(n) {
  return 'GH₵ ' + n.toLocaleString('en-GH');
}

function pct(raised, goal) {
  return Math.min(Math.round((raised / goal) * 100), 100);
}

function categoryBadgeClass(cat) {
  const map = { Education: 'edu', Health: 'health', Rent: 'rent', Food: 'food' };
  return 'badge-' + (map[cat] || 'other');
}

function buildProgressBar(raised, goal) {
  const p = pct(raised, goal);
  return `<div class="progress-wrap"><div class="progress-bar" style="width:${p}%"></div></div>`;
}

function buildStatsRow(raised, goal, donors) {
  const p   = pct(raised, goal);
  const rem = goal - raised;
  return `
    <div class="stats-row">
      <span><strong>${p}% complete</strong></span>
      <span>${donors} donors</span>
      <span>${formatGHS(Math.max(rem, 0))} to go</span>
    </div>`;
}

