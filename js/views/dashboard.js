import { getTaskReminderData } from "./tasks.js";

let reminderIntervalId = null;

export function mountDashboardView(state) {
  startReminderWatcher(state);
  bindDashboardControls(state);
}

export function renderDashboardView(state) {
  renderDashboardReminder(state);
  renderDashboardStatisticView(state);
}

function startReminderWatcher(state) {
  if (reminderIntervalId !== null) {
    clearInterval(reminderIntervalId);
  }

  reminderIntervalId = setInterval(function () {
    const dashboard = document.getElementById("view-dashboard");
    if (!dashboard) {
      return;
    }
    if (!dashboard.classList.contains("active")) {
      return;
    }
    renderDashboardReminder(state);
  }, 15000);
}

function renderDashboardReminder(state) {
  const box = document.getElementById("dashboard-reminder-box");

  if (!box) {
    return;
  }

  const dueTasks = getTaskReminderData(state).filter(function (task) {
    return String(task.topicId) === String(state.activeTopicId);
  });

  if (!state.activeTopicId) {
    box.innerHTML = "<p>No active topic selected.</p>";
    return;
  }

  if (dueTasks.length === 0) {
    box.innerHTML = "<p>No reminders right now.</p>";
    return;
  }

  box.innerHTML = dueTasks
    .map(function (task) {
      const now = Date.now();

      if (task.expiredAt && now >= task.expiredAt) {
        return `<div class="dashboard-warning expired">⚠ ${task.name}</div>`;
      }

      if (task.reminder && now >= task.reminder) {
        return `<div class="dashboard-warning reminder">⏰ ${task.name}</div>`;
      }

      return "";
    })
    .join("");
}

