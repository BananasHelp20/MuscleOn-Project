init();

let running;
let error;
let cycle = 0;
function init() {
    setInterval(() => {
        updateStatus(); //update running
        if (running) {
            updateData();
            updateLongData();
            updateHighscores();
            checkForError(); //sets error
            if (error) {
                updateFallout(cycle);      //update, then wait 10 sec
                updateErrorMessage(cycle); //update, then wait 10 sec
            }
        }
        cycle++;
    }, 1000);
}