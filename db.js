var config = require('./config');
var mysql = require('mysql');
var pmx = require('pmx');

var connection = mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database
});

connection.connect(function (err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        pmx.log(err, "Error while connecting to DB");
    }
});

var insertTracking = function (ua, ip, callback) {
    var tracking = {ua: ua.ua, ip: ip};
    connection.query('INSERT INTO tracking SET ?', tracking, function (err, result) {
        if (err) {
            console.error('Error inserting: ' + err.message);
            pmx.log(err, "Error inserting in DB");
        }
    });
};
module.exports = insertTracking;