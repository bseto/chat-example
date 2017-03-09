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
    users.set(socket, generateName());
    //To self only
    socket.emit('chat', timestamp() + " System: Welcome! " + users.get(socket));
    socket.broadcast.emit('chat', generateMessage(socket, "has entered the room."));

    socket.on('chat', function(msg){
        io.emit('chat', generateMessage(socket, msg));
    });

    socket.on('disconnect', function(){
        io.emit('chat', generateMessage(socket, "disconnected"));
        users.delete(socket);
    });
});

function generateMessage(socket, message) {
    return timestamp() + " " + users.get(socket) + ": " + message;
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
