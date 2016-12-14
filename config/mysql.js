var mysql = require("mysql");

module.exports = {
  connectandGetMysqlPool: function(callback) {
    //MYSQL configuration below
    var pool = mysql.createPool({
      connectionLimit: 10,
      // host:  '35.163.43.186',
      // user:  'alpha',
      // password: 'Bl@ck007',
      // database: 'chat-hub'

      host:  'localhost',
      user:  'root',
      password: 'password',
      database: 'chat-hub'
    });
    pool.getConnection(function(err, connection) {
      callback(err, connection);
    });
  }
};
