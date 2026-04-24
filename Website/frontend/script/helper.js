function getRealChildren(children) {
    let real = [];
    for (i in children) {
        let child = children.item(i);
        if (child.nodeName != "#text") real.push(child);
    }
    return real;
}

function getRealChildrenWithId(children) {
    let real = [];
    for (i in children) {
        let child = children.item(i);
        if (child.nodeName != "#text" && child.getAttribute("id") != null) real.push(child);
    }
    return real;
}

function getMuscleGroups() {
    return [
        "Chest",
        "Upper Back (Traps & Rhomboids)",
        "Mid-Back (Lats)",
        "Lower Back (Erector Spinae)",
        "Shoulders (Deltoids)",
        "Biceps",
        "Triceps",
        "Core (Abs & Obliques)",
        "Glutes",
        "Quadriceps",
        "Hamstrings",
        "Calves, (Gastrocnemius & Soleus)"
    ]
}

function setMuscleGroupOptions(elem) {
    let muscleGroups = getMuscleGroups();

    let NULL = document.createElement("option");
    NULL.value = -1;
    NULL.label = "Select Muscle Group";
    elem.add(NULL);

    for (let group of muscleGroups) {
        let option = document.createElement("option");
        option.text = group;
        elem.add(option);
    }
}

function setExerciseOptions(elem) {
    let exerciseTypes = [document.createElement("optgroup"), document.createElement("optgroup"), document.createElement("optgroup")];
    exerciseTypes[0].label = "Supported Exercises";
    exerciseTypes[1].label = "Unsupported Exercises";
    exerciseTypes[2].label = "Own Exercises";
    let muscleGroups = getMuscleGroups();

    let NULL = document.createElement("option");
    NULL.value = "Select Exercises";
    NULL.label = "Select Exercises";
    elem.add(NULL);

    let exercises = [getSupportedExercisesFromLS(), getUnsupportedExercisesFromLS(), getUserdefinedExercisesFromLS()]
    let prefixes = ["s", "u", "d"];

    for (let k = 0; k < exercises.length; k++) { //des wor fü denkoabeit
        if (exercises[k].length > 0) {
            elem.add(exerciseTypes[k]);
            for (let i = 0; i < muscleGroups.length; i++) {
                let options = [];
                for (let j = 0; j < exercises[k].length; j++) {
                    if (exercises[k][j].targetedMuscleGroups.includes(muscleGroups[i])) {
                        let opt = document.createElement("option");
                        opt.label = exercises[k][j].name;
                        opt.value = prefixes[k] + exercises[k][j].name;
                        options.push(opt);
                    }
                }
                if (options.length > 0) {
                    let optGr = document.createElement("optgroup");
                    optGr.label = muscleGroups[i];
                    elem.add(optGr);
                    options.forEach((opt) => {
                        elem.add(opt);
                    })
                }
            }
        }
    }
}

function getFreeSessionId() {
    let ids = [];
    let table = document.getElementById("plan-table");
    let id = 0;

    if (table.children.length != 0) {
        for (let i = 0; i < table.children.length; i++) {
            let row = table.children.item(i);
            ids.push(Number(row.getAttribute("id")));
        }
        ids.sort();
    }

    for (let i = 1; i <= 2000000 && ids.includes(id); i++) {
        id = i;
    }

    if (id > 2000000) {
        alert("you can only have 2,000,000 Sessions! (if you see this, you're absolutely based)");
        return null;
    }
    return id == -1 ? null : id;
}

function findExerciseTableById(sessionId) {
    for (let i = 1; i < document.getElementById("exercise-tables").children.length; i++) {
        let tbodyIndex = 1;
        for (let j = 0; j < document.getElementById("exercise-tables").children.item(i).children.length; j++) {
            if (document.getElementById("exercise-tables").children.item(i).children.item(j).getAttribute("id")) tbodyIndex = j;
        }
        if (document.getElementById("exercise-tables").children.item(i).children.item(tbodyIndex).getAttribute("id") == "exercise-table" + sessionId) return i;
    }
    return -1;
}

