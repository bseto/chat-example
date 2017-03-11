var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
var crypto = require('crypto');

var adjectives = ["fluttering", "little", "certain", "regular", "lopsided", "lumpy", "trite", "mountainous", "half", "determined", "tasteless", "breezy", "royal", "great", "familiar", "zippy", "fascinated", "erect", "probable", "useful", "purple", "terrible", "windy", "lovely", "outstanding", "weary", "curvy", "taboo", "aquatic", "cloistered"]

var nouns = ["tomatoes", "balance", "soap", "pleasure", "drink", "jam", "bikes", "mask", "income", "tub", "chalk", "sneeze", "cracker", "veil", "curtain", "volleyball", "jellyfish", "fire", "breath", "toes", "land", "swing", "change", "lumber", "bit", "camera", "fireman", "clover", "move", "mind"]

var users = new Map();
var queueHistory = [];

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){

    var cookie;
    socket.emit('grabCookie');

    socket.on('gotCookie', function(receive_cookie){
        cookie = receive_cookie;
        if(!users.has(cookie)) {
            console.log("Server map does not contain cookie though. Invalid cookie: " + cookie);
            socket.emit('deleteCookie');
            socket.emit('grabCookie');
            return;
        }
        //To self only
        socket.emit('history', queueHistory);
        socket.emit('chat', generateMessage(cookie, "system", "nolog", "Welcome! Your nickname is <b>"+ users.get(cookie).NickName + "</b>"));
        //Everyone Else
        socket.broadcast.emit('chat', generateMessage(cookie, "system", "log", users.get(cookie).NickName + " has joined the room."));

        //Change all user lists
        io.emit('clearUserList');
        users.forEach(function(user, key){
            io.emit('updateUserList', user);
        });
    });

    socket.on('noCookie', function(receive_cookie){
        console.log("NO cookie");
        var current_date = (new Date()).valueOf().toString();
        var random = Math.random().toString();
        var cookie = crypto.createHash('sha1').update(current_date + random).digest('hex');
        console.log("Cookie is now:" + cookie);
        socket.emit('setCookie', "chatroom", cookie, 1);
        users.set(cookie, {
            NickName: generateName(),
            Color: "#3366ff"
        });
        //To self only
        socket.emit('history', queueHistory);
        socket.emit('chat', generateMessage(cookie, "system", "nolog", "Welcome! Your nickname is <b>"+ users.get(cookie).NickName + "</b>"));
        //Everyone Else
        socket.broadcast.emit('chat', generateMessage(cookie, "system", "log", users.get(cookie).NickName + " has joined the room."));

        //Change all user lists
        io.emit('clearUserList');
        users.forEach(function(user, key){
            io.emit('updateUserList', user);
        });
    });


    socket.on('chat', function(msg, cookie){
        var command = checkSpecialCommand(cookie, msg, io);
        if (command === false) {
            socket.emit('chat', generateMessage(cookie, "user", "nolog", msg));
            socket.broadcast.emit('chat', generateMessage(cookie, "chat", "log", msg));
        } else {
            io.emit('chat', command);
        }
    });

});
function generateMessage(cookie, type, logbool, message) {
    console.log("generateMessage: cookie:" + cookie +  "\tType: " + type + "\tFor message: " + message);
    var message = {
        MessageType: type,
        Message: message,
        UserInfo: users.get(cookie),
        TimeStamp: timestamp()
    }

    if (logbool.localeCompare("log") === 0) {
        queueHistory.push(message);
        if (queueHistory.length > 200) {
            queueHistory.slice(0, 201)
        }
    }
    return message;
}

function checkSpecialCommand(cookie, message) {
    var command = message.split(" ")[0];
    switch(command) {
        case "/nick":
            proposedNick = message.split(" ")[1];
            if (!proposedNick) {
                return generateMessage(cookie, "system", "nolog", "Invalid Name");
            }
            nickNameList = [];
            users.forEach(function(nickname, key){
                nickNameList.push(nickname.NickName);
            });
            if (nickNameList.find(function(names) { return names === proposedNick })){
                return generateMessage(cookie, "system", "nolog", message.substring(6, message.length) + " Nick name already exists! Please pick a different nick name");
            } else {
                oldUserInfo = users.get(cookie);
                oldName = oldUserInfo.NickName;
                users.delete(cookie);
                oldUserInfo.NickName = message.substring(6, message.length);
                users.set(cookie, oldUserInfo);
                io.emit('clearUserList');
                users.forEach(function(user, key){
                    io.emit('updateUserList', user);
                });
                return generateMessage(cookie, "system", "log", "<b>" + oldName + "</b> has changed their nick name to <b>" + users.get(cookie).NickName + "</b>");
            }
            break;
        case "/nickcolor":
            oldUserInfo = users.get(cookie);
            oldColor = oldUserInfo.Color;
            users.delete(cookie);
            oldUserInfo.Color = "#"+message.substring(11, 18);
            users.set(cookie, oldUserInfo);
            return generateMessage(cookie, "system", "log", users.get(cookie).NickName + " has changed their color to " + users.get(cookie).Color);
    }
    return false;
}


function timestamp() {
    return (new Date).toISOString().replace(/z|t/gi,' ').trim().substring(11,19);
}

function generateName() {
    var name = randomElement(adjectives) + "-" + randomElement(nouns);
    while(users.has(name)) {
        name = randomElement(adjectives) + "-" + randomElement(nouns);
    }
    return name;
}

function randomElement(list) {
    var index = Math.floor(Math.random() * list.length);
    return list[index]
}
