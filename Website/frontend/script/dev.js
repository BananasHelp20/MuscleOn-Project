/**
 * dev.js is fürn devmode, oiso grundsätzlich wos temporäres.
 */
let generalTasks = [];

let noahTasks = [];

let tobiTasks = [];

//added olle tasks vom task array in des todo display auf da Hauptseite.
function addAllTasks(listElem, tasks) {
    let features = listElem;
    if (!features) return;
    features.innerHTML = "";
    for (let i = 0; i < tasks.length; i++) {
        let box = document.createElement("input");
        box.setAttribute("type", "checkbox");
        box.addEventListener("click", (event) => {
            tasks.splice(tasks.indexOf(event.target.parentElement.children.item(0).innerText), 1);
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