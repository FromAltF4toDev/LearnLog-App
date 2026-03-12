export function navigate(sectionID){
    const sections= document.querySelectorAll(".view-section");
    sections.forEach(section =>{ 
        section.classList.remove("active");
    });
    const target= document.getElementById(sectionID);
    if(!target){
        return;
    }
    target.classList.add("active");
}

