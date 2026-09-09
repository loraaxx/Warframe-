const STORAGE_KEY = 'warframe-command-center-v1';

const defaultState = {
  version: 1,
  account: {
    mr: 5,
    standing: 31100,
    standingGoal: 44000,
    dailyStandingRemaining: 3000,
    storyCheckpoint: 'Neptune unlocked; Tyl Regor defeated; Neptune Junction completed.',
    nextStory: 'Complete The Second Dream.',
    frames: 'Wisp [30] — main\nVolt [30]\nExcalibur [30]\nLimbo [27]\nRhino [20]\nMag [0]',
    notes: 'Primary: Fulmin [30], potatoed\nSecondary: Dex Furis [30] → Atomos project\nMelee: Heat Sword [30] → Broken War after Second Dream\nCompanion: Panzer Vulpaphyla [30] → reach Associate, gild, rebuild\nDo not assume Nekros owned unless reconfirmed.'
  },
  planner: {
    primaryOutcome: 'Complete The Second Dream',
    sessionTarget: '6–8 hours',
    tasks: {}
  },
  intakeLog: []
};

const phases = [
  {
    id: 'preflight', index: '01', title: 'Pre-Flight Arsenal', type: 'arsenal', time: '15–25 min',
    tasks: [
      ['preflight-fulmin', 'Verify Fulmin starting layout', 'Arsenal → Fulmin → Upgrade. Confirm Split Chamber R4 | Serration R6 | Cryo Rounds R3 | Infected Clip R5 / Stormbringer R3 | Point Strike R2 | Rifle Aptitude R0 | EMPTY and 56/60 used.'],
      ['preflight-endo', 'Check Endo + Credits before Mission 1', 'Use the Endo Spend Queue below. Do not fuse a queued mod unless the listed capacity state still matches the live screen.']
    ]
  },
  {
    id: 'dream', index: '02', title: 'The Second Dream', type: 'story', time: '1.5–2.5 hr',
    tasks: [
      ['dream-start', 'Begin The Second Dream', 'Codex → The Second Dream → Begin. Do not detour into optional content first.'],
      ['dream-complete', 'Complete The Second Dream', 'Keep the quest active until the full quest is complete. Avoid story spoilers unless mechanically blocked.'],
      ['dream-stop', 'Return to Orbiter and stop', 'Do not launch another mission yet. Broken War + Focus automatically trigger specialist checkpoints.']
    ]
  },
  {
    id: 'broken-war', index: '03', title: 'Broken War Checkpoint', type: 'arsenal', time: '15–25 min',
    tasks: [
      ['broken-screen', 'Open Broken War Upgrade screen', 'Arsenal → Broken War → Upgrade. Capture the full screen before Auto Install or fusion.'],
      ['broken-build', 'Apply exact Broken War build', 'Use current capacity + polarities + owned melee mods. Re-rank the Endo queue before further spending.']
    ]
  },
  {
    id: 'focus', index: '04', title: 'Focus Review', type: 'arsenal', time: '10–20 min',
    tasks: [
      ['focus-review', 'Inspect the newly unlocked Focus system', 'Learn the interface and record any permanent-looking decision before spending. Do not turn this into a long farm yet.']
    ]
  },
  {
    id: 'associate', index: '05', title: 'Entrati → Associate', type: 'deimos', time: '1–2 hr',
    tasks: [
      ['associate-reserve', 'Reserve rank-up + gild resources', 'Preserve the required rank-up sacrifice and 10 Son Tokens for gilding. Never redeem a reserved token for Standing.'],
      ['associate-standing', 'Close the Standing gap', 'Current save: 31,100 / 44,000. If the old 3,000 daily allowance remains, use it first; otherwise work from the refreshed cap. Bank excess Mother Tokens.'],
      ['associate-rank', 'Rank Entrati to Associate', 'Rank up only when 44,000 Standing and the live sacrifice requirements are verified in client.']
    ]
  },
  {
    id: 'gild', index: '06', title: 'Gild Panzer', type: 'deimos', time: '30–60 min',
    tasks: [
      ['gild-ready', 'Prepare gild cost', 'After Associate, preserve 5,000 Standing and 10 Son Tokens for the live gild cost if client still matches the verified plan.'],
      ['gild-polarity', 'Stop at polarity selection', 'Do not casually select a polarity. Use the full gild/polarity screen to choose the polarity that supports the intended long-term Panzer build.'],
      ['gild-rebuild', 'Rebuild Panzer + Claws after gilding', 'Panzer returns to Rank 0. Recalculate exact capacity/polarities and rebuild from the actual post-gild screens.']
    ]
  },
  {
    id: 'plague-star', index: '07', title: 'Plague Star', type: 'event', time: '45–90 min',
    tasks: [
      ['plague-run', 'Complete a first Plague Star run if live', 'Use this as event reconnaissance, not an all-day detour.'],
      ['plague-shop', 'Inspect Operational Supply', 'Record current event Standing, rank, and the live cost of the reward you care about so the next planner can calculate the grind exactly.']
    ]
  },
  {
    id: 'story-push', index: '08', title: 'Next Story Push', type: 'story', time: '60–90 min',
    tasks: [
      ['story-client', 'Read the live Tenno Guide / Codex', 'Client state wins if quest prerequisites differ from online information.'],
      ['story-route', 'Push the shortest required path', 'Clear only nodes that advance the next Junction / main-story requirement. Stop at the next major gate.']
    ]
  },
  {
    id: 'projects', index: '09', title: 'Xoris + Atomos', type: 'flex', time: '45–90 min',
    tasks: [
      ['xoris-check', 'Check The Deadlock Protocol', 'If available, progress toward Xoris. If locked, record the exact live prerequisite and park it.'],
      ['atomos-check', 'Check Atomos Foundry status', 'If claimable and a slot is available, claim it and trigger a Secondary build audit before serious investment.']
    ]
  },
  {
    id: 'flex', index: '10', title: 'Deep Flex', type: 'flex', time: '30–90+ min',
    tasks: [
      ['flex-mr', 'Level one account-power target', 'Rhino [20] → 30, then Limbo [27] → 30, then Mag [0]. One target at a time.'],
      ['flex-endo', 'Run a bounded Endo block only if needed', 'All Endo feeds the verified queue. Do not spend beyond a listed capacity breakpoint.'],
      ['flex-foundry', 'Leave useful mastery gear crafting', 'Before logout, keep the Foundry pipeline moving with an unmastered weapon if resources allow.']
    ]
  }
];

