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
                    break;
                case "chat":
                    userMessage(msg);
                    break;
            }
        }
    });
});

function userMessage(msg){
    var message = '<b>' + msg.TimeStamp + '</b> ';
    message += "<span style='color:" + msg.UserInfo.Color + ";'>" + msg.UserInfo.NickName + ": </span>";
    message += msg.Message;
    $('#messages').append($('<li>').html(message));
}


