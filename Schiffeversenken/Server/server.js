var shipplacement = require('./ship-placement');
var express = require('express')
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
const servestatic = require('serve-static')
var router = express.Router();
var path = __dirname + '/public/';
var player1Socket;
var player2Socket;
var player1Field;
var player2Field;
const PLAYER_1_TURN = 1;
const PLAYER_2_TURN = 2;
var turn = PLAYER_1_TURN;

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  res.sendFile(path + "Schiffeversenken.html");
});

app.use(servestatic('public'));

app.use("/",router);

io.on('connection', function(socket){
    console.log('a user connected');
    if(!player1Socket){
        player1Socket = socket;
        player1Socket.on('disconnect', function(){
            console.log("Player1 disconnected");
            player1Socket = undefined;
        })
        player1Socket.on('fire', function(x,y){
            if(player1Socket && player2Socket && turn===PLAYER_1_TURN){
                if(player2Field[y][x]){
                    player1Socket.emit('fireResult', true);
                    player2Socket.emit('fireResultEnemy',x ,y ,true);
                    turn = PLAYER_1_TURN;
                }
                else{
                    player1Socket.emit('fireResult', false);
                    player2Socket.emit('fireResultEnemy',x ,y ,false);
                    turn = PLAYER_2_TURN;
                }
            }
        })
    }
    else if(!player2Socket){
        player2Socket = socket;
        if(!player1Field && !player2Field){
            player1Field = shipplacement.generateShipPlacement();
            player2Field = shipplacement.generateShipPlacement();
        }
        player1Socket.emit('myShips', player1Field);
        player2Socket.emit('myShips', player2Field);
        
        player1Socket.emit('playerNumber', 1);
        player2Socket.emit('playerNumber', 2);
        
        player2Socket.on('disconnect', function(){
            console.log("Player2 disconnected");
            player2Socket = undefined;
        })
        player2Socket.on('fire', function(x,y){
            if(player1Socket && player2Socket && turn ===PLAYER_2_TURN){
                if(player1Field[y][x]){
                    player1Socket.emit('fireResultEnemy',x ,y ,true);
                    player2Socket.emit('fireResult', true);
                    turn = PLAYER_2_TURN;
                }
                else{
                    player1Socket.emit('fireResultEnemy',x ,y ,false);
                    player2Socket.emit('fireResult', false);
                    turn = PLAYER_1_TURN;
                }
            }
        })
    }
  });

http.listen(3000,function(){
  console.log("Live at Port 3000");
});  
