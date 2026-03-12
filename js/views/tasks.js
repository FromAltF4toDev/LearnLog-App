import { saveState } from "../storage.js";
import { renderApp } from "../app.js";

export function mountTaskView(state) {
  bindTaskControls(state);
}

export function renderTaskView(state) {
  renderTasks(state);
}

/* ========= Helpers ========= */



function getSessionById(state, sessionId) {
  return state.sessions.find(function (session) {
    return session.id === sessionId;
  }) || null;
}

function getVisibleTasks(state) {

  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000;

  return state.tasks.filter(function (task) {

    if (task.topicId !== state.activeTopicId) {
      return false;
    }

    if (task.finishedAt === null) {
      return true;
    }

    return now - task.finishedAt <= maxAge;

  });
}

function getDueTasks(state) {
  return getVisibleTasks(state).filter(function (task) {
    if (isTaskFinished(task)) {
      return false;
    }

    return isTaskExpired(task) || shouldShowReminder(task);
  });
}

function taskErrorMsg(msg) {
  const errorBox = document.getElementById("task-error");

  if (!errorBox) {
    console.log(msg);
    return;
  }

  errorBox.textContent = msg;
}

export function clearTaskErrorMsg() {
  const errorBox = document.getElementById("task-error");

  if (!errorBox) {
    return;
  }

  errorBox.textContent = "";
}

function isTaskFinished(task) {
  return task.finishedAt !== null;
}

function isTaskExpired(task) {
  if (task.expiredAt === null) {
    return false;
  }

  return Date.now() >= task.expiredAt;
}

function shouldShowReminder(task) {
  if (task.reminder === null) {
    return false;
  }

  if (isTaskFinished(task)) {
    return false;
  }

  if (isTaskExpired(task)) {
    return false;
  }

  return Date.now() >= task.reminder;
}

function getTaskInput() {
  const input = document.getElementById("input-task");
  const deadlineInput = document.getElementById("deadline-task-input");
  const reminderInput = document.getElementById("reminder-task-input");

  const inputValue = input.value.trim();

  if (!inputValue) {
    taskErrorMsg("Please enter a task.");
    return null;
  }

  let expiredAt = null;
  let reminder = null;

  if (deadlineInput.value) {
    const date = new Date(deadlineInput.value);
    expiredAt = date.getTime();
  }

  if (reminderInput.value) {
    const date = new Date(reminderInput.value);
    reminder = date.getTime();
  }

  return {
    name: inputValue,
    expiredAt: expiredAt,
    reminder: reminder
  };
}

function createTask(state, input) {
  return {
    id: Date.now() + Math.random(),
    name: input.name,
    topicId: state.activeTopicId,
    sessionId: state.activeSessionId,
    startedAt: Date.now(),
    finishedAt: null,
    expiredAt: input.expiredAt,
    reminder: input.reminder
  };
}

function bindTaskControls(state) {
  const form = document.getElementById("task-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!state.activeSessionId) {
      taskErrorMsg("Please start a session/timer before you add a task.");
      return;
    }

    if (!state.activeTopicId) {
      taskErrorMsg("Please create or choose a topic before you add a task.");
      return;
    }

    const input = getTaskInput();
    if (!input) return;

    if (!/\p{L}/u.test(input.name)) {
      taskErrorMsg("Please enter a valid name (avoid only numbers/signs).");
      return;
    }

    const task = createTask(state, input);
    state.tasks.push(task);

    const session = getSessionById(state, task.sessionId);
    if (session) {
      if (!Array.isArray(session.taskIds)) {
        session.taskIds = [];
      }

      if (!session.taskIds.includes(task.id)) {
        session.taskIds.push(task.id);
      }
    }

    saveState(state);
   

    form.reset();
    renderApp();
  });
}

function handleDone(state, taskId) {
  const task = state.tasks.find(function (task) {
    return task.id === taskId;
  });

  if (!task) {
    return;
  }

  if (task.finishedAt) {
    return;
  }

  task.finishedAt = Date.now();

  const session = getSessionById(state, task.sessionId);
  if (session) {
    if (!Array.isArray(session.doneTaskIds)) {
      session.doneTaskIds = [];
    }

    if (!session.doneTaskIds.includes(task.id)) {
      session.doneTaskIds.push(task.id);
    }
  }

  saveState(state);
  renderApp();
}

/* ========= Render ========= */

function renderTasks(state) {
  const taskList = document.getElementById("task-list");

  if (!taskList) {
    return;
  }

  taskList.textContent = "";

  if (!state.activeTopicId) {
    return;
  }

  const tasks = getVisibleTasks(state);

  if (tasks.length === 0) {
    taskList.innerHTML = "<li>No tasks for this topic yet.</li>";
    return;
  }

  for (const task of tasks) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = task.name;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    if (task.reminder !== null && shouldShowReminder(task)) {
      const reminderInfo = document.createElement("small");
      reminderInfo.textContent = "⏰ Reminder active";
      meta.appendChild(reminderInfo);
    }

    if (task.expiredAt !== null && isTaskExpired(task)) {
      const expiredInfo = document.createElement("small");
      expiredInfo.textContent = "⚠ Expired";
      meta.appendChild(expiredInfo);
    }

    const doneBtn = document.createElement("button");
    doneBtn.type = "button";
    doneBtn.textContent = task.finishedAt ? "Done ✅" : "Done";
    doneBtn.disabled = !!task.finishedAt;

    doneBtn.addEventListener("click", function () {
      handleDone(state, task.id);
    });

    if (task.finishedAt) {
      label.style.textDecoration = "line-through";
      label.style.opacity = "0.7";
    }

    li.appendChild(label);

    if (meta.childNodes.length > 0) {
      li.appendChild(meta);
    }

    li.appendChild(doneBtn);
    taskList.appendChild(li);
  }
}

/* ========= Optional for dashboard ========= */

export function getTaskReminderData(state) {
  return getDueTasks(state);
}