const endoQueue = [
  {
    priority: 1,
    title: 'Split Chamber R4 → R5 MAX',
    badge: 'UPGRADE FIRST',
    details: 'Keep it in the matching Madurai slot. Equipped cost increases only 7 → 8. Capacity becomes 57/60. Rearrangement: none.'
  },
  {
    priority: 2,
    title: 'Point Strike R2 → R5 MAX',
    badge: 'UPGRADE SECOND',
    details: 'Neutral cost path 6 → 7 → 8 → 9. Capacity reaches 60/60. Rearrangement: none until max.'
  },
  {
    priority: 3,
    title: 'BREAKPOINT A — Remove Rifle Aptitude R0',
    badge: 'REARRANGE',
    details: 'Once Point Strike is maxed, remove Rifle Aptitude. Bottom row becomes Stormbringer | Point Strike | EMPTY | EMPTY. Capacity returns to 56/60.'
  },
  {
    priority: 4,
    title: 'Cryo Rounds R3 → R5 MAX',
    badge: 'VIRAL',
    details: 'Keep Cryo before Infected Clip so Cold + Toxin remains Viral. Capacity becomes 58/60. No slot movement.'
  },
  {
    priority: 5,
    title: 'Stormbringer R3 → R5 MAX',
    badge: 'ELECTRICITY',
    details: 'Consumes the last 2 capacity. Final state: 60/60, Viral + Electricity. No slot movement.'
  },
  {
    priority: 6,
    title: 'Serration R6 → BANK ENDO',
    badge: 'STOP',
    details: 'Do not force another Serration rank once the finished layout is 60/60. Preserve the strong polarity arrangement and bank Endo until a verified capacity solution exists.'
  }
];

