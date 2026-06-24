// ============================================================
//  STORE — localStorage persistence
// ============================================================

const Store = (() => {
  const PREFIX = 'im26_';

  function get(key, fallback) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function set(key, value) {
    try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch {}
  }

  // ---- Initial state defaults ----
  const defaults = {
    checks:   {},           // { [checkboxId]: true/false }
    dsa:      Object.fromEntries(DATA.dsaTopics.map(t => [t, 0])),
    apps:     [],           // [{company, role, date, status}]
    projPhases: Object.fromEntries(DATA.projPhases.map(p => [p.id, false])),
    milestones: [],         // [{text, date, done}]
    notes:    '',
    scores:   {},           // { [dateKey]: { [scoreId]: bool } }
    weekly:   {}            // { [dateKey]: {score, dsa} }
  };

  // Expose state in memory, synced to localStorage
  const state = {
    checks:     get('checks',     defaults.checks),
    dsa:        get('dsa',        defaults.dsa),
    apps:       get('apps',       defaults.apps),
    projPhases: get('projPhases', defaults.projPhases),
    milestones: get('milestones', defaults.milestones),
    notes:      get('notes',      defaults.notes),
    scores:     get('scores',     defaults.scores),
    weekly:     get('weekly',     defaults.weekly)
  };

  function save(key) {
    set(key, state[key]);
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function getTodayScores() {
    const k = todayKey();
    if (!state.scores[k]) state.scores[k] = {};
    return state.scores[k];
  }

  function setScore(id, val) {
    const k = todayKey();
    if (!state.scores[k]) state.scores[k] = {};
    state.scores[k][id] = val;
    save('scores');
    snapshotWeekly();
  }

  function snapshotWeekly() {
    const k = todayKey();
    if (!state.weekly[k]) state.weekly[k] = {};
    const sc = Object.values(getTodayScores()).filter(Boolean).length;
    const dsaTotal = Object.values(state.dsa).reduce((a, b) => a + b, 0);
    state.weekly[k] = { score: sc, dsa: dsaTotal };
    save('weekly');
  }

  function calcStreak() {
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const k = d.toISOString().slice(0, 10);
      const sc = state.scores[k] || {};
      if (Object.values(sc).filter(Boolean).length > 0) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  }

  function dsaTotal() {
    return Object.values(state.dsa).reduce((a, b) => a + b, 0);
  }

  function daysSinceStart() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((now - START_DATE) / 86400000));
  }

  function getWeek() {
    const result = [];
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const k = d.toISOString().slice(0, 10);
      const w = state.weekly[k] || { score: 0, dsa: 0 };
      result.push({ label: days[d.getDay()], date: k, score: w.score, dsa: w.dsa });
    }
    return result;
  }

  return {
    state, save, todayKey, getTodayScores, setScore,
    snapshotWeekly, calcStreak, dsaTotal, daysSinceStart, getWeek
  };
})();
