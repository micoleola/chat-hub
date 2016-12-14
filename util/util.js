module.exports = {
    broadcastError: function(res, message) {
        res.json({
            "status": "error",
            "data": message
        });
    },
    broadcastSuccess: function(res, message) {
        res.json({
            "status": "success",
            "data": message
        });
    }
};