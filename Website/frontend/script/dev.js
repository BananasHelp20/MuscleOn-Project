/**
 * dev.js is fürn devmode, oiso grundsätzlich wos temporäres.
 */
let generalTasks = [];

let noahTasks = [];

let tobiTasks = [];

let tasks = [];

//added olle tasks vom task array in des todo display auf da Hauptseite.
function addAllTasks(listElem, tasks) {
    let features = listElem;
    if (!features) return;
    features.innerHTML = "";
    for (let i = 0; i < tasks.length; i++) {
        let box = document.createElement("input");
        box.setAttribute("type", "checkbox");
        box.addEventListener("click", (event) => {
            // tasks.splice(tasks.indexOf(event.target.parentElement.children.item(0).innerText), 1);
            deleteTask(event.target.parentElement.children.item(0).innerText);
            event.target.parentElement.remove();
        });
        let text = document.createElement("span");
        text.innerText = tasks[i] + " ";
        let elem = document.createElement("li");
        elem.appendChild(text);
        elem.appendChild(box);
        features.appendChild(elem);
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