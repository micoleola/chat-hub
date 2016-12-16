var request = require('request');

module.exports = {
    saveUser: function(data, url, callback) {
        request({
            url: url + '/api/saveUser',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

    createUser: function(data, url, callback) {
        request({
            url: url + '/api/createUser',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

    dropUser: function(data, url, callback) {
        request({
            url: url + '/api/dropUser',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

    deleteUser: function(data, url, callback) {
        request({
            url: url + '/api/deleteUser',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

     getUserByUsername: function(data, url, callback) {
        request({
            url: url + '/api/getUserById',
            method: 'GET',
            qs: {data: data},
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

    getAllUsers: function(url, callback) {
        request({
            url: url + '/api/getAllUsers',
            method: 'GET'
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

    saveChat: function(data, url, callback) {
        request({
            url: url + '/api/saveChat',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

    pullChat: function(data, url, callback) {
        request({
            url: url + '/api/pullChat',
            method: 'GET',
            qs: data
        }, function(error, response, body) {
            callback(error, response, body);
        })
   },

   savePrivateChat: function(data, url, callback) {
        request({
            url: url + '/api/savePrivateChat',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },

    pullPrivateChat: function(data, url, callback) {
        request({
            url: url + '/api/pullPrivateChat',
            method: 'GET',
            qs: data
        }, function(error, response, body) {
            callback(error, response, body);
        })
   },


    savePairChatId: function(data, url, callback) {
        request({
            url: url + '/api/savePairChatId',
            method: "POST",
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
    },        

   getAllChatPair: function(data, url, callback) {
        request({
            url: url + '/api/getAllChatPair',
            method: 'GET',
            qs: data
        }, function(error, response, body) {
            callback(error, response, body);
        })
   },  

   // GetLastMsgId: function(data, url, callback) {
   //  console.log(data)
   //      request({
   //          url: url + '/api/GetLastMsgId',
   //          method: 'GET',
   //          qs: data
   //      }, function(error, response, body) {
   //          callback(error, response, body);
   //      })
   // },   

   getOfflineCount: function(data, url, callback) {
        request({
            url: url + '/api/getOfflineCount',
            method: 'GET',
            qs: data
        }, function(error, response, body) {
            callback(error, response, body);
        })
   },

   FlagAsRead: function(data, url, callback) {
        request({
            url: url + '/api/FlagAsRead',
            method: 'POST',
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
   }, 

   FlagOfflineAsRead: function(data, url, callback) {
        request({
            url: url + '/api/FlagOfflineAsRead',
            method: 'POST',
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
   }, 

      saveAvatar: function(data, url, callback) {
        request({
            url: url + '/api/saveAvatar',
            method: 'POST',
            json: true,
            headers: {
                "content-type": "application/json",
            },
            body: data,
        }, function(error, response, body) {
            callback(error, response, body);
        })
   },
}