function formatDuration(ms) {
  const safeMs = Math.max(0, ms || 0);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function bindDashboardControls(state) {
  const rangeSelect = document.getElementById("dashboard-range-select");

  if (!rangeSelect) {
    return;
  }

  rangeSelect.addEventListener("change", function () {
    renderDashboardView(state);
  });
}

export function renderDashboardStatisticView(state) {
  const rangeSelect = document.getElementById("dashboard-range-select");

  if (!rangeSelect) {
    return;
  }

  if (!state.activeTopicId) {
    renderStat("stat-completed-tasks", 0);
    renderStat("stat-average-study", formatDuration(0));
    renderStat("stat-total-study", formatDuration(0));
    renderStat("stat-average-break", formatDuration(0));
    renderStat("stat-total-break", formatDuration(0));
    renderStudyChart([]);
    return;
  }

  const rangeValue = rangeSelect.value;

  const topicSessions = state.sessions.filter(function (session) {
    return String(session.topicId) === String(state.activeTopicId);
  });

  const topicTasks = state.tasks.filter(function (task) {
    return String(task.topicId) === String(state.activeTopicId);
  });

  const filteredSessions = getSessionsInRange(topicSessions, rangeValue);
  const filteredTasks = getCompletedTasksInRange(topicTasks, rangeValue);

  const totalStudyTime = getTotalStudyTime(filteredSessions);
  const averageStudyTime = getAverageStudyTime(filteredSessions);
  const totalBreakTime = getTotalBreakTime(filteredSessions);
  const averageBreakTime = getAverageBreakTime(filteredSessions);
  const completedTasks = filteredTasks.length;

  renderStat("stat-completed-tasks", completedTasks);
  renderStat("stat-average-study", formatDuration(averageStudyTime));
  renderStat("stat-total-study", formatDuration(totalStudyTime));
  renderStat("stat-average-break", formatDuration(averageBreakTime));
  renderStat("stat-total-break", formatDuration(totalBreakTime));

  renderStudyChart(filteredSessions);
}

function renderStat(id, value) {
  const element = document.getElementById(id);

  if (!element) {
    return;
  }

  element.textContent = value;
}

function getSessionsInRange(sessions, rangeValue) {
  const finishedSessions = sessions.filter(function (session) {
    return session.endedAt;
  });

  if (rangeValue === "all") {
    return finishedSessions;
  }

  const days = Number(rangeValue);
  const now = Date.now();
  const rangeStart = now - days * 24 * 60 * 60 * 1000;

  return finishedSessions.filter(function (session) {
    return session.startedAt >= rangeStart;
  });
}

function getCompletedTasksInRange(tasks, rangeValue) {
  const completedTasks = tasks.filter(function (task) {
    return task.finishedAt;
  });

  if (rangeValue === "all") {
    return completedTasks;
  }

  const days = Number(rangeValue);
  const now = Date.now();
  const rangeStart = now - days * 24 * 60 * 60 * 1000;

  return completedTasks.filter(function (task) {
    return task.finishedAt >= rangeStart;
  });
}

function getBreakDuration(session) {
  if (!session.breaks || !Array.isArray(session.breaks)) {
    return 0;
  }

  return session.breaks.reduce(function (sum, currentBreak) {
    if (!currentBreak.startedAt || !currentBreak.endedAt) {
      return sum;
    }

    return sum + (currentBreak.endedAt - currentBreak.startedAt);
  }, 0);
}

function getSessionStudyTime(session) {
  if (!session.startedAt || !session.endedAt) {
    return 0;
  }

  const totalSessionTime = session.endedAt - session.startedAt;
  const totalBreakTime = getBreakDuration(session);

  return Math.max(0, totalSessionTime - totalBreakTime);
}

function getTotalStudyTime(sessions) {
  return sessions.reduce(function (sum, session) {
    return sum + getSessionStudyTime(session);
  }, 0);
}

function getAverageStudyTime(sessions) {
  if (sessions.length === 0) {
    return 0;
  }

  return Math.floor(getTotalStudyTime(sessions) / sessions.length);
}

function getTotalBreakTime(sessions) {
  return sessions.reduce(function (sum, session) {
    return sum + getBreakDuration(session);
  }, 0);
}

function getAverageBreakTime(sessions) {
  if (sessions.length === 0) {
    return 0;
  }

  return Math.floor(getTotalBreakTime(sessions) / sessions.length);
}

function renderStudyChart(sessions) {
  const chart = document.getElementById("dashboard-chart");

  if (!chart) {
    return;
  }

  chart.innerHTML = "";

  const groupedData = getStudyTimeByDay(sessions);

  if (groupedData.length === 0) {
    chart.innerHTML = `<p class="dashboard-empty">No study data for this period yet.</p>`;
    return;
  }

  const maxValue = Math.max(
    ...groupedData.map(function (item) {
      return item.value;
    })
  );

  for (const item of groupedData) {
    const group = document.createElement("div");
    group.className = "dashboard-bar-group";

    const bar = document.createElement("div");
    bar.className = "dashboard-bar";

    const barHeight = maxValue > 0 ? (item.value / maxValue) * 180 : 4;
    bar.style.height = `${Math.max(barHeight, 4)}px`;

    const valueLabel = document.createElement("div");
    valueLabel.className = "dashboard-bar-value";
    valueLabel.textContent = formatDurationShort(item.value);

    const dayLabel = document.createElement("div");
    dayLabel.className = "dashboard-bar-label";
    dayLabel.textContent = item.label;

    group.appendChild(valueLabel);
    group.appendChild(bar);
    group.appendChild(dayLabel);

    chart.appendChild(group);
  }
}

function getStudyTimeByDay(sessions) {
  const groupedMap = new Map();

  for (const session of sessions) {
    const dateKey = formatDayKey(session.startedAt);
    const currentValue = groupedMap.get(dateKey) || 0;
    groupedMap.set(dateKey, currentValue + getSessionStudyTime(session));
  }

  const result = Array.from(groupedMap, function ([key, value]) {
    return {
      key,
      label: formatDayLabelFromKey(key),
      value
    };
  });

  result.sort(function (a, b) {
    return new Date(a.key).getTime() - new Date(b.key).getTime();
  });

  return result;
}

function formatDayKey(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDayLabelFromKey(key) {
  const parts = key.split("-");
  return `${parts[2]}.${parts[1]}`;
}

function formatDurationShort(ms) {
  const totalMinutes = Math.floor((ms || 0) / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}
