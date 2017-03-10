var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var adjectives = ["fluttering", "little", "certain", "regular", "lopsided", "lumpy", "trite", "mountainous", "half", "determined", "tasteless", "breezy", "royal", "great", "familiar", "zippy", "fascinated", "erect", "probable", "useful", "purple", "terrible", "windy", "lovely", "outstanding", "weary", "curvy", "taboo", "aquatic", "cloistered"]

var nouns = ["tomatoes", "balance", "soap", "pleasure", "drink", "jam", "bikes", "mask", "income", "tub", "chalk", "sneeze", "cracker", "veil", "curtain", "volleyball", "jellyfish", "fire", "breath", "toes", "land", "swing", "change", "lumber", "bit", "camera", "fireman", "clover", "move", "mind"]

var users = new Map();

http.listen( port, function () {
    console.log('listening on port', port);
});

app.use(express.static(__dirname + '/public'));

// listen to 'chat' messages
io.on('connection', function(socket){
    users.set(socket, {
        NickName: generateName(),
        Color: "#3366ff"
    });
    //To self only
    //socket.emit('chat', '<b>' + timestamp() + " System: " + '</b>' + " Welcome! " + users.get(socket));
    //socket.broadcast.emit('chat', generateMessage(socket, "has entered the room."));

    socket.on('chat', function(msg){
        var command = checkSpecialCommand(socket, msg);
        if (command == false) {
            io.emit('chat', generateMessage(socket, "chat",  msg));
        } else {
            io.emit('chat', command);
        }
    });

    //socket.on('disconnect', function(){
    //io.emit('chat', generateMessage(socket, "disconnected"));
    //users.delete(socket);
    //});
});
function generateMessage(socket, type, message) {
    return {
        MessageType: type,
        Message: message,
        UserInfo: users.get(socket),
        TimeStamp: timestamp()
    }
}

function checkSpecialCommand(socket, message) {
    var command = message.split(" ")[0];
    switch(command) {
        case "/nick":
            if (users.has(message.substring(6, message.length))){
                return generateMessage(socket, "system", "Nick name already exists! Please pick a different nick name");
            } else {
                oldUserInfo = users.get(socket);
                oldName = oldUserInfo.NickName;
                users.delete(socket);
                oldUserInfo.NickName = message.substring(6, message.length);
                users.set(socket, oldUserInfo);
                return generateMessage(socket, "chat", oldName + " has changed their nick name to " + users.get(socket).NickName);
            }
            break;
        case "/nickcolor":
            oldUserInfo = users.get(socket);
            oldColor = oldUserInfo.Color;
            users.delete(socket);
            oldUserInfo.Color = "#"+message.substring(11, 18);
            users.set(socket, oldUserInfo);
            return generateMessage(socket, "chat", users.get(socket).NickName + " has changed their color to " + oldColor);
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

