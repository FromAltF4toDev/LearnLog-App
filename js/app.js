import { navigate } from "./router.js";
import { loadState, saveState } from "./storage.js";
import {bindTopicSetupForm, checkFirstTopic, renderSetupTopicView ,clearSetupErrorMsg} from "./views/topics.js";
import { mountTimerView, renderTimerView, resetActiveTimer } from "./views/timer.js";
import { mountTaskView, renderTaskView, clearTaskErrorMsg } from "./views/tasks.js";
import { renderDashboardView, mountDashboardView } from "./views/dashboard.js";
import { renderSessionsView } from "./views/sessions.js";
import { mountNotesView, renderNotesView, clearNoteError} from "./views/notes.js";
import { mountLinksView, renderLinksView } from "./views/links.js";


let state= loadState();         // global actual State. load from local Storage

export function renderApp() {
  renderTopicSelect(state);
  renderDashboardView(state);
  renderTaskView(state);
  renderTimerView(state);
  renderSessionsView(state);
  renderNotesView(state);
  renderLinksView(state);
  clearTaskErrorMsg();
  clearNoteError();
}

function bindNavBtns(){         //load nav and buttons + eventlistener
    const addTopicBtn= document.getElementById("add-topic-btn");
    const dashboardMenueBtn= document.getElementById("dashboard-menue-btn");
    const sessionsMenueBtn= document.getElementById("sessions-menue-btn");
    const timerMenueBtn= document.getElementById("timer-menue-btn");
    const tasksMenueBtn= document.getElementById("tasks-menue-btn")
    const notesMenueBtn= document.getElementById("notes-menue-btn");
    const linksMenueBtn= document.getElementById("links-menue-btn");
    const settingsMenueBtn= document.getElementById("settings-menue-btn");

    dashboardMenueBtn.addEventListener("click", ()=>{
        navigate("view-dashboard");
    });

    sessionsMenueBtn.addEventListener("click",()=>{
        navigate("view-sessions");
        renderSessionsView(state);
    });

    timerMenueBtn.addEventListener("click",()=>{
        navigate("view-timer");
        renderTimerView(state);
    });

    tasksMenueBtn.addEventListener("click",()=>{
        navigate("view-tasks");
        renderTaskView(state);
    });

    notesMenueBtn.addEventListener("click",()=>{
        navigate("view-notes");
        renderNotesView(state);
    });

    linksMenueBtn.addEventListener("click",()=>{
        navigate("view-links");
    });



    addTopicBtn.addEventListener("click",()=>{
        navigate("view-setup-topic");
        renderSetupTopicView(state);
        clearSetupErrorMsg();
    });


}



function renderTopicSelect(state){                                           //render which topic is selected
  const select = document.getElementById("topic-select");
  if (!select) return;

  // empty
  select.innerHTML = "";

  // no topics -> disable
  if (state.topics.length === 0) {
    select.disabled = true;
    const opt = document.createElement("option");
    opt.textContent = "No topics yet";
    opt.value = "";
    select.appendChild(opt);
    return;
  }

  select.disabled = false;

  // options
  for (const topic of state.topics) {
    const opt = document.createElement("option");
    opt.value = String(topic.id);
    opt.textContent = topic.name;
    select.appendChild(opt);
  }

  //  set active
  select.value = String(state.activeTopicId ?? state.topics[0].id);
}

function bindTopicSelect(state) {
  const select = document.getElementById("topic-select");
  if (!select) return;

  select.addEventListener("change", () => {
    const newTopicId = Number(select.value);

    if (newTopicId !== state.activeTopicId && state.activeSessionId) {
      resetActiveTimer(state);
    }

    state.activeTopicId = newTopicId;
    saveState(state);
    renderApp();
  });
}





function init() {
    checkFirstTopic(state);

    mountDashboardView(state);
    mountTimerView(state);
    mountTaskView(state);
    mountNotesView(state);
    mountLinksView(state);

    bindTopicSetupForm(state);
    bindTopicSelect(state);
    bindNavBtns();

    renderApp();
}

init();

