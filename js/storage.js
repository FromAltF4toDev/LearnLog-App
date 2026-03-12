import { getDefaultState } from "./state.js";

export function saveState (state){                                       // state => JSON => localStorage
          
     localStorage.setItem("state",JSON.stringify(state));
}

export function loadState(){
  const raw = localStorage.getItem("state");
  if(!raw) return getDefaultState();

  try{
    const parsed = JSON.parse(raw);
    if(!parsed || typeof parsed !== "object") return getDefaultState();
    return parsed;
  }catch{
    return getDefaultState();
  }
}