import { createSession } from "./sessions.js";
import { saveState } from "../storage.js";
import { renderApp } from "../app.js";

let intervalId = null;

export function mountTimerView(state) {
  bindTimerControls(state);
}

export function renderTimerView(state) {
  renderTimer(state);
}

export function resetActiveTimer(state) {
  const session = getActiveSession(state);

  if (session) {
    if (!Array.isArray(session.breaks)) {
      session.breaks = [];
    }

    const last = session.breaks[session.breaks.length - 1];

    if (last && last.endedAt === null) {
      last.endedAt = Date.now();
    }

    session.endedAt = Date.now();
  }

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  state.activeSessionId = null;
  saveState(state);
}

function bindTimerControls(state) {
  const startBtn = document.getElementById("start-timer-btn");
  const breakBtn = document.getElementById("break-timer-btn");
  const stopBtn = document.getElementById("stop-timer-btn");

  if (!startBtn || !breakBtn || !stopBtn) {
    return;
  }

  startBtn.addEventListener("click", function () {
    if (state.activeSessionId) {
      return;
    }

    const session = createSession(state);
    state.sessions.push(session);
    state.activeSessionId = session.id;

    saveState(state);
    startTick(state);
    renderApp();
  });

  breakBtn.addEventListener("click", function () {
    toggleBreak(state);
  });

  stopBtn.addEventListener("click", function () {
    stopTick(state);
  });
}

function startTick(state) {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(function () {
    renderTimer(state);
  }, 250);
}

function getActiveSession(state) {
  return (
    state.sessions.find(function (session) {
      return (
        session.id === state.activeSessionId &&
        (session.endedAt === null || session.endedAt === undefined)
      );
    }) || null
  );
}

function toggleBreak(state) {
  const session = getActiveSession(state);

  if (!session) {
    return;
  }

  const last = session.breaks[session.breaks.length - 1];

  if (!last || last.endedAt !== null) {
    session.breaks.push({
      startedAt: Date.now(),
      endedAt: null
    });
  } else {
    last.endedAt = Date.now();
  }

  saveState(state);
  renderApp();
}

function stopTick(state) {
  const session = getActiveSession(state);

  if (session) {
    if (!Array.isArray(session.breaks)) {
      session.breaks = [];
    }

    const last = session.breaks[session.breaks.length - 1];

    if (last && last.endedAt === null) {
      last.endedAt = Date.now();
    }

    session.endedAt = Date.now();
  }

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  state.activeSessionId = null;
  saveState(state);
  renderApp();
}

function renderTimer(state) {
  const timeEl = document.getElementById("timer-time");
  const statusEl = document.getElementById("timer-status");

  const startBtn = document.getElementById("start-timer-btn");
  const breakBtn = document.getElementById("break-timer-btn");
  const stopBtn = document.getElementById("stop-timer-btn");

  const session = getActiveSession(state);

  if (!session) {
    if (timeEl) timeEl.textContent = "00:00:00";
    if (statusEl) statusEl.textContent = "Ready to start";

    if (startBtn) startBtn.disabled = false;
    if (breakBtn) breakBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = true;
    if (breakBtn) breakBtn.textContent = "Start Break";
    return;
  }

  const now = Date.now();
  const total = now - session.startedAt;

  let breakSum = 0;
  for (const b of session.breaks) {
    const end = b.endedAt ?? now;
    breakSum += Math.max(0, end - b.startedAt);
  }

  const net = Math.max(0, total - breakSum);

  if (timeEl) timeEl.textContent = formatMs(net);

  const last = session.breaks[session.breaks.length - 1];
  const onBreak = !!last && last.endedAt === null;

  if (statusEl) statusEl.textContent = onBreak ? "On break" : "Session running";

  if (startBtn) startBtn.disabled = true;
  if (breakBtn) breakBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = false;
  if (breakBtn) breakBtn.textContent = onBreak ? "End Break" : "Start Break";
}

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}