const breakpoints = [
  ['START', '56/60', 'Rifle Aptitude remains temporary filler.'],
  ['Split Chamber MAX', '57/60', 'Matching Madurai polarity absorbs most of the raw drain increase.'],
  ['Point Strike MAX', '60/60', 'First hard capacity breakpoint.'],
  ['REMOVE Rifle Aptitude', '56/60', 'Bottom slot 3 becomes EMPTY intentionally.'],
  ['Cryo Rounds MAX', '58/60', 'Preserve Cold → Toxin ordering for Viral.'],
  ['Stormbringer MAX', '60/60', 'Second hard breakpoint. Stop fusion and bank Endo.']
];

let state = loadState();
let previewObjectUrl = null;
let toastTimer = null;

function cloneDefault() {
  return JSON.parse(JSON.stringify(defaultState));
}

function mergeState(input) {
  const base = cloneDefault();
  if (!input || typeof input !== 'object') return base;
  base.version = Number(input.version) || base.version;
  base.account = { ...base.account, ...(input.account || {}) };
  base.planner = { ...base.planner, ...(input.planner || {}) };
  base.planner.tasks = { ...(input.planner?.tasks || {}) };
  base.intakeLog = Array.isArray(input.intakeLog) ? input.intakeLog.slice(0, 100) : [];
  return base;
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? mergeState(JSON.parse(saved)) : cloneDefault();
  } catch {
    return cloneDefault();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function toast(message) {
  const node = document.getElementById('toast');
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove('show'), 2200);
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(Math.max(0, Number(value) || 0));
}

function allTasks() {
  return phases.flatMap(phase => phase.tasks.map(task => ({ phase, id: task[0], title: task[1], detail: task[2] })));
}

function coreTaskIds() {
  return phases
    .filter(p => ['preflight', 'dream', 'broken-war', 'associate', 'gild'].includes(p.id))
    .flatMap(p => p.tasks.map(t => t[0]));
}

