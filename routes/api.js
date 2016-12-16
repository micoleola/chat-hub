var config_mysql = require('../config/mysql');
var util = require('../util/util');
var query = require('../dao/query');

module.exports = function(app) {
// module.exports = function(app, pg) {
	// const conString = 'postgres://test:password@localhost:5432/chat-hub' // make sure to match your own database's credentials


	app.post('/api/createUser', function(req, res) {
		var data = req.body;
			if(data) {
				config_mysql.connectandGetMysqlPool(function(err, connection) {
				  if (err) {
				    console.error(err);
				    util.broadcastError(res, err.message);
				    return;
			    } else {
			    	query.createUser(connection, data, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {
		    				res.json(data)
					    }
					  });
			      } 			    
			  });
		} else {
			return;
		}
	});

	app.post('/api/dropUser', function(req, res) {
		var data = req.body;
			if(data) {
				config_mysql.connectandGetMysqlPool(function(err, connection) {
				  if (err) {
				    console.error(err);
				    util.broadcastError(res, err.message);
				    return;
			    } else {
			    	query.dropUser(connection, data, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {
		    				res.json(data)
					    }
					  });
			      } 			    
			  });
		} else {
			return;
		}
	});

	app.post('/api/saveUser', function(req, res) {
		var data = req.body;
			if(data) {
				config_mysql.connectandGetMysqlPool(function(err, connection) {
				  if (err) {
				    console.error(err);
				    util.broadcastError(res, err.message);
				    return;
			    } else {
			    	query.saveUser(connection, data, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {
		    				res.json(data)
					    }
					  });
			      } 			    
			  });



			// pg.connect(conString, function (err, client, done) {  
			//   if (err) {
			//     return console.error('error fetching client from pool', err)
			//   }
			//   client.query('INSERT INTO public.users (username, socket_id) VALUES ($1, $2);', [data.username, data.socket_id], function (err, result) {
			//     done();

			//     if (err) {
			//       return console.error('error happened during query', err)
			//     }
			//     console.log('db/user saved successful')
			//     res.sendStatus(200)
			//   })
			// })
		} else {
			return;
		}
	});

	app.post('/api/deleteUser', function(req, res) {
		var data = req.body;
		if(data) {
			config_mysql.connectandGetMysqlPool(function(err, connection) {
				  if (err) {
				    console.error(err);
				    util.broadcastError(res, err.message);
				    return;
			    } else {
			    	query.deleteUser(connection, data, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {
					    	//console.log(data)
		    				res.json(data)
					    }
					  });
			      } 			    
			  });
		} else {
			return;
		}
	});

	app.get('/api/getUserByUsername', function(req, res) {
		var data = req.query;
		pg.connect(conString, function (err, client, done) {  
		  if (err) {
		    return console.error('error fetching client from pool', err)
		  }
		  client.query('SELECT * FROM public.users WHERE username = $1;', [data.username], function (err, result) {
		    done();

		    if (err) {
		      return console.error('error happened during query', err)
		    }
		    // console.log(result['rows'])
		    res.json(result['rows'])
		  })
		})
	});

	app.get('/api/getAllUsers', function(req, res) {
		config_mysql.connectandGetMysqlPool(function(err, connection) {
				  if (err) {
				    console.error(err);
				    util.broadcastError(res, err.message);
				    return;
			    } else {
			    	query.getAllUsers(connection, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {
					    	// console.log(rows)
		    				res.json(rows)
					    }
					  });
			      } 			    
			  });
		});

	app.post('/api/saveChat', function(req, res) {
		var data = req.body;
		if(data) {
			config_mysql.connectandGetMysqlPool(function(err, connection) {
				  if (err) {
				    console.error(err);
				    util.broadcastError(res, err.message);
				    return;
			    } else {
			    	query.saveChat(connection, data, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {
					    	// console.log(data)
		    				res.json(data)
					    }
					  });
			      } 			    
			  });
		} else {
			return;
		}
	});

	app.get('/api/pullChat/', function(req, res) {
		var data = req.query;
		var page = Number(data.page);					
		var numPerPage = 20;
		var skip = page * numPerPage;
		var limit = skip + ',' + numPerPage;
		var numOfPages = 0;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.generalRowCount(connection, {username: data.username}, function(
			    err, rows) {
			    if (err) {
			      console.error(err);
			      util.broadcastError(res, err.message);
			      return;
			    } else {
					
			    	// console.log(rows)
			    	if (rows[0].count > 0) {
    				numOfPages = Math.ceil(rows[0].count / numPerPage);
    					}
    				if (page < numOfPages) {
    				var _data = {username: data.username, limit: limit}
			    	query.pullChat(connection, _data, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {					    	
		    				var responsePayload = {rows: rows};

							if (page < numOfPages) {
							    responsePayload.pagination = {
							    current: page,
							    perPage: numPerPage,
							    numOfPages: numOfPages,
							    previous: page > 0 ? page - 1 : undefined,
							    next: page < numOfPages - 1 ? page + 1 : undefined
							    	}
							} else responsePayload.pagination = {
							      err: 'queried page is >= to maximum page number ' + numOfPages
							    }
							    // console.log(responsePayload);
							    res.json(responsePayload);
							    }
							});
			    		} else {
			    			err: 'queried page is >= to maximum page number ' + numOfPages
			    		}
				    }
				});
		    } 			    
		});
	});		

	app.post('/api/savePrivateChat', function(req, res) {
		var data = req.body;
		if(data) {
			config_mysql.connectandGetMysqlPool(function(err, connection) {
				  if (err) {
				    console.error(err);
				    util.broadcastError(res, err.message);
				    return;
			    } else {
			    	query.savePrivateChat(connection, data, function(
					    err, rows) {
					    if (err) {
					      console.error(err);
					      util.broadcastError(res, err.message);
					      return;
					    } else {
					    	//console.log(data)
		    				res.json(rows)
					    }
					  });
			      } 			    
			  });
		} else {
			return;
		}
	});

	app.get('/api/pullPrivateChat/', function(req, res) {
		var data = req.query;
		var page = data.page;					
		var numPerPage = 20;
		var skip = page * numPerPage;
		var limit = skip + ',' + numPerPage;
		var numOfPages = 0;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.privateRowCount(connection, {username: data.username, label: data.label}, function(err, rows) {
				    if (err) {
				      console.error(err);
				      util.broadcastError(res, err.message);
				      return;
				    } else {
					
			    	// console.log(rows)
			    	if (rows[0].count > 0) {
    				numOfPages = Math.ceil(rows[0].count / numPerPage);
    					}

    				var _data = {username: data.username, label: data.label, limit: limit}
			    	query.pullPrivateChat(connection, _data, function(
					    err, rows) {
					    if (err) {
						      console.error(err);
						      util.broadcastError(res, err.message);
						      return;
						    } else {
					    	
		    				var responsePayload = {rows: rows};

							if (page < numOfPages) {
							    responsePayload.pagination = {
							    current: page,
							    perPage: numPerPage,
							    numOfPages: numOfPages,
							    previous: page > 0 ? page - 1 : undefined,
							    next: page < numOfPages - 1 ? page + 1 : undefined
							    	}
							} else responsePayload.pagination = {
							      err: 'queried page is >= to maximum page number ' + numOfPages
							    }
							    // console.log(responsePayload);
							    res.json(responsePayload);
						    }
						});
				    }
				});
		    } 			    
		});
	});		

	app.get('/api/getAllChatPair', function(req, res) {
		var data = req.query;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.getAllChatPair(connection, data, function(
			    err, rows) {
			    if (err) {
			      console.error(err);
			      util.broadcastError(res, err.message);
			      return;
			    } else {
			    	//console.log(rows)
    				res.json(rows)
				    }
				});
		    } 			    
		});
	});

	app.post('/api/savePairChatId', function(req, res) {
		var data = req.body;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.savePairChatId(connection, data, function(
			    err, rows) {
			    if (err) {
			      console.error(err);
			      util.broadcastError(res, err.message);
			      return;
			    } else {
			    	//console.log(rows)
    				res.json(rows)
				    }
				});
		    } 			    
		});
	});

	app.post('/api/FlagAsRead', function(req, res) {
		var data = req.body;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.FlagAsRead(connection, data, function(
			    err, rows) {
			    if (err) {
			      console.error(err);
			      util.broadcastError(res, err.message);
			      return;
			    } else {
			    	//console.log(rows)
    				res.json(rows)
				    }
				});
		    } 			    
		});
	});

	app.get('/api/getOfflineCount', function(req, res) {
		var data = req.query;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.getOfflineCount(connection, data, function(
			    err, rows) {
			    if (err) {
			      console.error(err);
			      util.broadcastError(res, err.message);
			      return;
			    } else {
			    	//console.log(rows)
    				res.json(rows)
				    }
				});
		    } 			    
		});
	});

	app.post('/api/FlagOfflineAsRead', function(req, res) {
		var data = req.body;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.FlagOfflineAsRead(connection, data, function(
			    err, rows) {
			    if (err) {
			      console.error(err);
			      util.broadcastError(res, err.message);
			      return;
			    } else {
			    	//console.log(rows)
    				res.json(rows)
				    }
				});
		    } 			    
		});
	});

	app.post('/api/saveAvatar', function(req, res) {
		var data = req.body;
		config_mysql.connectandGetMysqlPool(function(err, connection) {
		  if (err) {
		    console.error(err);
		    util.broadcastError(res, err.message);
		    return;
	    } else {
	    	query.saveAvatar(connection, data, function(
			    err, rows) {
			    if (err) {
			      console.error(err);
			      util.broadcastError(res, err.message);
			      return;
			    } else {
			    	//console.log(rows)
    				res.json(rows)
				    }
				});
		    } 			    
		});
	});

}

