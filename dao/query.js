module.exports = {
  createUser: function(con, data, callback) {
    var sql = 'CREATE TABLE user_'+data.user+'('+         
           '`id` INT(20) NOT NULL AUTO_INCREMENT, '+    
           '`chat_id` VARCHAR(200) NOT NULL,'+         
           '`username` VARCHAR(100) NOT NULL,'+                         
           '`chat` VARCHAR(200) NOT NULL,'+                               
           '`date_created` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,'+
           '`read_flag` INT(1) NOT NULL DEFAULT 0,'+
           'PRIMARY KEY (`id`)'+               
         ')';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

    dropUser: function(con, data, callback) {
    var sql = 'DROP TABLE IF EXISTS user_'+data.user;
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

    saveUser: function(con, data, callback) {
    var sql = 'INSERT INTO users (username, password, chat_id) VALUES (' +con.escape(data.username)+', '+ con.escape(data.password) +', '+ con.escape(data.id) +')';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  getAllUsers: function(con, callback) {
    var sql = 'SELECT * FROM users ORDER BY user_id ASC';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

    getAllUsers: function(con, callback) {
    var sql = 'SELECT * FROM users ORDER BY user_id ASC';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  deleteUser: function(con, data, callback) {
    var sql = 'DELETE FROM users where username =' + con.escape(data.username);
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  saveChat: function(con, data, callback) {
    var sql = 'INSERT INTO general (username, chat) VALUES (' +con.escape(data.username)+', '+ con.escape(data.chat)+')';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  pullChat: function(con, data, callback) {
    var sql = 'SELECT username, chat, date_created FROM general WHERE date_created > (SELECT date_created FROM users WHERE username = '+ con.escape(data.username)+') ORDER BY general_id DESC LIMIT '+ data.limit;
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  generalRowCount: function(con, data, callback) {
    var sql = 'SELECT COUNT(*) count FROM general WHERE date_created > (SELECT date_created FROM users WHERE username = '+ con.escape(data.username)+')';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  privateRowCount: function(con, data, callback) {
    var sql = 'SELECT COUNT(*) count FROM private_chat WHERE (user1 = '+
          con.escape(data.username) +' AND user2 = '+ con.escape(data.pair) +') OR (user1='+
          con.escape(data.pair) +' AND user2='+ con.escape(data.username) +') ORDER BY chat_id';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
        console.log(rows + '   here in query')
      });
    },

  savePrivateChat: function(con, data, callback) {
    var sql = 'INSERT INTO private_chat (user1, user2, chat) VALUES (' +con.escape(data.user1)+', '+ con.escape(data.user2)+', '+ con.escape(data.chat)+')';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  pullPrivateChat: function(con, data, callback) {
    var sql = 'SELECT user1, chat, date_created FROM private_chat WHERE (user1 = '+
          con.escape(data.username) +' AND user2 = '+ con.escape(data.pair) +') OR (user1='+
          con.escape(data.pair) +' AND user2='+ con.escape(data.username) +') ORDER BY chat_id DESC LIMIT '+ data.limit;
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

    savePairChatId: function(con, data, callback) {
    var sql = 'INSERT INTO chat_pair (pair_id, user1, user2) VALUES (' +con.escape(data.id)+', '+con.escape(data.user1)+','+ con.escape(data.user2)+')';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

   getAllChatPair: function(con, data, callback) {
    var sql = 'SELECT * FROM chat_pair';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  getOfflineCount: function(con, data, callback) { 
    var sql = 'SELECT COUNT(*) count, user1 FROM private_chat WHERE read_flag = 0 AND user2 = '+con.escape(data.user)+' ORDER BY user1';
    con.query(sql,
      function(err, rows) {
        callback(err, rows);

      });
    },

  FlagAsRead: function(con, data, callback) {
    var sql = 'UPDATE private_chat SET read_flag = 1 WHERE user2 = '+ con.escape(data.user2);
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },

  FlagOfflineAsRead: function(con, data, callback) {
    var sql = 'UPDATE private_chat SET read_flag = 1 WHERE user2 = '+ con.escape(data.user);
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },
  saveAvatar: function(con, data, callback) {
    var sql = 'UPDATE users SET avatar_id = '+data.avatar_id+' WHERE username = '+con.escape(data.user);
    con.query(sql,
      function(err, rows) {
        callback(err, rows);
      });
    },
}

