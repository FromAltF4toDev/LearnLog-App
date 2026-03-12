import { saveState } from "../storage.js";
import { renderApp } from "../app.js";

export function mountLinksView(state){
    bindLinkControls(state);
}



function getLinkInput(){
    const nameInput= document.getElementById("link-name-input");
    const urlInput= document.getElementById("link-input");

    const title= nameInput.value.trim();
    let url= urlInput.value.trim();

    if(!title){
        LinkError("Missing title. Please enter a title.");
        return null;
    }

    if(!url){
        LinkError("Missing link. Please enter a link.");
        return null;
    }

    if(!title && !url){
        LinkError("Missing title and missing url. Please enter title and text.");
        return null;
    }

    if (!url.startsWith("http")) {
        url = "https://" + url;
    }

    return{
        title,
        url
    }
}

function createLink(state,input){
    return{
        id: Date.now() + Math.random(),
        topicId: state.activeTopicId,
        title: input.title,
        url: input.url,
        createdAt: Date.now()
    }
}

function bindLinkControls(state){
    const form= document.getElementById("link-form");
    if(!form){
        return;
    }
    form.addEventListener("submit", function(e){
        e.preventDefault();
        if(!state.activeTopicId){
            return;
        }
        const input= getLinkInput();
        if(!input){
            return;
        }

        const link= createLink(state,input);
        state.links.push(link)
        saveState(state);
        form.reset();
        renderApp();
    });
}

function getVisibleLinks(state){
    return state.links.filter(function(link){
        return link.topicId=== state.activeTopicId;
    });
}

export function renderLinksView(state){
    const tableBody= document.getElementById("links-table-body");
    if(!tableBody){
        return;
    }
    tableBody.innerHTML="";
    if(!state.activeTopicId){
        tableBody.innerHTML= `<tr><td colspan="3">No active topic selected.</td></tr>`;
        return;
    }

     const visibleLinks = getVisibleLinks(state);

    if (visibleLinks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="3">No links for this topic yet.</td></tr>`;
        return;
    }

    for(const linkItem of visibleLinks){
        const row= document.createElement("tr");
        
        const titleCell= document.createElement("td");
        titleCell.textContent= linkItem.title;

        const createdAtCell= document.createElement("td");
        createdAtCell.textContent= new Date(linkItem.createdAt).toLocaleString();

        const linkCell= document.createElement("td");
        
        const anchor= document.createElement("a");
        anchor.href= linkItem.url;
        anchor.textContent= linkItem.url;
        anchor.target="_blank";
        anchor.rel = "noopener noreferrer";

        
        linkCell.appendChild(anchor);

      


        row.appendChild(titleCell);
        row.appendChild(createdAtCell);
        row.appendChild(linkCell);

        tableBody.appendChild(row);


    }
}


 function LinkError(error){
    const output= document.getElementById("link-error");
    output.textContent= error;
}


export function clearLinkError() {
  const errorBox = document.getElementById("link-error");

  if (!errorBox) {
    return;
  }

  errorBox.textContent = "";
}