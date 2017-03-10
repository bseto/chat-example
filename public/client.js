
// shorthand for $(document).ready(...)
$(function() {
    var socket = io();
    $('form').submit(function(){
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat', function(msg){
        if (msg.MessageType) {
            switch(msg.MessageType) {
                case "system":
                    System(msg);
                    break;
                case "chat":
                    Message(msg);
                    break;
                case "user":
                    UserMessage(msg);
                    break;
            }
        }
    });

    socket.on('history', function(queueHistory){
        for(msg of queueHistory) {
            if (msg.MessageType) {
                switch(msg.MessageType) {
                    case "system":
                        System(msg);
                        break;
                    case "chat":
                        Message(msg);
                        break;
                    case "user":
                        UserMessage(msg);
                        break;
                }
            }
        }
    });

    socket.on('clearUserList', function(user) {
        $('#users').empty();
    });

    socket.on('updateUserList', function(user) {
        $('#users').prepend($('<li>').html(user.NickName));
    });

});
function System(msg){
    var message = '<b>' + msg.TimeStamp + ' ';
    message += "<span style='color:#34495E;'>System</b> : </span>";
    message += msg.Message;
    $('#messages').prepend($('<li>').html(message));
    var messageDiv = document.getElementById("messages");
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

function Message(msg){
    var message = '<b>' + msg.TimeStamp + '</b> ';
    message += "<span style='color:" + msg.UserInfo.Color + ";'>" + msg.UserInfo.NickName + ": </span>";
    message += msg.Message;
    $('#messages').prepend($('<li>').html(message));
    var messageDiv = document.getElementById("messages");
    messageDiv.scrollTop = messageDiv.scrollHeight;
}

function UserMessage(msg){
    var message = '<b>' + msg.TimeStamp + ' ';
    message += "<span style='color:" + msg.UserInfo.Color + ";'>" + msg.UserInfo.NickName + ": </span>";
    message += msg.Message + '</b>';
    $('#messages').prepend($('<li>').html(message));
    var messageDiv = document.getElementById("messages");
    messageDiv.scrollTop = messageDiv.scrollHeight;
}


