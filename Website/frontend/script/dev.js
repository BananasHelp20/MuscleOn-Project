/**
 * dev.js is fürn devmode, oiso grundsätzlich wos temporäres.
 */
let tasks = [
    "verify Email upon signining up [waiting for database]",
    "About Page",
    "delete/edit Exercise ins backend übertragen",
    "display data how it should be",
    "add Preset Plans",
    "Style/layout for tablets/phones",
    "live graph [waiting for database + connection to esp]",
    "finsish session starting [waiting for database]",
    "finish data transfer [waiting for database]",
    "finish login existence check [waiting for database]",
    "finish signup existence check [waiting for database]",
    "finish loading data to json [waiting for databse]",
    "add lightmode",
    "finish logout saving data [waiting for database]",
    "finish deleting account [waiting for database]",
    "finish creating account [waiting for database]",
    "finish MuscleOn :pray:",
];

//added olle tasks vom task array in des todo display auf da Hauptseite.
function addAllTasks() {
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