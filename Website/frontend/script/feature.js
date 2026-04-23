function addExercises(sessionId) {
    document.getElementById("exercise-tables").hidden = false;
    let foundIndex = findTimeTableById(sessionId);
    if (foundIndex == -1) {
        log("something went wrong: " + foundIndex);
        return;
    }
    let row = document.getElementById("plan-table").children.item(foundIndex);
    let times = {
        sessionId: sessionId,
        times: {
            weekday: row.children.item(0).children.item(0).value,
            fromTime: row.children.item(1).children.item(0).value,
            toTime: row.children.item(2).children.item(0).value
        }
    }

    let newTable = getEmptyExerciseTable(times);
    document.getElementById("exercise-tables").appendChild(newTable);
}

function removeExercises(sessionId) {
    let foundIndex = findExerciseTableById(sessionId);
    if (foundIndex == -1) {
        log("something went wrong: " + foundIndex);
        return;
    }

    document.getElementById("exercise-tables").children.item(foundIndex).remove();
}

function addWeekday(data) {
    let weekdayData = (data) ? data.times : null;
    let sessionId = data ? data.sessionId : getFreeSessionId();

    let weekday = document.createElement("input");
    weekday.setAttribute("type", "text");
    weekday.setAttribute("id", "weekday" + sessionId);
    weekday.setAttribute("placeholder", "Monday");
    if (weekdayData) weekday.value = weekdayData.weekday;
    weekday.addEventListener("input", (event) => {
        let id = event.target.parentElement.parentElement.getAttribute("id");
        let foundIndex = findExerciseTableById(id);
        if (foundIndex != -1) {
            let exTableBody = document.getElementById("exercise-table" + id);
            let exTableHead = exTableBody.parentElement.children.item(0);
            exTableHead.children.item(0).children.item(0).children.item(0).innerText = "Session: " + event.target.value;
        }
    })

    let from = document.createElement("input");
    from.setAttribute("type", "text");
    from.setAttribute("id", "from" + sessionId);
    from.setAttribute("placeholder", "08:00");
    if (weekdayData) from.value = weekdayData.fromTime;
    from.addEventListener("input", (event) => {
        let id = event.target.parentElement.parentElement.getAttribute("id");
        let foundIndex = findExerciseTableById(id);
        if (foundIndex != -1) {
            let exTableBody = document.getElementById("exercise-table" + id);
            let exTableHead = exTableBody.parentElement.children.item(0);
            exTableHead.children.item(0).children.item(0).children.item(1).innerText = " from " + event.target.value;
        }
    })

    let to = document.createElement("input");
    to.setAttribute("type", "text");
    to.setAttribute("id", "to" + sessionId);
    to.setAttribute("placeholder", "09:30");
    if (weekdayData) to.value = weekdayData.toTime;
    to.addEventListener("input", (event) => {
        let id = event.target.parentElement.parentElement.getAttribute("id");
        let foundIndex = findExerciseTableById(id);
        if (foundIndex != -1) {
            let exTableBody = document.getElementById("exercise-table" + id);
            let exTableHead = exTableBody.parentElement.children.item(0);
            exTableHead.children.item(0).children.item(0).children.item(2).innerText = " to " + event.target.value;
        }
    });

    let primaryMuscleGroup = document.createElement("select");
    primaryMuscleGroup.setAttribute("name", "selectMuscleGroup");
    primaryMuscleGroup.setAttribute("id", "selectMuscleGroup");
    setMuscleGroupOptions(primaryMuscleGroup);
    if (data) primaryMuscleGroup.value = data.primaryMuscleGroup;

    let delButton = document.createElement("button");
    delButton.setAttribute("class", "tableButton")
    delButton.setAttribute("id", "delete-day");
    delButton.innerText = "remove day";
    delButton.addEventListener("click", (event) => {
        if (document.getElementById("plan-table").children.length > 1) event.target.parentElement.parentElement.remove();
        if (document.getElementById("plan-table").children.length <= 1) event.target.parentElement.parentElement.parentElement.parentElement.remove();
        if (findExerciseTableById(Number(event.target.parentElement.parentElement.getAttribute("id"))) != -1) removeExercises(Number(event.target.parentElement.parentElement.getAttribute("id")));
    });

    let removeExercisesForDayButton = document.createElement("button");
    removeExercisesForDayButton.setAttribute("class", "tableButton");
    removeExercisesForDayButton.setAttribute("id", "exercise-controlButton");
    if (data && data.exercises.length != 0) {
        removeExercisesForDayButton.innerText = "remove exercises";
    } else {
        removeExercisesForDayButton.innerText = "add exercises";
    }
    removeExercisesForDayButton.addEventListener("click", (event) => {
        if (document.getElementById("exercise-table" + event.target.parentElement.parentElement.getAttribute("id"))) {
            removeExercises(Number(event.target.parentElement.parentElement.getAttribute("id")));
            event.target.innerText = "add exercises";
        } else {
            addExercises(Number(event.target.parentElement.parentElement.getAttribute("id")));
            event.target.innerText = "remove exercises";
        }
    });

    let tds = [document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td"), document.createElement("td")];
    tds[0].appendChild(weekday);
    tds[1].appendChild(from);
    tds[2].appendChild(to);
    tds[3].appendChild(primaryMuscleGroup);
    tds[4].setAttribute("class", "tableButtonContainer");
    tds[4].appendChild(delButton);
    tds[5].setAttribute("class", "tableButtonContainer");
    tds[5].appendChild(removeExercisesForDayButton)

    let tr = document.createElement("tr");
    tr.setAttribute("id", "" + sessionId);
    tds.forEach((td) => {
        tr.appendChild(td);
    });
    document.getElementById("plan-table").appendChild(tr);
}

function login() { //test this
    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;
    if (!email) {
        alert("Please fill out E-Mail field!");
        return;
    }
    loadDataFromSpecificUser(email, password).then((answer) => { //do will i, dass, wenn nix gefunden worden is, a Json objekt mit argumente "found", "userId" und "username" returned wird.
        if (answer.found) {
            //user existiert (mit passwort)
            let newDeviceData = {
                running: false,
                loggedIn: true,
                loggedInAsUser: answer.username,
                loggedInWithUserId: answer.userId,
                loadedUserData: true,
                sessionRunning: false,
            }
            localStorage.setItem("deviceData", JSON.stringify(newDeviceData));
            localStorage.setItem("userSettings", JSON.stringify(answer.userSettings))
            localStorage.setItem("userProperties", JSON.stringify(answer.userProperties))
            showLoggedIn(newDeviceData);
            location.href = "./index.html";
            initializeLogoutAndDelete();
        } else {
            alert("Email oder Passwort falsch!");
            return;
        }
    });
}

function logout() {
    let defaultDeviceData = {
        running: false,
        loggedIn: false,
        loggedInAsUser: "",
        loggedInWithUserId: -1,
        loadedUserData: false,
        sessionRunning: false,
    }
    localStorage.setItem("deviceData", JSON.stringify(defaultDeviceData));
    clearUserData();
    showLoggedIn(defaultDeviceData);
    location.href = "./index.html";
}

function signUp() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let email = document.getElementById("email").value;
    let weight = document.getElementById("weight").value;
    let size = document.getElementById("size").value;
    let birthday = document.getElementById("birthday").value;
    if (!(username && email && email.includes("@") && email.includes(".") && weight && size && birthday)) {
        alert("fill in the fields rightously")
        return;
    }
    let data;
    let createdPlan = false;
    if (document.getElementById("plan").checked) {
        data = {
            userId: -1, //temporär ungültige id, weil i jo ned was wos für a id in da Datenbank nu frei is
            userName: password,
            email: email,
            weight: weight,
            size: size,
            birthday: birthday,
            currentlyTraining: false,
            usualSessionTime: getSessionTimes()
        }
        createdPlan = true;
        if (!validateSessionTimes(data.usualSessionTime)) {
            alert("Days must be real weekdays, times must be real times: xx:xx");
            return;
        }
    } else {
        data = {
            userId: -1, //temporär ungültige id, weil i jo ned was wos für a id in da Datenbank nu frei is
            userName: password,
            email: email,
            weight: weight,
            size: size,
            birthday: birthday,
            currentlyTraining: false,
        }
    }
    let completeUserData = {
        userProperties: data,
        userSessionData: null,
        userShortTerm: null,
        userHighscores: null,
        userLongTermAverages: null,
        userSettings: {
            mode: "lightmode",
            viewing: {
                realTimeStats: true,
                sessionStats: true,
                longtermStats: true
            },
            createdPlan: createdPlan,
            devMode: false
        }
    }
    createNewUser(completeUserData).then(() => {
        login();
    });
}