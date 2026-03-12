import { saveState } from "../storage.js";
import { renderApp } from "../app.js";

export function mountNotesView(state){
    bindNoteControls(state);
}



function getNoteInput(){
    const nameInput= document.getElementById("note-name-input");
    const noteInput= document.getElementById("note-input");

    const title= nameInput.value.trim();
    const text= noteInput.value.trim();

    if(!title){
        NoteError("Missing title. Please enter a title.");
        return null;
    }

    if(!text){
        NoteError("Missing text. Please enter a text.");
        return null;
    }

    if(!text && !title){
        NoteError("Missing title and missing text. Please enter title and text.");
        return null;
    }

    return{
        title,
        text
    }
}

function createNote(state,input){
    return{
        id: Date.now() + Math.random(),
        topicId: state.activeTopicId,
        title: input.title,
        text: input.text,
        createdAt: Date.now()
    }
}

function bindNoteControls(state){
    const form= document.getElementById("note-form");
    if(!form){
        return;
    }
    form.addEventListener("submit", function(e){
        e.preventDefault();
        if(!state.activeTopicId){
            return;
        }
        const input= getNoteInput();
        if(!input){
            return;
        }

        const note= createNote(state,input);
        state.notes.push(note)
        saveState(state);
        form.reset();
        renderApp();
    });
}

function getVisibleNotes(state){
    return state.notes.filter(function(note){
        return note.topicId=== state.activeTopicId;
    });
}

export function renderNotesView(state){
    const tableBody= document.getElementById("notes-table-body");
    if(!tableBody){
        return;
    }
    tableBody.innerHTML="";
    if(!state.activeTopicId){
        tableBody.innerHTML= `<tr><td colspan="3">No active topic selected.</td></tr>`;
        return;
    }

     const visibleNotes = getVisibleNotes(state);

    if (visibleNotes.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3">No notes for this topic yet.</td></tr>`;
        return;
    }

    for(const note of visibleNotes){
        const row= document.createElement("tr");
        
        const titleCell= document.createElement("td");
        titleCell.textContent= note.title;

        const createdAtCell= document.createElement("td");
        createdAtCell.textContent= new Date(note.createdAt).toLocaleString();

        const textCell= document.createElement("td");
        textCell.textContent= note.text;

      


        row.appendChild(titleCell);
        row.appendChild(createdAtCell);
        row.appendChild(textCell);

        tableBody.appendChild(row);


    }
}


 function NoteError(error){
    const output= document.getElementById("note-error");
    output.textContent= error;
}


export function clearNoteError() {
  const errorBox = document.getElementById("note-error");

  if (!errorBox) {
    return;
  }

  errorBox.textContent = "";
}