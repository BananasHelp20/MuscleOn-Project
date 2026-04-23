let tasks = [
    "verify Email upon signining up",
    "About Page",
    "delete Exercise",
    "edit Exercise",
    "display data how it should be",
    "add Preset Plans",
    "Style/layout for tablets/phones",
    "live graph",
    "finish todo list :pray:",
];

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