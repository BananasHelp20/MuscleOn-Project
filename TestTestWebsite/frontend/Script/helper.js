function getIndexOfUserId(userId) {
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userId === userId) {
            return i;
        }
    }
    return -1;
}

function getUserIdOfUserMail(userMail) {
    if (userMail === "") {
        return -1;
    }

    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userMail === userMail) {
            return userData[i].userId;
        }
    }
    return -1;
}

function getUserIdFromPasswordAndMail(password, mail) {
    if (password === "" || mail === "") {
        return -1;
    }
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].passwd === password && userData[i].userMail === mail) {
            return userData[i].userId;
        }
    }
    return -1;
}

function getUserIdFromUsernameAndPassword(username, password) {
    console.log("getUserIdFromUsernameAndPassword aufgerufen mit:", username, password);
    console.log("userData:", userData);
    if (username === "") {
        console.log("Username oder Password leer!");
        return -1;
    }
    for (let i = 0; i < userData.length; i++) {
        console.log(`Vergleiche: ${userData[i].username} === ${username} && ${userData[i].passwd} === ${password}`);
        if (userData[i].passwd === password && userData[i].username === username) {
            console.log("Match gefunden! User ID:", userData[i].userId);
            return userData[i].userId;
        }
    }
    console.log("Kein Match gefunden!");
    return -1;
}