function findTimeTableById(sessionId) {
    for (let i = 0; i < document.getElementById("plan-table").children.length; i++) {
        if (document.getElementById("plan-table").children.item(i).getAttribute("id") == "" + sessionId) return i;
    }
    return -1;
}

function initSelectExercise(elem, id, data) {
    elem.parentElement.parentElement.children.item(1).innerText = data[id].equipment;
    elem.parentElement.parentElement.children.item(4).innerHTML = "";
    if (data[id].weight == true) {
        let input = document.createElement("input");
        input.placeholder = "15";
        input.id = "weight" + elem.parentElement.parentElement.getAttribute("id");
        elem.parentElement.parentElement.children.item(4).appendChild(input);
    } else {
        elem.parentElement.parentElement.children.item(4).innerHTML = " - ";
    }
}

function setSelectedExercise(elem) {
    let id = elem.value;
    if (id.startsWith("s")) {
        id = id.substring(1);
        getSupportedExercises().then(data => {
            initSelectExercise(elem, getIndexOfName(data, id), data);
        });
    } else if (id.startsWith("u")) {
        id = id.substring(1);
        getUnsupportedExercises().then(data => {
            initSelectExercise(elem, getIndexOfName(data, id), data);
        });
    } else { //starts with d
        id = id.substring(1);
        getUserDefinedExercises().then(data => {
            initSelectExercise(elem, getIndexOfName(data, id), data);
        });
    }
}

function getIndexOfName(array, name) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].name == name) return i;
    }
    return -1;
}

function getEmptyExerciseTable(time) {
    let table = document.createElement("table");
    let ths = [document.createElement("th"), document.createElement("th"), document.createElement("th"), document.createElement("th"), document.createElement("th"), document.createElement("th")];

    ths[0].innerText = "Exercise";
    ths[1].innerText = "Required Equipment";
    ths[2].innerText = "Reps";
    ths[3].innerText = "Sets";
    ths[4].innerText = "Weight";
    ths[5].innerHTML = "&emsp;";

    let mainTh = document.createElement("th");
    mainTh.innerHTML = "<span>Session: " + time.times.weekday + "</span><span> from " + time.times.fromTime + "</span><span> to " + time.times.toTime + "</span>";
    mainTh.setAttribute("colspan", ths.length - 1);

    let addButton = document.createElement("button");
    addButton.setAttribute("class", "tableButton");
    addButton.innerText = "Add new Exercise";

    addButton.addEventListener("click", (event) => {
        let tr = document.createElement("tr");
        tr.setAttribute("id", event.target.parentElement.parentElement.parentElement.children.length);
        let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
        let inputs = [document.createElement("input"), document.createElement("input"), document.createElement("input")];

        let select = document.createElement("select");
        setExerciseOptions(select);
        select.addEventListener("change", (event) => {
            setSelectedExercise(event.target);
        });
        select.value = "Select Exercise";
        tds[0].appendChild(select);

        tds[1].innerText = "No Exercise Selected";

        inputs[0].setAttribute("id", "reps" + tr.getAttribute("id"));
        inputs[0].placeholder = 5;
        tds[2].appendChild(inputs[0]);

        inputs[1].setAttribute("id", "sets" + tr.getAttribute("id"));
        inputs[1].placeholder = 3;
        tds[3].appendChild(inputs[1]);

        tds[4].innerText = "No Exercise Selected"

        let delButton = document.createElement("button");
        delButton.setAttribute("class", "tableButton");
        delButton.setAttribute("id", "delete-exercise");
        delButton.innerText = "remove exercise";
        delButton.addEventListener("click", (event) => {
            if (event.target.parentElement.parentElement.parentElement.children.length > 1) event.target.parentElement.parentElement.remove();
            if (event.target.parentElement.parentElement.parentElement.children.length <= 1) event.target.parentElement.parentElement.parentElement.parentElement.remove();
        });
        tds[5].setAttribute("class", "tableButtonContainer");
        tds[5].appendChild(delButton);

        tds.forEach((td) => {
            tr.appendChild(td);
        });
        event.target.parentElement.parentElement.parentElement.parentElement.children.item(1).appendChild(tr);
    });

    let addButtonTh = document.createElement("th");
    addButtonTh.setAttribute("class", "tableButtonContainer");
    addButtonTh.appendChild(addButton);

    let headerRow = document.createElement("tr");
    headerRow.appendChild(mainTh);
    headerRow.appendChild(addButtonTh);

    let headersRow = document.createElement("tr");
    ths.forEach((th) => {
        headersRow.appendChild(th);
    })

    let thead = document.createElement("thead");
    thead.appendChild(headerRow);
    thead.appendChild(headersRow);

    table.appendChild(thead);
    if (!time.primaryMuscleGroup) {
        let tbody = document.createElement("tbody");
        tbody.setAttribute("id", "exercise-table" + time.sessionId);
        table.appendChild(tbody);
    }

    return table;
}

