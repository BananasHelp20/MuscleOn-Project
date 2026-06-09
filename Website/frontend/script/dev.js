/**
 * dev.js is fürn devmode, oiso grundsätzlich wos temporäres.
 */
let tasks = [
    "add lightmode style",
    "add Documentary",
    "About Page",
    "add Preset Plans [OPTIONAL]",
    "Style/layout for tablets/phones",
    "display data how it should be [waiting on tobi, der mir erklärt wos wir jetzt wirkli an Daten haum]",
    "display Username in Exerciselist [waiting for database]",
    "verify Email upon signining up [waiting for database]",
    "live graph [waiting for database + connection to esp]",
    "finsish session starting [waiting for database]",
    "finish data transfer [waiting for database]",
    "finish login existence check [waiting for database]",
    "finish signup existence check [waiting for database]",
    "finish loading data to json [waiting for databse]",
    "finish logout saving data [waiting for database]",
    "finish deleting account [waiting for database]",
    "finish creating account [waiting for database]",
    "finish MuscleOn :pray:",
];

let noahTasks = [
    "do database"
];

//added olle tasks vom task array in des todo display auf da Hauptseite.
function addAllTasks(list) {
    let features = document.getElementById("upcomingFeatures");
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