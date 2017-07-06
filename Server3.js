/**
 * Created by navid on 7/3/17.
 */
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var ejs = require("ejs") ;
var bodyParser = require('body-parser');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.set("view engine" , ejs) ;


var port = process.env.PORT || 3000;
var socketController = require("./Controllers/Client/Index.js");


app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/Home.html');
});

app.post("/register/" , function (req ,res) {
    res.render("msgTemplate.ejs" , {My_Client_Name : req.body.My_Client_Name})
});

io.sockets.on('connection',function (socket) {
    socketController.on_connection(socket);
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});