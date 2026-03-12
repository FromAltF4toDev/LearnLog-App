//Object

export function createSession(state){
    return {
        id: Date.now() + Math.random(),
        topicId: state.activeTopicId,
        startedAt: Date.now(),
        endedAt: null,
        breaks: [],
    };
}

// Session-Logic

function getVisibleSessions(state){
    return state.sessions.filter(function(session){
        return session.topicId=== state.activeTopicId;
    });
}

function getBreakDuration(session){
    if(!Array.isArray(session.breaks)){
        return 0;
    }

    let totalBreakMs= 0;

    for (const pause of session.breaks) {
    if (!pause.startedAt) {
      continue;
    }

    const end = pause.endedAt ?? Date.now();
    totalBreakMs += Math.max(0, end - pause.startedAt);
    }

    return totalBreakMs;
}

function getCompletedTasksCount(state, sessionId) {
    return state.tasks.filter(function (task) {
    return task.sessionId === sessionId && task.finishedAt !== null;
  }).length;
}

//Helper

function formatDateTime(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


/*Rendering*/

export function renderSessionsView(state){
    const tableBody= document.getElementById("sessions-table-body");
    if(!tableBody){
        return;
    }
    tableBody.innerHTML="";
    if(!state.activeTopicId){
        tableBody.innerHTML= `<tr><td colspan="4">No active topic selected.</td></tr>`;
        return;
    }

     const visibleSessions = getVisibleSessions(state);

    if (visibleSessions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="4">No sessions for this topic yet.</td></tr>`;
        return;
    }

    for(const session of visibleSessions){
        const row= document.createElement("tr");
        
        const startedAtCell= document.createElement("td");
        startedAtCell.textContent= formatDateTime(session.startedAt);

        const endedAtCell= document.createElement("td");
        if(session.endedAt){
            endedAtCell.textContent= formatDateTime(session.endedAt);
        }
        else{
            endedAtCell.textContent="Still running.";
        }

        const breakDurationCell= document.createElement("td");
        breakDurationCell.textContent= formatDuration(getBreakDuration(session));

       const completedTaskCell = document.createElement("td");

        const finishedTasks = state.tasks.filter(function(task) {
            return task.sessionId === session.id && task.finishedAt;
        });

        const taskNames = finishedTasks.map(function(task) {
            return task.name;
        });

        if (taskNames.length === 0) {
            completedTaskCell.textContent = "-";
        } 
        else {
            completedTaskCell.textContent = taskNames.join(", ");
        }

        row.appendChild(startedAtCell);
        row.appendChild(endedAtCell);
        row.appendChild(breakDurationCell);
        row.appendChild(completedTaskCell);

        tableBody.appendChild(row);


    }
}