var express = require('express'),
    path = require('path'),
    http = require('http'),
	connect = require('connect'),
    wine = require('./routes/wines');

console.log("Express server start : 1 " + app);
	
var app = express();

console.log("Express server start : 2 " + app);

app.set('port', process.env.PORT || 3000);
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
/*app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser())
    app.use(express.static(path.join(__dirname, 'public')));
});*/

console.log("Express server start : 3 = " + app.get('port') + " env port = " + process.env.PORT);
var server = http.createServer(app);

console.log("Express server start : 4 " + server);
//io = io.listen(server);
var io = require('socket.io').listen(server);
console.log("Express server start : 5 " + io);

io.configure(function () {
    io.set('authorization', function (handshakeData, callback) {
        if (handshakeData.xdomain) {
            callback('Cross-domain connections are not allowed');
        } else {
            callback(null, true);
        }
    });
});

//server.listen(app.get('port'), function () {
server.listen(app.get('port'), function () {
    console.log("Express server listening on port " + app.get('port'));
});

app.get('/wines', wine.findAll);
app.get('/wines/:id', wine.findById);
app.post('/wines', wine.addWine);
app.put('/wines/:id', wine.updateWine);
app.delete('/wines/:id', wine.deleteWine);


io.sockets.on('connection', function (socket) {
    socket.on('message', function (message) {
        console.log("Got message: " + message);
        ip = socket.handshake.address.address;
        url = message;
        io.sockets.emit('pageview', { 'connections': Object.keys(io.connected).length, 'ip': '***.***.***.' + ip.substring(ip.lastIndexOf('.') + 1), 'url': url, 'xdomain': socket.handshake.xdomain, 'timestamp': new Date()});
    });

    socket.on('disconnect', function () {
        console.log("Socket disconnected");
        io.sockets.emit('pageview', { 'connections': Object.keys(io.connected).length});
    });

});