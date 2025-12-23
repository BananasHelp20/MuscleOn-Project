init();

let running;
let error;
let cycle = 0;
let data;
let avgData;
let highscores;
let fallout

function init() {
    setInterval(() => {
        updateStatus(); //update running
        if (running) {
            updateData(false);
            updateLongData();
            updateHighscores();
            checkAndHandleErrors(); //sets error
        }
        cycle++;
    }, 1000);
}

async function updateStatus() {
    let resp = await fetch("/checkRunning");
    if (resp.ok) {
        running = resp.json();
    }
}

async function updateData(fallout) {
    let resp = await fetch("/getData");
    if (resp.ok) {
        data = resp.json();
    }
}

async function updateLongData() {
    let resp = await fetch("/getAvgData");
    if (resp.ok) {
        avgData = resp.json();
    }
}

async function updateHighscores() {
    let resp = await fetch("/getHighscores");
    if (resp.ok) {
        highscores = resp.json().errors;
    }
}

async function checkAndHandleErrors() {
    let resp = await fetch("/checkErrors");
    let errors = JSON.parse(await resp.json()).errors;

    if (errors.fallout) {
        updateData(true);
        error = true;
    }
    
    if (!errors.workingCorrectly) {
        error = true;
        //anzeigen das des ned gaunz geht, und daher Daten auf NaN und so setzen
    }

    if (!errors.doingSomething) {
        error = true;
        //muscle-on als ausgeschaltet anzeigen.
    }
}

async function updateFallout() {
    let resp = await fetch("/checkErrors");
    fallout = (await resp.json()).errors.fallout;
}