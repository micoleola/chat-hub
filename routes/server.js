var api = require('../util/getAPI'),
	util = require('../util/util');
var user = '';

module.exports = function(app, io) {

	var users = {};
	var db_users = {};
	var connections = []; 
	// var user = '';
	var id = '';
	var url = '';
	var users_avatar = {};	

	app.get('/', function(req, res) {
		url = req.protocol + '://' + req.get('host');
		res.render('chat');
		});

	io.sockets.on('connection', function(socket) {
		//populate users list
		if(url.match(/^[a-z]{3,5}:\/{2}\S+/i)) {
			api.getAllUsers(url, function(error, response, body) {
				io.sockets.emit('refresh prompt', url);
				if(error) {
						console.log(error)
				} else {
					if(body) {
						var body = JSON.parse(body);
						console.log('no users fetched')
						for (var i = 0; i < body.length; i++) {
							var row = body[i];
							var username = row['username'];
							var password = row['password'];
							var chat_id = row['chat_id'];
							var av_id = row['avatar_id'];
							db_users[username] = {password: password, chat_id: chat_id};
							users_avatar[username] = av_id;							
						}
					} else {
						console.log('no users fetched')
					}			
				}
			});
			} else { 
			socket.emit('refresh prompt', url);
			console.log('Error!!! Refresh page to continue.')
			}
		
		socket.on('check user', function(data, callback) {
			if(db_users.hasOwnProperty(data)) {
				callback(false);
			} else {
				callback(true);						
				}
			});

		socket.on('check user/password', function(data, callback) {
			var username = data.username;
			var password = data.password;
			if (db_users.hasOwnProperty(username)) {
				if (db_users[username].password == data.password) {
					callback(true);
				} else {
					callback(false);
				}
			} else {
				callback(false)
				}
			});

		socket.on('new user', function(data) {
			var _id = '';
			socket.nickname = data.username;
			generateChatId(function(id) {
				_id = id;
				var _data = {username: socket.nickname, password: data.password, id: id};
				api.saveUser(_data, url, function(error, response, body) {
					if(error) {
						console.log(error)
					} else {
						var _user = {user: socket.nickname};
						users[socket.nickname] = socket;
						connections.push(socket);
						console.log(socket.nickname + ' is online. Connected sockets is %s', connections.length);
						broadcastUser('online', socket.nickname);	
						updateUsers();
						updateUsersAvatar();
						socket.emit('login')
						}	
					});	
				})	
			});

		socket.on('user logged in', function(data, callback) {
			if (users.hasOwnProperty(data)) {
				callback (false);	
			} else {
				socket.nickname = data;
				users[socket.nickname] = socket;
				connections.push(socket);
				console.log(socket.nickname + ' is online. Connected sockets is %s', connections.length);
				broadcastUser('online', socket.nickname);	
				updateUsers();
				updateUsersAvatar();	
				callback (true);
				}			
			});	

		function broadcastUser(status, data) {
			var info = '';
			if (status == 'online') info = data + ' is now online...';
			else if (status == 'offline') info = socket.nickname + ' is offline...';
			else return;
			socket.broadcast.emit('broadcast user status', info)
			}

	  	function updateUsers() {
	  		//getUnreadCount()
			io.sockets.emit('users', {users: Object.keys(users)});
			}

		function updateNotification() {
			 sockets.emit('notification', {users: Object.keys(users)});
			}

		socket.on('user typing', function(data) {
			if (data.label == '#general') {
				socket.broadcast.emit('display user typing', data);	
			} else if (data.label in users) {
			users[data.label].emit('private user typing', data);
				}
				else {
					return;
				}
			});

		socket.on('user done typing', function(data) {
			socket.broadcast.emit('remove user typing', data);		
			});

		socket.on('send message', function(data, callback) {
			if (data) {
				var msg = data.msg;
				var user = data.user;
				var _label = data.pair;
				if (_label) {
					if (_label == '#general') {
						var _data = {username: socket.nickname, chat: data.msg};
						api.saveChat(_data, url, function(error, response, body) {
							if(error) {
								console.log(error)
							} else {
								socket.broadcast.emit('new message', {msg: data.msg, user: socket.nickname});
								callback(msg)
							}				
						});	
					} else {
						// var user1 = fetchId(user),
						// 	user2 = fetchId(_label);

						var _data = {user1: user, user2: _label, chat: msg};
						api.savePrivateChat(_data, url, function (error, response, body) {					
						    if(error) {
								console.log(error)
								return;
							} else {
								users[_label].emit('private message', {msg: msg, user: socket.nickname}, function(data) {
									if(data) {
										if (data == 'read') {
										api.FlagAsRead({user2: _label}, url, function (error, response, body) {
											if (error) {
												console.log(error)
											} else {
												console.log('chat delivered')
												}
											});
										}
										callback(msg)
										}
									});
								}
							})						
						}
					} else {
						console.log('invalid label')
					}
				} else {
				console.log('no data');
				return;
				}
			});	

		socket.on('flag as read', function(data) {
			// var chat_id = db_users[data].chat_id;
			var flag_info = {user: data}; 
			api.FlagOfflineAsRead(flag_info, url, function(error, response, body) {
				if (error) {
					console.log(error)
				} else {
					console.log('all offline msg read')
				}
			});
		})

		socket.on('get unread chat', function(data, callback) {
			api.getOfflineCount({user: data.user}, url, function(error, response, body) {
				if (error) {
					console.log(error)
				} else {
					var body = JSON.parse(body);
					callback(body)
				}
			});
		})

		socket.on('pull message', function(data, callback) {
			var label = data.label;
					
			if(label == '#general') {
				if (label[0] == '#') {
					var data_trim = label.substr(1);
					}
				var _data = {username: socket.nickname, label: data_trim, page: data.page};
				api.pullChat(_data, url, function(error, response, body) {
					if(error) {
						console.log(error)
					} else {
						var body = JSON.parse(body);
						socket.emit('chat backup display', body);
						callback(true);
					}				
				});				
			} else {
				 // var user1 = fetchId(socket.nickname),
					//  user2 = fetchId(data);

				var _data = {username: socket.nickname, label: label, page: data.page};

				api.pullPrivateChat(_data, url, function(error, response, body) {
						if(error) {
							console.log(error)
						} else {
							var body = JSON.parse(body);
							socket.emit('private chat backup', body);
							callback(true);
							}				
						});		 
					}
			}); 
		
		function generateChatId(callback) {
			// Generate unique id for the room
			var id = String(Date.now()) + String(Math.round(Math.random()* 100));
			callback(id);
		};

		function fetchId(label) {
			var id = '';
			var _users_keys = Object.keys(db_users);
			for(var i = 0; i < _users_keys.length; i++) {
				var _username = _users_keys[i];

				if (_username == label) {
					id = db_users[_username].chat_id;
					return id;						
					}
				}				 			
			};

		socket.on('disconnect', function(data) {
			if (!socket.nickname) return;
			if (!users[socket.nickname]) return;
		    delete users[socket.nickname];
			connections.splice((connections.indexOf(socket)), 1);
			broadcastUser('offline', socket.nickname);
			updateUsers();
			updateUsersAvatar();
			socket.disconnect(true);		
			console.log(socket.nickname + ' is disconnected. %s sockets left', connections.length);
		});

		/***********AVARTAR****************/
		socket.on('user avatar change', function(data) {
			users_avatar[socket.nickname] = data;
			api.saveAvatar({user: socket.nickname, avatar_id: data}, url, function(error, response, body) {
				if (error) {
					console.log(error)
				} else {
					updateUsersAvatar();
				}
			})
			
		})

		function updateUsersAvatar() {
			io.sockets.emit('update users avatar', users_avatar);
		}

		socket.on('connect_failed', function() {
		    console.log("Sorry, there seems to be an issue with the connection!");
		    io.sockets.sockets.forEach(function(s) {
    			s.disconnect(true);
    			s.removeAllListeners('connection')
});
		})
	});

}