function getSessionTimes() {
    if (!document.getElementById("plan-table") || !document.getElementById("exercise-tables")) return;

    let table = document.getElementById("plan-table");
    let exerciseTables = document.getElementById("exercise-tables");
    let plan = []
    let plantime = [];
    let primaryMuscleGroups = [];
    let exercises = [[]];
    let ids = [];

    for (let i = 0; i < table.children.length; i++) {
        ids.push(table.children.item(i).getAttribute("id"));
        for (let j = 0; j < table.children.item(i).children.length; j++) {
            let row = table.children.item(i).children.item(j).children.item(0);
            if (row.getAttribute("id") != null && row.getAttribute("type") != null && row.nodeName != "SELECT") {
                plantime.push(row.value);
            }
            if (row.getAttribute("id") != null && row.nodeName == "SELECT") {
                primaryMuscleGroups.push(row.value);
            }
        }
        plan.push(plantime);
        plantime = [];
    }

    for (let i = 0; i < exerciseTables.children.length; i++) {
        let tbodyIndex = 1;
        if (exerciseTables.children.item(i).nodeName == "TABLE") {
            for (let j = 0; j < exerciseTables.children.item(i).children.length; j++) { //tables durchgeh
                if (exerciseTables.children.item(i).children.item(j).getAttribute("id")) tbodyIndex = j;
            }
            for (let j = 0; j < exerciseTables.children.item(i).children.item(tbodyIndex).children.length; j++) { //rows durchgehen
                let row = exerciseTables.children.item(i).children.item(tbodyIndex).children.item(j);
                let allExercises = [];
                let thisExercise;
                if (row.children.item(0).children.item(0).value.charAt(0) == "s") {
                    allExercises = getSupportedExercisesFromLS();
                    thisExercise = allExercises[getIndexOfName(allExercises, row.children.item(0).children.item(0).value.substring(1))];
                } else if (row.children.item(0).children.item(0).value.charAt(0) == "u") {
                    allExercises = getUnsupportedExercisesFromLS();
                    thisExercise = allExercises[getIndexOfName(allExercises, row.children.item(0).children.item(0).value.substring(1))];
                } else {
                    allExercises = getUserdefinedExercisesFromLS();
                    thisExercise = allExercises[getIndexOfName(allExercises, row.children.item(0).children.item(0).value.substring(1))];
                }
                if (!exercises[i]) exercises.push([]);
                if (!thisExercise) return null;
                exercises[i].push({
                    exerciseType: row.children.item(0).children.item(0).value.charAt(0) == "s" ? "supported" : row.children.item(0).children.item(0).value.charAt(0) == "u" ? "unsupported" : "defined-by-user",
                    name: thisExercise.name,
                    targetedMuscleGroups: thisExercise.targetedMuscleGroups,
                    equipment: thisExercise.equipment,
                    reps: row.children.item(2).children.item(0).value,
                    sets: row.children.item(3).children.item(0).value,
                    weight: (row.children.item(4).children.item(0)) ? row.children.item(4).children.item(0).value : null
                });
            }
        }
    }
    let plantimeObjects = [];
    for (let index = 0; index < plan.length; index++) {
        let time = plan[index];
        let object = {
            sessionId: ids[index],
            primaryMuscleGroup: primaryMuscleGroups[index],
            exercises: exercises[getIndexOfSessionId(ids[index])] != null ? exercises[getIndexOfSessionId(ids[index])] : [], //des mit da id is so a gschicht, finde de exercisetabelle mit da passenden id, und füg de daten davon ein
            times: {
                weekday: time[0],
                fromTime: time[1],
                toTime: time[2]
            }
        };
        plantimeObjects.push(object);
    }
    return plantimeObjects; //geht
}

