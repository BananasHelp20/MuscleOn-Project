/**
 * dev.js is fürn devmode, oiso grundsätzlich wos temporäres.
 */
let generalTasks = [];

let noahTasks = [];

let tobiTasks = [];

let checkListener = () => { //zum testen
        
}

let tasks = [];

//added olle tasks vom task array in des todo display auf da Hauptseite. (wos ma nur mitn devmode siagt)
function addAllTasks(allTasks) {
    let tasks = allTasks;
    let features = document.getElementById("devLists");
    if (!features) return;
    features.innerHTML = "";
    for (let j = 0; j < tasks.length; j++) {
        let header = document.createElement("h3");
        header.innerHTML = getHeader(j);
        let list = document.createElement("ul");
        for (let i = 0; i < tasks[j].length; i++) {
            let box = document.createElement("input");
            box.setAttribute("type", "checkbox");
            box.addEventListener("click", (event) => {
                // tasks.splice(tasks.indexOf(event.target.parentElement.children.item(0).innerText), 1);
                deleteTask(event.target.parentElement.children.item(0).innerText);
                event.target.parentElement.remove();
            });
            let text = document.createElement("span");
            text.innerText = tasks[j][i] + " ";
            let elem = document.createElement("li");
            elem.appendChild(text);
            elem.appendChild(box);
            list.appendChild(elem)
        }
        if (tasks[j].length != 0) {
            if (j != 0) features.appendChild(document.createElement("br"));
            features.appendChild(header);
            features.appendChild(list);
        }
    }
}

function getHeader(j) {
    switch(j) {
        case 0: return "Willi Tasks"; 
        case 1: return "Noah Tasks"; 
        case 2: return "Tobi Tasks"; 
        default: return "general Tasks"
    }
}

function deleteTask(task) {
    task = task.trim();
    console.log(tasks);
    if (tasks.length == 0) return;
    if (tasks[0].indexOf(task) != -1) {
        tasks[0].splice(tasks[0].indexOf(task), 1);
    } else if (tasks[1].indexOf(task) != -1) {
        tasks[1].splice(tasks[1].indexOf(task), 1);
    } else if (tasks[2].indexOf(task) != -1) {
        tasks[2].splice(tasks[2].indexOf(task), 1);
    }
    saveTasks(tasks);
}

function initializeDevMode() {
    if (!document.getElementById("dev")) return;
    let on = getSettingsFromLocalStorage().devMode;
    let devModeSwitch = document.getElementById("dev");
    devModeSwitch.innerText = on ? "devmode" : "usermode";

    devModeSwitch.addEventListener("click", () => {
        let settings = getSettingsFromLocalStorage();
        settings.devMode = !settings.devMode;
        devModeSwitch.innerText = settings.devMode ? "devmode" : "usermode";
        setUserSettings(settings);
    });
}