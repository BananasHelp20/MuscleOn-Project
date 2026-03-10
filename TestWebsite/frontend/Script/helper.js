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
        if (userData[i].userPassword === password && userData[i].userMail === mail) {
            return userData[i].userId;
        }
    }
    return -1;
}

function getUserIdFromUsernameAndPassword(username, password) {
    if (username === "" || password === "") {
        return -1;
    }
    for (let i = 0; i < userData.length; i++) {
        if (userData[i].userPassword === password && userData[i].userName === username) {
            return userData[i].userId;
        }
    }
    return -1;
}