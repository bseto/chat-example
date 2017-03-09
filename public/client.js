// shorthand for $(document).ready(...)

var br = '<br>'


$(function() {
    var socket = io();
    $('form').submit(function(){
        socket.emit('chat', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat', function(msg){
        $('#messages').append($('<li>').text(msg));
    });
});