function renderPlanner() {
  const toc = document.getElementById('planner-toc');
  const phaseStack = document.getElementById('planner-phases');
  toc.innerHTML = '';
  phaseStack.innerHTML = '';

  phases.forEach(phase => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'toc-chip';
    btn.innerHTML = `<small>${phase.index}</small>${phase.title}`;
    btn.addEventListener('click', () => document.getElementById(`phase-${phase.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    toc.appendChild(btn);

    const card = document.createElement('article');
    card.className = `phase-card ${phase.type}`;
    card.id = `phase-${phase.id}`;
    const head = document.createElement('div');
    head.className = 'phase-title';
    head.innerHTML = `<div><p class="eyebrow">PHASE ${phase.index}</p><h3>${phase.title}</h3></div><span>${phase.time}</span>`;
    card.appendChild(head);

    const list = document.createElement('div');
    list.className = 'task-list';
    phase.tasks.forEach(([id, title, detail]) => {
      const label = document.createElement('label');
      label.className = `task-row ${state.planner.tasks[id] ? 'done' : ''}`;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = Boolean(state.planner.tasks[id]);
      input.addEventListener('change', () => {
        state.planner.tasks[id] = input.checked;
        saveState();
        renderAll();
      });
      const copy = document.createElement('div');
      copy.className = 'task-copy';
      copy.innerHTML = `<strong>${title}</strong><p>${detail}</p>`;
      label.append(input, copy);
      list.appendChild(label);
    });
    card.appendChild(list);
    phaseStack.appendChild(card);
  });
}

function renderEndo() {
  const queue = document.getElementById('endo-queue');
  queue.innerHTML = '';
  endoQueue.forEach(item => {
    const el = document.createElement('div');
    el.className = 'endo-item';
    el.innerHTML = `<div class="meta"><span class="badge">#${item.priority}</span><span class="badge">${item.badge}</span></div><strong>${item.title}</strong><p>${item.details}</p>`;
    queue.appendChild(el);
  });

  const timeline = document.getElementById('breakpoint-map');
  timeline.innerHTML = '';
  breakpoints.forEach(([title, cap, detail]) => {
    const el = document.createElement('div');
    el.className = 'timeline-item';
    el.innerHTML = `<strong>${title} · ${cap}</strong><span>${detail}</span>`;
    timeline.appendChild(el);
  });
}

function renderDashboard() {
  document.getElementById('mr-display').textContent = state.account.mr;
  document.getElementById('primary-outcome').textContent = state.planner.primaryOutcome;
  document.getElementById('story-status').textContent = state.account.storyCheckpoint;
  document.getElementById('standing-current').textContent = formatNumber(state.account.standing);
  document.getElementById('standing-goal').textContent = formatNumber(state.account.standingGoal);
  document.getElementById('standing-gap').textContent = formatNumber(Math.max(0, state.account.standingGoal - state.account.standing));

  const tasks = allTasks();
  const next = tasks.filter(t => !state.planner.tasks[t.id]).slice(0, 5);
  const nextList = document.getElementById('next-actions');
  nextList.innerHTML = next.length ? next.map(t => `<li><strong>${t.title}</strong><br><span class="muted">${t.phase.title}</span></li>`).join('') : '<li>Core planner complete. Use flex content or prepare the next save state.</li>';
  document.getElementById('live-next').textContent = next.length ? `Live next step: ${next[0].title}.` : 'Live next step: Extraction and save-state update.';

  const ids = coreTaskIds();
  const done = ids.filter(id => state.planner.tasks[id]).length;
  document.getElementById('core-progress-text').textContent = `${done} / ${ids.length}`;
  document.getElementById('core-progress-bar').style.width = `${ids.length ? Math.round(done / ids.length * 100) : 0}%`;

  const projects = [
    ['The Second Dream', state.planner.tasks['dream-complete'] ? 'Completed this session' : 'Primary story outcome'],
    ['Panzer Vulpaphyla', state.planner.tasks['gild-rebuild'] ? 'Gilded + rebuild complete' : 'Associate → gild → rebuild'],
    ['Fulmin Endo Ladder', 'Polarity-aware breakpoints active'],
    ['Xoris / Atomos', 'Productive support projects']
  ];
  document.getElementById('project-list').innerHTML = projects.map(([name, status]) => `<div class="project-item"><strong>${name}</strong><span>${status}</span></div>`).join('');
}

function renderAccountFields() {
  document.getElementById('field-mr').value = state.account.mr;
  document.getElementById('field-standing').value = state.account.standing;
  document.getElementById('field-standing-goal').value = state.account.standingGoal;
  document.getElementById('field-daily-standing').value = state.account.dailyStandingRemaining;
  document.getElementById('field-story').value = state.account.storyCheckpoint;
  document.getElementById('field-next-story').value = state.account.nextStory;
  document.getElementById('field-frames').value = state.account.frames;
  document.getElementById('field-notes').value = state.account.notes;
}

function renderIntakeLog() {
  const log = document.getElementById('intake-log');
  if (!state.intakeLog.length) {
    log.innerHTML = '<p class="muted">No session changes recorded yet.</p>';
    return;
  }
  log.innerHTML = state.intakeLog.map(entry => `<div class="log-item"><time>${new Date(entry.time).toLocaleString()}</time><div>${escapeHtml(entry.note)}</div></div>`).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderAll() {
  renderPlanner();
  renderEndo();
  renderDashboard();
  renderAccountFields();
  renderIntakeLog();
}

function switchView(viewName) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${viewName}`));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === viewName));
  const labels = {
    dashboard: 'Dashboard',
    planner: 'Daily Planner',
    arsenal: 'Arsenal + Endo',
    account: 'Account State',
    intake: 'Screenshot Intake'
  };
  document.getElementById('view-title').textContent = labels[viewName] || 'Command Center';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function saveAccountForm() {
  state.account.mr = Math.max(0, Math.min(40, Number(document.getElementById('field-mr').value) || 0));
  state.account.standing = Math.max(0, Number(document.getElementById('field-standing').value) || 0);
  state.account.standingGoal = Math.max(1, Number(document.getElementById('field-standing-goal').value) || 1);
  state.account.dailyStandingRemaining = Math.max(0, Number(document.getElementById('field-daily-standing').value) || 0);
  state.account.storyCheckpoint = document.getElementById('field-story').value.trim();
  state.account.nextStory = document.getElementById('field-next-story').value.trim();
  state.account.frames = document.getElementById('field-frames').value.trim();
  state.account.notes = document.getElementById('field-notes').value.trim();
  saveState();
  renderAll();
  toast('Account state saved locally.');
}

function exportState() {
  const payload = JSON.stringify(state, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `warframe-command-center-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  toast('State exported.');
}

function importState(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = mergeState(JSON.parse(String(reader.result)));
      saveState();
      renderAll();
      toast('State imported.');
    } catch {
      toast('That JSON file could not be imported.');
    }
  };
  reader.readAsText(file);
}