function getIndexOfSessionId(id) {
    let exerciseTables = document.getElementById("exercise-tables");
    for (let i = 1; i < exerciseTables.children.length; i++) { //1 weils jo überschrift a gibt
        let table = exerciseTables.children.item(i);
        let tbodyIndex;
        for (let j = 0; j < table.children.length; j++) {
            if (table.children.item(j).getAttribute("id")) tbodyIndex = j;
        }
        if (id == Number(table.children.item(tbodyIndex).getAttribute("id").charAt(table.children.item(tbodyIndex).getAttribute("id").length - 1))) return i;
    }
    return -1;
}

function getExerciseWithId(id) {
    let exercises;
    if (id.startsWith("s")) {
        id = id.substring(1);
        exercises = getSupportedExercisesFromLS();
        for (let i = 0; i < exercises.length; i++) {
            if (id == exercises[i].name) {
                return exercises[i];
            }
        }
    } else if (id.startsWith("u")) {
        id = id.substring(1);
        exercises = getUnsupportedExercisesFromLS();
        for (let i = 0; i < exercises.length; i++) {
            if (id == exercises[i].name) {
                return exercises[i];
            }
        }
    } else {
        id = id.substring(1);
        exercises = getUserdefinedExercisesFromLS();
        for (let i = 0; i < exercises.length; i++) {
            if (id == exercises[i].name) {
                return exercises[i];
            }
        }
    }
    return null;
}

function validateSessionTimes(data) {
    if (!data) return false;
    for (let i = 0; i < data.length; i++) {
        let exercises = data[i].exercies ? data[i].exercises : null;
        let time = data[i].times;
        if (!time || data[i].primaryMuscleGroup == "" || data[i].sessionId == -1) {
            console.error("if 1");
            return false;
        }
        if (!(
            time.weekday &&
            (
                time.weekday == "Montag" || time.weekday == "Monday" ||
                time.weekday == "Dienstag" || time.weekday == "Tuesday" ||
                time.weekday == "Mittwoch" || time.weekday == "Wednesday" ||
                time.weekday == "Donnerstag" || time.weekday == "Thursday" ||
                time.weekday == "Freitag" || time.weekday == "Friday" ||
                time.weekday == "Samstag" || time.weekday == "Saturday" ||
                time.weekday == "Sonntag" || time.weekday == "Sunday"
            ) &&
            time.fromTime &&
            (
                time.fromTime.length == 5 || time.fromTime.length == 4
            ) &&
            time.toTime &&
            (
                time.toTime.length == 5 || time.toTime.length == 4
            )
        )) {
            console.error("if 2");
            return false;
        }
        if (exercises) {
            for (let exercise of exercises) {
                if (!(
                    exercise.exerciseType &&
                    exercise.name &&
                    exercise.targetedMuscleGroups &&
                    exercise.targetedMuscleGroups.length != 0 &&
                    exercise.equipment &&
                    exercise.reps &&
                    exercise.sets &&
                    !isNaN(Number(exercise.reps)) &&
                    !isNaN(Number(exercise.sets)) &&
                    exercise.reps != "" &&
                    exercise.sets != ""
                )) {
                    console.error("if 3 (" + exercise + ")");
                    return false;
                }
            }
        }
    }
    return true;
}

function log(string) { //für devmode
    if (getSettingsFromLocalStorage().devMode) console.log(string);
}