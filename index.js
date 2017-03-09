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
        io.emit('chat', generateMessage(socket, "chat",  msg));
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
    if (msg.substring(0,5).localeCompare("/nick") == 0 ){
        if (users.has(msg.substring(6, msg.length))){
            return generateMessage(socket, "system", "Nick name already exists! Please pick a different nick name");
        } else {
            oldName = users.get(socket);
            users.delete(socket);
            users.set(socket, msg.substring(6, msg.length));
            return generateMessage(socket, "chat", oldName + " has changed their nick name to " + users.get(socket));
        }
    }
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
