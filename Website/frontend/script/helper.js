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
    elem.add(new Option("Choose an exercise", ""));
    const sources = [
        ["Supported exercises", "s", getSupportedExercisesFromLS()],
        ["Unsupported exercises", "u", getUnsupportedExercisesFromLS()],
        ["Own exercises", "d", getUserdefinedExercisesFromLS()]
    ];
    for (const [label, prefix, exercises] of sources) {
        if (!exercises.length) continue;
        const group = document.createElement("optgroup");
        group.label = label;
        for (const exercise of [...exercises].sort((a, b) => a.name.localeCompare(b.name))) {
            const option = new Option(exercise.name, prefix + exercise.name);
            option.dataset.exercise = JSON.stringify(exercise);
            group.appendChild(option);
        }
        elem.add(group);
    }
}

function getExerciseFromOption(option) {
    if (!option) return null;
    try {
        if (option.dataset.exercise) return JSON.parse(option.dataset.exercise);
    } catch (_) { /* Use the current exercise list below. */ }
    return getExerciseWithId(option.value);
}

function makeExercisePicker(select) {
    const picker = document.createElement("div");
    picker.className = "exercise-picker";
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "exercise-picker-trigger";
    trigger.setAttribute("aria-label", "Choose an exercise");
    trigger.setAttribute("aria-expanded", "false");
    const triggerLabel = document.createElement("span");
    triggerLabel.className = "exercise-picker-trigger-label";
    const chevron = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    chevron.classList.add("exercise-picker-chevron");
    chevron.setAttribute("viewBox", "0 0 20 20");
    chevron.setAttribute("fill", "none");
    chevron.setAttribute("aria-hidden", "true");
    const chevronPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    chevronPath.setAttribute("d", "m4.5 7.5 5.5 5 5.5-5");
    chevronPath.setAttribute("stroke", "currentColor");
    chevronPath.setAttribute("stroke-width", "1.8");
    chevronPath.setAttribute("stroke-linecap", "round");
    chevronPath.setAttribute("stroke-linejoin", "round");
    chevron.appendChild(chevronPath);
    trigger.append(triggerLabel, chevron);
    const panel = document.createElement("div");
    panel.className = "exercise-picker-panel";
    panel.hidden = true;
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search";
    search.setAttribute("aria-label", "Search exercises");
    const results = document.createElement("div");
    results.className = "exercise-picker-results";
    panel.append(search, results);
    select.classList.add("exercise-picker-value");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    picker.append(select, trigger, panel);

    function updateTrigger() {
        triggerLabel.textContent = select.value ? select.selectedOptions[0].textContent : "Choose an exercise";
        trigger.classList.toggle("is-placeholder", !select.value);
    }
    function close() {
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        search.value = "";
    }
    function renderResults() {
        results.replaceChildren();
        const query = search.value.trim().toLocaleLowerCase();
        let count = 0;
        for (const group of select.querySelectorAll("optgroup")) {
            const matches = [...group.querySelectorAll("option")].filter(option => {
                const exercise = getExerciseFromOption(option);
                return `${option.textContent} ${exercise?.targetedMuscleGroups?.join(" ") || ""} ${group.label}`.toLocaleLowerCase().includes(query);
            });
            if (!matches.length) continue;
            const heading = document.createElement("div");
            heading.className = "exercise-picker-group";
            heading.textContent = group.label;
            results.appendChild(heading);
            for (const option of matches) {
                const exercise = getExerciseFromOption(option);
                const item = document.createElement("button");
                item.type = "button";
                item.className = "exercise-picker-option";
                item.classList.toggle("is-selected", option.value === select.value);
                const name = document.createElement("span");
                name.textContent = option.textContent;
                const meta = document.createElement("small");
                meta.textContent = exercise?.targetedMuscleGroups?.join(", ") || "";
                item.append(name, meta);
                item.addEventListener("click", () => {
                    select.value = option.value;
                    select.dispatchEvent(new Event("change", { bubbles: true }));
                    close();
                    trigger.focus();
                });
                results.appendChild(item);
                count++;
            }
        }
        if (!count) {
            const empty = document.createElement("p");
            empty.className = "exercise-picker-empty";
            empty.textContent = "No matching exercises";
            results.appendChild(empty);
        }
    }
    trigger.addEventListener("click", () => {
        const opening = panel.hidden;
        document.querySelectorAll(".exercise-picker-panel:not([hidden])").forEach(other => {
            other.hidden = true;
            other.parentElement.querySelector(".exercise-picker-trigger").setAttribute("aria-expanded", "false");
        });
        panel.hidden = !opening;
        trigger.setAttribute("aria-expanded", String(opening));
        if (opening) {
            if (!select.querySelector("optgroup")) {
                const selectedValue = select.value;
                const selectedOption = select.selectedOptions[0]?.cloneNode(true);
                select.replaceChildren();
                setExerciseOptions(select);
                if (selectedValue && ![...select.options].some(option => option.value === selectedValue) && selectedOption) select.add(selectedOption);
                if (selectedValue) select.value = selectedValue;
                updateTrigger();
            }
            renderResults();
            search.focus();
        }
    });
    search.addEventListener("input", renderResults);
    picker.addEventListener("keydown", event => {
        if (event.key === "Escape") { close(); trigger.focus(); }
        if (event.key === "Enter" && document.activeElement === search) {
            event.preventDefault();
            results.querySelector(".exercise-picker-option")?.click();
        }
    });
    document.addEventListener("click", event => { if (!picker.contains(event.target)) close(); });
    select.addEventListener("change", updateTrigger);
    updateTrigger();
    return picker;
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

function setSelectedExercise(elem) {
    const row = elem.closest("tr");
    const exercise = getExerciseFromOption(elem.selectedOptions[0]);
    row.cells[1].textContent = exercise ? (exercise.equipment || "None") : "—";
    row.cells[4].replaceChildren();
    if (!exercise) {
        row.cells[4].textContent = "—";
    } else if (exercise.weight) {
        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.step = "any";
        input.placeholder = "15";
        input.id = "weight" + row.id;
        input.setAttribute("aria-label", "Weight");
        row.cells[4].appendChild(input);
    } else {
        row.cells[4].textContent = "–";
    }
}

function getIndexOfName(array, name) {
    for (let i = 0; i < array.length; i++) {
        if (array[i].name == name) return i;
    }
    return -1;
}

function updateExerciseRowNumbers(tbody) {
    [...tbody.rows].forEach((row, index) => { row.dataset.order = String(index + 1); });
}

function formatExerciseSessionHeading(day, from, to) {
    return `${day || "New day"}${from && to ? ` · ${from}–${to}` : ""}`;
}

function updateExerciseTableHeading(sessionId) {
    const row = document.getElementById(String(sessionId));
    const table = document.getElementById("exercise-table" + sessionId)?.closest("table");
    if (!row || !table) return;
    table.querySelector("thead th").textContent = formatExerciseSessionHeading(
        row.cells[0].querySelector("select").value,
        row.cells[1].querySelector("input").value,
        row.cells[2].querySelector("input").value
    );
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
    mainTh.textContent = formatExerciseSessionHeading(time.times.weekday, time.times.fromTime, time.times.toTime);
    mainTh.setAttribute("colspan", ths.length);

    let addButton = document.createElement("button");
    addButton.setAttribute("class", "tableButton add-exercise-button");
    addButton.type = "button";
    addButton.innerText = "+ Add exercise";

    addButton.addEventListener("click", (event) => {
        const tbody = event.target.closest("table").tBodies[0];
        let tr = document.createElement("tr");
        let rowNumber = tbody.rows.length;
        while (document.getElementById("exercise-" + time.sessionId + "-" + rowNumber)) rowNumber++;
        tr.id = "exercise-" + time.sessionId + "-" + rowNumber;
        let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
        let inputs = [document.createElement("input"), document.createElement("input"), document.createElement("input")];

        let select = document.createElement("select");
        setExerciseOptions(select);
        select.addEventListener("change", (event) => {
            setSelectedExercise(event.target);
        });
        tds[0].appendChild(makeExercisePicker(select));

        tds[1].innerText = "—";

        inputs[0].setAttribute("id", "reps" + tr.getAttribute("id"));
        inputs[0].type = "number";
        inputs[0].min = "1";
        inputs[0].step = "1";
        inputs[0].setAttribute("aria-label", "Reps");
        inputs[0].value = "5";
        tds[2].appendChild(inputs[0]);

        inputs[1].setAttribute("id", "sets" + tr.getAttribute("id"));
        inputs[1].type = "number";
        inputs[1].min = "1";
        inputs[1].step = "1";
        inputs[1].setAttribute("aria-label", "Sets");
        inputs[1].value = "3";
        tds[3].appendChild(inputs[1]);

        tds[4].innerText = "—";

        let delButton = document.createElement("button");
        delButton.setAttribute("class", "tableButton");
        delButton.setAttribute("id", "delete-exercise");
        delButton.innerText = "Remove";
        delButton.addEventListener("click", (event) => {
            const row = event.target.closest("tr");
            const body = row.parentElement;
            const table = body.parentElement;
            row.remove();
            if (!body.rows.length) {
                const sessionId = body.id.replace("exercise-table", "");
                table.remove();
                const control = document.getElementById(sessionId)?.querySelector("#exercise-controlButton");
                if (control) {
                    control.innerText = "Add exercises";
                    control.classList.remove("is-destructive");
                }
                if (!document.querySelector("#exercise-tables table")) document.getElementById("exercise-tables").hidden = true;
            } else {
                updateExerciseRowNumbers(body);
            }
        });
        tds[5].setAttribute("class", "tableButtonContainer");
        tds[5].appendChild(delButton);

        tds.forEach((td) => {
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
        updateExerciseRowNumbers(tbody);
        tr.scrollIntoView({ behavior: "auto", block: "nearest" });
        requestAnimationFrame(() => { if (tr.isConnected) tr.querySelector(".exercise-picker-trigger").click(); });
    });

    let headerRow = document.createElement("tr");
    headerRow.appendChild(mainTh);
    const clearCell = document.createElement("th");
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "tableButton clear-exercises-button";
    clearButton.innerText = "Clear exercises";
    clearButton.addEventListener("click", () => removeExercises(time.sessionId));
    clearCell.appendChild(clearButton);
    headerRow.appendChild(clearCell);

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

    const footer = document.createElement("tfoot");
    const footerRow = document.createElement("tr");
    const footerCell = document.createElement("td");
    footerCell.colSpan = ths.length;
    footerCell.appendChild(addButton);
    footerRow.appendChild(footerCell);
    footer.appendChild(footerRow);
    table.appendChild(footer);

    return table;
}

function getSessionTimes() {
    if (!document.getElementById("plan-table") || !document.getElementById("exercise-tables")) return;
    const sessions = [];
    for (const row of document.getElementById("plan-table").rows) {
        const sessionId = row.id;
        const exerciseRows = document.getElementById("exercise-table" + sessionId)?.rows || [];
        const exercises = [];

        for (const exerciseRow of exerciseRows) {
            const select = exerciseRow.cells[0].querySelector("select");
            const selected = select.value;
            const exercise = getExerciseFromOption(select.selectedOptions[0]);
            if (!exercise) return null;
            exercises.push({
                exerciseType: selected[0] == "s" ? "supported" : selected[0] == "u" ? "unsupported" : "defined-by-user",
                name: exercise.name,
                targetedMuscleGroups: exercise.targetedMuscleGroups,
                equipment: exercise.equipment || "None",
                reps: exerciseRow.cells[2].querySelector("input").value,
                sets: exerciseRow.cells[3].querySelector("input").value,
                weight: exerciseRow.cells[4].querySelector("input")?.value || null
            });
        }

        sessions.push({
            sessionId,
            primaryMuscleGroup: row.cells[3].querySelector("select").value,
            exercises,
            times: {
                weekday: row.cells[0].querySelector("select, input").value,
                fromTime: row.cells[1].querySelector("input").value,
                toTime: row.cells[2].querySelector("input").value
            }
        });
    }
    return sessions;
}

function getIndexOfSessionId(id) {
    let exerciseTables = document.getElementById("exercise-tables");
    for (let i = 1; i < exerciseTables.children.length; i++) { //1 weils jo überschrift a gibt
        let table = exerciseTables.children.item(i);
        let tbodyIndex;
        for (let j = 0; j < table.children.length; j++) {
            if (table.children.item(j).getAttribute("id")) tbodyIndex = j;
        }
        if (id == Number(table.children.item(tbodyIndex).getAttribute("id").replace("exercise-table", ""))) return i;
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
    if (!data || data.length === 0) return false;
    for (let i = 0; i < data.length; i++) {
        let exercises = data[i].exercises ? data[i].exercises : null;
        let time = data[i].times;
        if (!time || !data[i].primaryMuscleGroup || data[i].primaryMuscleGroup == "-1" || data[i].sessionId == -1) {
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
            /^\d{1,2}:\d{2}$/.test(time.fromTime) &&
            /^\d{1,2}:\d{2}$/.test(time.toTime) &&
            Number(time.fromTime.split(":")[0]) < 24 &&
            Number(time.toTime.split(":")[0]) < 24 &&
            Number(time.fromTime.split(":")[1]) < 60 &&
            Number(time.toTime.split(":")[1]) < 60 &&
            (Number(time.fromTime.split(":")[0]) * 60 + Number(time.fromTime.split(":")[1])) <
            (Number(time.toTime.split(":")[0]) * 60 + Number(time.toTime.split(":")[1]))
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
                    typeof exercise.equipment == "string" &&
                    Number(exercise.reps) > 0 &&
                    Number(exercise.sets) > 0 &&
                    Number.isFinite(Number(exercise.reps)) &&
                    Number.isFinite(Number(exercise.sets))
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
