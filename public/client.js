
// shorthand for $(document).ready(...)
$(function() {
	var socket = io();
	$('form').submit(function(){
		socket.emit('chat', $('#m').val());
		$('#m').val('');
		return false;
	});

	//From https://www.w3schools.com/js/js_cookies.asp
	socket.on('grabCookie', function(cname){
		var name = cname + "=";
		var decodedCookie = decodeURIComponent(document.cookie);
		var ca = decodedCookie.split(';');
		for(var i = 0; i <ca.length; i++) {
			var c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0) {
				socket.emit('grabCookie', c.substring(name.length, c.length));
			}
		}
		socket.emit('grabCookie', "");
	});

	//From https://www.w3schools.com/js/js_cookies.asp
	socket.on('setCookie', function(name, value, days){
		var d = new Date();
		d.setTime(d.getTime() + (days*24*60*60*1000));
		var expires = "expires="+ d.toUTCString();
		document.cookie = name + "=" + value + ";path=/";
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