function completeNext() {
  const next = allTasks().find(task => !state.planner.tasks[task.id]);
  if (!next) {
    toast('All planner tasks are already complete.');
    return;
  }
  state.planner.tasks[next.id] = true;
  saveState();
  renderAll();
  toast(`Completed: ${next.title}`);
}

function clearCompleted() {
  state.planner.tasks = {};
  saveState();
  renderAll();
  toast('Planner checkmarks cleared.');
}

function resetSessionChecks() {
  state.planner.tasks = {};
  state.intakeLog = [];
  saveState();
  renderAll();
  toast('Session checks and intake log reset. Account state preserved.');
}

function setDateLabel() {
  const now = new Date();
  document.getElementById('today-label').textContent = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase();
}

document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
document.getElementById('save-account').addEventListener('click', saveAccountForm);
document.getElementById('export-state').addEventListener('click', exportState);
document.getElementById('import-state').addEventListener('change', event => importState(event.target.files?.[0]));
document.getElementById('check-next').addEventListener('click', completeNext);
document.getElementById('clear-completed').addEventListener('click', clearCompleted);
document.getElementById('reset-session').addEventListener('click', resetSessionChecks);

document.getElementById('screenshot-input').addEventListener('change', event => {
  const file = event.target.files?.[0];
  const preview = document.getElementById('screenshot-preview');
  if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl = null;
  if (!file || !file.type.startsWith('image/')) {
    preview.hidden = true;
    preview.removeAttribute('src');
    return;
  }
  previewObjectUrl = URL.createObjectURL(file);
  preview.src = previewObjectUrl;
  preview.hidden = false;
  toast('Screenshot loaded locally.');
});

document.getElementById('save-intake-note').addEventListener('click', () => {
  const field = document.getElementById('screenshot-note');
  const note = field.value.trim();
  if (!note) {
    toast('Add a short note describing what changed.');
    return;
  }
  state.intakeLog.unshift({ time: new Date().toISOString(), note });
  state.intakeLog = state.intakeLog.slice(0, 100);
  field.value = '';
  saveState();
  renderIntakeLog();
  toast('Change added to the session log.');
});

setDateLabel();
renderAll();
