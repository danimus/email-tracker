var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require("fs");
var parser = require('ua-parser-js');
var config = require('./config');
var tracker = require('./db');

var pmx = require('pmx').init({
    http: true, // HTTP routes logging (default: false)
    http_latency: 200,  // Limit of acceptable latency
    http_code: 500,  // Error code to track'
    alert_enabled: true,  // Enable alerts (If you add alert subfield in custom it's going to be enabled)
    ignore_routes: [/socket\.io/, /notFound/], // Ignore http routes with this pattern (default: [])
    errors: true, // Exceptions loggin (default: true)
    custom_probes: true, // Auto expose JS Loop Latency and HTTP req/s as custom metrics (default: true)
    network: true, // Network monitoring at the application level (default: false)
    ports: true  // Shows which ports your app is listening on (default: false)
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res, next) {
    var view = fs.readFileSync('./views/index.html');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(view, 'binary');
});

app.get('/pixel.gif', function (req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var ua = parser(req.headers['user-agent']);
    tracker(ua,ip);
    var img = fs.readFileSync('./public/images/tracking/pixel.gif');
    res.writeHead(200, {'Content-Type': 'image/gif'});
    res.end(img, 'binary');
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.send('Error')
});

module.exports = app;
