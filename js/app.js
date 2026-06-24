// ============================================================
//  APP — main controller
// ============================================================

const App = (() => {

  // ---- Utility ----
  function qs(sel, parent = document) { return parent.querySelector(sel); }
  function qsa(sel, parent = document) { return [...parent.querySelectorAll(sel)]; }
  function el(id) { return document.getElementById(id); }

  function fmt(n) { return Math.round(n); }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---- Navigation ----
  let currentPage = 'dashboard';

  function showPage(name) {
    currentPage = name;
    qsa('.page').forEach(p => p.classList.remove('active'));
    qsa('.nav-btn').forEach(b => b.classList.remove('active'));
    const page = el('page-' + name);
    if (page) page.classList.add('active');
    const btn = qs(`.nav-btn[data-page="${name}"]`);
    if (btn) btn.classList.add('active');
    closeSidebar();
    refreshPage(name);
  }

  function refreshPage(name) {
    switch (name) {
      case 'dashboard':    renderDashboard();    break;
      case 'phase1':       renderPhase1();       break;
      case 'phase2':       renderPhase2();       break;
      case 'applications': renderApplications(); break;
      case 'project':      renderProject();      break;
    }
    updateHUD();
  }

  // ---- Sidebar mobile ----
  function openSidebar() {
    el('sidebar').classList.add('open');
    el('sidebar-overlay').classList.add('open');
  }
  function closeSidebar() {
    el('sidebar').classList.remove('open');
    el('sidebar-overlay').classList.remove('open');
  }

  // ---- HUD ----
  function updateHUD() {
    const day = Store.daysSinceStart() + 1;
    el('hud-day').textContent = 'Day ' + day;
    el('hud-streak').textContent = '🔥 ' + Store.calcStreak() + ' streak';
    el('hud-dsa').textContent = '⚡ ' + Store.dsaTotal() + ' DSA';
    el('hud-apps').textContent = '📬 ' + Store.state.apps.length + ' apps';
    const sc = Object.values(Store.getTodayScores()).filter(Boolean).length;
    el('hud-score').textContent = '✅ ' + sc + '/6 today';

    // Phase detection
    const now = new Date();
    const phase2Start = new Date('2026-07-05');
    el('sidebar-phase').textContent = now < phase2Start ? '📅 Phase 1 Active' : '🚀 Phase 2 Active';

    // Update nav badges
    const p1pct = calcPhase1Pct();
    el('nav-p1-badge').textContent = fmt(p1pct) + '%';
    el('nav-apps-badge').textContent = Store.state.apps.length;
  }

  function calcPhase1Pct() {
    const all = [...DATA.aiml, ...DATA.cs];
    const done = all.filter(i => Store.state.checks['aiml_' + key(i)] || Store.state.checks['cs_' + key(i)]).length;
    return all.length ? (done / all.length) * 100 : 0;
  }

  function key(label) { return label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, ''); }

  // ---- Task Lists ----
  function renderTaskList(containerId, items, prefix) {
    const container = el(containerId);
    if (!container) return;
    container.innerHTML = items.map(item => {
      const id = prefix + '_' + key(item);
      const checked = Store.state.checks[id] || false;
      return `<div class="task-row">
        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} onchange="App.toggleCheck('${id}', this.checked)">
        <label for="${id}" class="${checked ? 'done' : ''}">${item}</label>
      </div>`;
    }).join('');
  }

  function toggleCheck(id, val) {
    Store.state.checks[id] = val;
    Store.save('checks');
    const lbl = qs(`label[for="${id}"]`);
    if (lbl) lbl.className = val ? 'done' : '';
    updateHUD();
    if (currentPage === 'phase1') renderPhase1Bars();
    if (currentPage === 'dashboard') renderProgressOverview();
  }

  function countChecked(prefix, items) {
    return items.filter(i => Store.state.checks[prefix + '_' + key(i)]).length;
  }

  // ---- DASHBOARD ----
  function renderDashboard() {
    // Date
    const now = new Date();
    el('dash-date').textContent = now.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    renderScorecard();
    renderStats();
    renderProgressOverview();
    renderWeekChart();
  }

  function renderScorecard() {
    const container = el('scorecard');
    if (!container) return;
    const scores = Store.getTodayScores();
    const total = Object.values(scores).filter(Boolean).length;
    if (el('score-total')) el('score-total').textContent = total + ' / 6';

    container.innerHTML = DATA.scoreItems.map(s => {
      const done = scores[s.id] || false;
      return `<div class="score-card ${done ? 'done' : ''}" onclick="App.toggleScore('${s.id}')" title="${done ? 'Done! Click to undo' : 'Mark done'}">
        <i class="${s.icon} score-icon" aria-hidden="true"></i>
        <div class="score-name">${s.label}</div>
      </div>`;
    }).join('');
  }

  function toggleScore(id) {
    const scores = Store.getTodayScores();
    Store.setScore(id, !scores[id]);
    renderScorecard();
    updateHUD();
    if (currentPage === 'dashboard') renderStats();
  }

  function renderStats() {
    const container = el('stat-grid');
    if (!container) return;
    const apps = Store.state.apps;
    const interviews = apps.filter(a => ['hr', 'tech', 'final', 'selected'].includes(a.status)).length;
    const sc = Object.values(Store.getTodayScores()).filter(Boolean).length;
    const aimlDone = countChecked('aiml', DATA.aiml);
    const csDone = countChecked('cs', DATA.cs);

    container.innerHTML = `
      <div class="stat-card"><div class="stat-num indigo">${Store.daysSinceStart()}</div><div class="stat-label">Days Running</div></div>
      <div class="stat-card"><div class="stat-num green">${Store.calcStreak()}</div><div class="stat-label">Day Streak</div></div>
      <div class="stat-card"><div class="stat-num amber">${Store.dsaTotal()}</div><div class="stat-label">DSA Solved</div></div>
      <div class="stat-card"><div class="stat-num blue">${apps.length}</div><div class="stat-label">Apps Sent</div></div>
      <div class="stat-card"><div class="stat-num purple">${interviews}</div><div class="stat-label">Interviews</div></div>
      <div class="stat-card"><div class="stat-num">${sc}/6</div><div class="stat-label">Today's Score</div></div>
      <div class="stat-card"><div class="stat-num green">${aimlDone}/${DATA.aiml.length}</div><div class="stat-label">AI/ML Done</div></div>
      <div class="stat-card"><div class="stat-num indigo">${csDone}/${DATA.cs.length}</div><div class="stat-label">CS Subjects</div></div>
    `;
  }

  function renderProgressOverview() {
    const container = el('progress-overview');
    if (!container) return;

    const aimlDone = countChecked('aiml', DATA.aiml);
    const csDone = countChecked('cs', DATA.cs);
    const projDone = Object.values(Store.state.projPhases).filter(Boolean).length;
    const dsaT = Store.dsaTotal();

    const items = [
      { title: 'AI/ML Course', icon: 'ti-school', done: aimlDone, total: DATA.aiml.length, color: 'indigo' },
      { title: 'CS Fundamentals', icon: 'ti-cpu', done: csDone, total: DATA.cs.length, color: 'green' },
      { title: 'Major Project', icon: 'ti-brain', done: projDone, total: DATA.projPhases.length, color: 'purple' },
      { title: 'DSA Problems', icon: 'ti-code', done: Math.min(dsaT, 20), total: 20, color: 'amber' }
    ];

    container.innerHTML = items.map(item => {
      const pct = item.total ? fmt((item.done / item.total) * 100) : 0;
      return `<div class="progress-card">
        <div class="progress-card-header">
          <span class="progress-card-title"><i class="ti ${item.icon}"></i> ${item.title}</span>
          <span class="progress-card-pct" style="color:var(--${item.color})">${pct}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill ${item.color}" style="width:${pct}%"></div>
        </div>
        <div class="progress-label"><span>${item.done} completed</span><span>${item.total - item.done} remaining</span></div>
      </div>`;
    }).join('');
  }

  function renderWeekChart() {
    const chartEl = el('week-chart');
    const labelsEl = el('week-labels');
    if (!chartEl) return;

    const week = Store.getWeek();
    const maxScore = 6;
    const maxDSA = Math.max(1, ...week.map(w => w.dsa));

    const yLabels = el('chart-y');
    if (yLabels) yLabels.innerHTML = ['6', '3', '0'].map(l => `<div class="chart-y-label">${l}</div>`).join('');

    chartEl.innerHTML = week.map(w => {
      const scoreH = fmt((w.score / maxScore) * 90);
      const dsaH = fmt((w.dsa / maxDSA) * 90);
      return `<div class="bar-group">
        <div class="chart-bar score-bar" style="height:${Math.max(3, scoreH)}px" title="Score: ${w.score}/6"></div>
        <div class="chart-bar dsa-bar" style="height:${Math.max(3, dsaH)}px" title="DSA: ${w.dsa}"></div>
      </div>`;
    }).join('');

    if (labelsEl) labelsEl.innerHTML = week.map(w => `<div class="chart-x-label">${w.label}</div>`).join('');
  }

  // ---- PHASE 1 ----
  function renderPhase1() {
    renderTaskList('aiml-tasks', DATA.aiml, 'aiml');
    renderTaskList('cs-tasks', DATA.cs, 'cs');
    renderTaskList('comm-tasks', DATA.comm, 'comm');
    renderPhase1Bars();
    renderP1DSA();
  }

  function renderPhase1Bars() {
    const aimlDone = countChecked('aiml', DATA.aiml);
    const csDone = countChecked('cs', DATA.cs);
    const total = DATA.aiml.length + DATA.cs.length;
    const totalDone = aimlDone + csDone;
    const overallPct = fmt((totalDone / total) * 100);

    const aimlPct = fmt((aimlDone / DATA.aiml.length) * 100);
    const csPct = fmt((csDone / DATA.cs.length) * 100);

    if (el('aiml-tag')) el('aiml-tag').textContent = `${aimlDone}/${DATA.aiml.length}`;
    if (el('cs-tag')) el('cs-tag').textContent = `${csDone}/${DATA.cs.length}`;
    if (el('p1-overall-tag')) el('p1-overall-tag').textContent = overallPct + '%';

    const mp = el('p1-multi-progress');
    if (mp) {
      mp.innerHTML = `
        <div class="multi-row">
          <div class="multi-label"><span>AI/ML Course</span><span>${aimlPct}%</span></div>
          <div class="progress-bar"><div class="progress-fill" style="width:${aimlPct}%"></div></div>
        </div>
        <div class="multi-row">
          <div class="multi-label"><span>CS Fundamentals</span><span>${csPct}%</span></div>
          <div class="progress-bar"><div class="progress-fill green" style="width:${csPct}%"></div></div>
        </div>
        <div class="multi-row">
          <div class="multi-label" style="font-weight:600"><span>Phase 1 Overall</span><span>${overallPct}%</span></div>
          <div class="progress-bar" style="height:8px"><div class="progress-fill amber" style="width:${overallPct}%"></div></div>
        </div>`;
    }
  }

  function renderP1DSA() {
    const total = Store.dsaTotal();
    const target = 15;
    const pct = fmt(Math.min(100, (total / target) * 100));

    const tb = el('p1-dsa-target-bar');
    if (tb) {
      tb.innerHTML = `
        <div class="dsa-target-label">
          <span>Progress toward ${target}-problem target</span>
          <span style="color:var(--amber);font-weight:600">${total} / ${target}</span>
        </div>
        <div class="dsa-target-track">
          <div class="dsa-target-fill" style="width:${pct}%"></div>
        </div>`;
    }

    const ds = el('p1-dsa-stats');
    if (ds) {
      ds.innerHTML = `
        <div class="stat-card"><div class="stat-num amber">${total}</div><div class="stat-label">Solved</div></div>
        <div class="stat-card"><div class="stat-num">${target}</div><div class="stat-label">Target</div></div>
        <div class="stat-card"><div class="stat-num green">${Math.max(0, target - total)}</div><div class="stat-label">Remaining</div></div>
        <div class="stat-card"><div class="stat-num indigo">${pct}%</div><div class="stat-label">Done</div></div>`;
    }
  }

  // ---- PHASE 2 ----
  function renderPhase2() {
    renderDSATopics();
    renderTaskList('interview-tasks', DATA.interview, 'interview');
    renderTaskList('project-explain-tasks', DATA.projExplain, 'projexp');
    renderTaskList('aptitude-tasks', DATA.aptitude, 'apt');
    renderTaskList('networking-tasks', DATA.networking, 'net');
    renderNetworkStats();
  }

  function renderDSATopics() {
    const container = el('dsa-topics-list');
    if (!container) return;

    const dsa = Store.state.dsa;
    const total = Store.dsaTotal();
    const maxVal = Math.max(1, ...Object.values(dsa));

    // Populate select
    const sel = el('dsa-topic-select');
    if (sel && !sel.options.length) {
      DATA.dsaTopics.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t; opt.textContent = t;
        sel.appendChild(opt);
      });
    }

    container.innerHTML = DATA.dsaTopics.map(t => {
      const count = dsa[t] || 0;
      const pct = fmt((count / maxVal) * 100);
      return `<div class="dsa-topic-row">
        <span class="dsa-topic-label">${t}</span>
        <div class="dsa-mini-bar"><div class="dsa-mini-fill" style="width:${pct}%"></div></div>
        <div class="counter-row">
          <button class="counter-btn" onclick="App.adjDSA('${t}', -1)" aria-label="Decrease">−</button>
          <span class="dsa-count-num">${count}</span>
          <button class="counter-btn" onclick="App.adjDSA('${t}', 1)" aria-label="Increase">+</button>
        </div>
      </div>`;
    }).join('');

    if (el('dsa-grand-total')) el('dsa-grand-total').textContent = 'Total: ' + total;

    renderDSAChart();
    renderP1DSA();
    updateHUD();
  }

  function renderDSAChart() {
    const container = el('dsa-topic-chart');
    if (!container) return;
    const dsa = Store.state.dsa;
    const total = Store.dsaTotal();
    if (!total) {
      container.innerHTML = '<p style="font-size:12px;color:var(--text3);text-align:center;padding:16px 0">Solve some problems to see distribution!</p>';
      return;
    }
    const maxVal = Math.max(1, ...Object.values(dsa));
    container.innerHTML = DATA.dsaTopics
      .filter(t => (dsa[t] || 0) > 0)
      .sort((a, b) => (dsa[b] || 0) - (dsa[a] || 0))
      .map(t => {
        const count = dsa[t] || 0;
        const pct = fmt((count / maxVal) * 100);
        return `<div class="topic-chart-row">
          <span class="topic-chart-label">${t}</span>
          <div class="topic-chart-bar-wrap"><div class="topic-chart-fill" style="width:${pct}%"></div></div>
          <span class="topic-chart-val">${count}</span>
        </div>`;
      }).join('');
  }

  function adjDSA(topic, delta) {
    Store.state.dsa[topic] = Math.max(0, (Store.state.dsa[topic] || 0) + delta);
    Store.save('dsa');
    Store.snapshotWeekly();
    renderDSATopics();
    if (currentPage === 'dashboard') { renderStats(); renderProgressOverview(); renderWeekChart(); }
  }

  function addDSA() {
    const topic = el('dsa-topic-select').value;
    const count = parseInt(el('dsa-add-count').value) || 1;
    Store.state.dsa[topic] = (Store.state.dsa[topic] || 0) + count;
    Store.save('dsa');
    Store.snapshotWeekly();
    el('dsa-add-count').value = 1;
    renderDSATopics();
    updateHUD();
  }

  function renderNetworkStats() {
    const container = el('network-stats');
    if (!container) return;
    const li = Store.state.checks['net_' + key(DATA.networking[0])] ? 1 : 0;
    const ref = Store.state.checks['net_' + key(DATA.networking[1])] ? 1 : 0;
    const mentor = Store.state.checks['net_' + key(DATA.networking[2])] ? 1 : 0;
    container.innerHTML = `
      <div class="stat-card"><div class="stat-num indigo">${li}</div><div class="stat-label">LinkedIn Today</div></div>
      <div class="stat-card"><div class="stat-num amber">${ref}</div><div class="stat-label">Referrals Today</div></div>
      <div class="stat-card"><div class="stat-num green">${mentor}</div><div class="stat-label">Mentors Today</div></div>`;
  }

  // ---- APPLICATIONS ----
  function renderApplications() {
    const apps = Store.state.apps;
    const filter = (el('app-filter') || {}).value || 'all';
    const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

    // Stats
    const statContainer = el('app-stat-grid');
    if (statContainer) {
      const total = apps.length;
      const active = apps.filter(a => !['rejected', 'selected'].includes(a.status)).length;
      const interviews = apps.filter(a => ['hr', 'tech', 'final', 'selected'].includes(a.status)).length;
      const offers = apps.filter(a => a.status === 'selected').length;
      const rejected = apps.filter(a => a.status === 'rejected').length;
      statContainer.innerHTML = `
        <div class="stat-card"><div class="stat-num blue">${total}</div><div class="stat-label">Total Applied</div></div>
        <div class="stat-card"><div class="stat-num amber">${active}</div><div class="stat-label">Active</div></div>
        <div class="stat-card"><div class="stat-num indigo">${interviews}</div><div class="stat-label">Interviews</div></div>
        <div class="stat-card"><div class="stat-num green">${offers}</div><div class="stat-label">Offers 🎉</div></div>
        <div class="stat-card"><div class="stat-num rose">${rejected}</div><div class="stat-label">Rejected</div></div>`;
    }

    const tbody = el('apps-tbody');
    const emptyState = el('apps-empty');
    if (!tbody) return;

    if (!filtered.length) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    tbody.innerHTML = filtered.map((a, i) => {
      const realIdx = apps.indexOf(a);
      const statusOpts = Object.entries(DATA.statusLabels).map(([val, lbl]) =>
        `<option value="${val}" ${a.status === val ? 'selected' : ''}>${lbl}</option>`
      ).join('');
      return `<tr>
        <td style="font-weight:500">${a.company}</td>
        <td style="color:var(--text2)">${a.role || '—'}</td>
        <td style="color:var(--text3);font-size:12px">${a.date}</td>
        <td>
          <select class="app-select" onchange="App.updateAppStatus(${realIdx}, this.value)">
            ${statusOpts}
          </select>
        </td>
        <td>
          <button class="btn danger" onclick="App.removeApp(${realIdx})" title="Remove" aria-label="Remove application">
            <i class="ti ti-trash"></i>
          </button>
        </td>
      </tr>`;
    }).join('');
  }

  function addApplication() {
    const company = (el('app-company').value || '').trim();
    const role = (el('app-role').value || '').trim();
    const date = el('app-date').value || todayISO();
    const status = el('app-status-select').value;

    if (!company) { el('app-company').focus(); return; }

    Store.state.apps.unshift({ company, role, date, status });
    Store.save('apps');

    el('app-company').value = '';
    el('app-role').value = '';

    renderApplications();
    updateHUD();
  }

  function removeApp(idx) {
    if (!confirm(`Remove application to "${Store.state.apps[idx].company}"?`)) return;
    Store.state.apps.splice(idx, 1);
    Store.save('apps');
    renderApplications();
    updateHUD();
  }

  function updateAppStatus(idx, val) {
    Store.state.apps[idx].status = val;
    Store.save('apps');
    renderApplications();
  }

  // ---- PROJECT ----
  function renderProject() {
    renderProjPhases();
    renderMilestones();
    const notesEl = el('proj-notes');
    if (notesEl) notesEl.value = Store.state.notes;
  }

  function renderProjPhases() {
    const phases = Store.state.projPhases;
    const done = Object.values(phases).filter(Boolean).length;
    const total = DATA.projPhases.length;
    const pct = fmt((done / total) * 100);

    const bar = el('proj-bar');
    if (bar) bar.style.width = pct + '%';
    if (el('proj-pct-badge')) el('proj-pct-badge').textContent = pct + '%';

    // Chip strip
    const chips = el('proj-phase-chips');
    if (chips) {
      chips.innerHTML = DATA.projPhases.map(p =>
        `<span class="phase-chip ${phases[p.id] ? 'done' : ''}">${phases[p.id] ? '✓' : '○'} ${p.label}</span>`
      ).join('');
    }

    // Phase cards
    const grid = el('proj-phases');
    if (grid) {
      grid.innerHTML = DATA.projPhases.map(p => {
        const isDone = phases[p.id] || false;
        return `<div class="proj-phase-card ${isDone ? 'done' : ''}" onclick="App.togglePhase('${p.id}')">
          <div class="phase-card-icon"><i class="ti ${p.icon}"></i></div>
          <div class="phase-card-name">${p.label}</div>
          <div class="phase-card-status">${isDone ? '✓ Complete' : 'Not started'}</div>
        </div>`;
      }).join('');
    }
  }

  function togglePhase(id) {
    Store.state.projPhases[id] = !Store.state.projPhases[id];
    Store.save('projPhases');
    renderProjPhases();
    updateHUD();
    if (currentPage === 'dashboard') renderProgressOverview();
  }

  function renderMilestones() {
    const container = el('milestones-list');
    if (!container) return;
    const milestones = Store.state.milestones;

    if (!milestones.length) {
      container.innerHTML = '<p style="font-size:12px;color:var(--text3);padding:8px 0">No milestones yet. Add one to track key goals!</p>';
      return;
    }

    container.innerHTML = milestones.map((m, i) => `
      <div class="milestone-item">
        <div class="milestone-dot ${m.done ? 'done' : 'active'}" onclick="App.toggleMilestone(${i})" title="${m.done ? 'Mark incomplete' : 'Mark complete'}"></div>
        <div class="milestone-body">
          <div class="milestone-text ${m.done ? 'done' : ''}">${m.text}</div>
          ${m.date ? `<div class="milestone-date">📅 ${m.date}</div>` : ''}
        </div>
        <button class="milestone-del btn danger" onclick="App.removeMilestone(${i})" title="Remove" aria-label="Remove milestone">
          <i class="ti ti-x"></i>
        </button>
      </div>`).join('');
  }

  function showMilestoneForm() {
    el('milestone-form').classList.remove('hidden');
    el('milestone-text').focus();
  }

  function hideMilestoneForm() {
    el('milestone-form').classList.add('hidden');
    el('milestone-text').value = '';
    el('milestone-date').value = '';
  }

  function addMilestone() {
    const text = (el('milestone-text').value || '').trim();
    if (!text) return;
    const date = el('milestone-date').value;
    Store.state.milestones.push({ text, date, done: false });
    Store.save('milestones');
    hideMilestoneForm();
    renderMilestones();
  }

  function toggleMilestone(i) {
    Store.state.milestones[i].done = !Store.state.milestones[i].done;
    Store.save('milestones');
    renderMilestones();
  }

  function removeMilestone(i) {
    Store.state.milestones.splice(i, 1);
    Store.save('milestones');
    renderMilestones();
  }

  function saveNotes() {
    Store.state.notes = (el('proj-notes').value || '');
    Store.save('notes');
    const msg = el('note-saved-msg');
    if (msg) {
      msg.textContent = '✓ Saved';
      setTimeout(() => { msg.textContent = ''; }, 2000);
    }
  }

  // ---- Phase 2 Tabs ----
  function showTab(tabId) {
    qsa('.tab-content').forEach(t => t.classList.remove('active'));
    qsa('.tab-btn').forEach(b => b.classList.remove('active'));
    const tabEl = el('tab-' + tabId);
    if (tabEl) tabEl.classList.add('active');
    const btn = qs(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');
  }

  // ---- Init ----
  function init() {
    // Nav buttons
    qsa('.nav-btn[data-page]').forEach(btn => {
      btn.addEventListener('click', () => showPage(btn.dataset.page));
    });

    // Tab buttons
    qsa('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });

    // Mobile sidebar
    el('menu-toggle').addEventListener('click', () => {
      el('sidebar').classList.contains('open') ? closeSidebar() : openSidebar();
    });
    el('sidebar-overlay').addEventListener('click', closeSidebar);

    // Set today's date on app form
    const dateInput = el('app-date');
    if (dateInput) dateInput.value = todayISO();

    // Enter key for app form
    ['app-company', 'app-role'].forEach(id => {
      const input = el(id);
      if (input) input.addEventListener('keydown', e => { if (e.key === 'Enter') addApplication(); });
    });

    // Enter key for milestone
    const mi = el('milestone-text');
    if (mi) mi.addEventListener('keydown', e => { if (e.key === 'Enter') addMilestone(); });

    // Initial snapshot
    Store.snapshotWeekly();

    // Render dashboard
    showPage('dashboard');
  }

  // Public API
  return {
    init,
    showPage, showTab,
    toggleCheck, toggleScore,
    adjDSA, addDSA,
    addApplication, removeApp, updateAppStatus, renderApplications,
    togglePhase,
    showMilestoneForm, hideMilestoneForm, addMilestone, toggleMilestone, removeMilestone,
    saveNotes
  };

})();

document.addEventListener('DOMContentLoaded', App.init);
