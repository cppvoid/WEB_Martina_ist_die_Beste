let socket;
let lastFire;
$(document).ready(function () {
    if(!socket) {
        socket = io();
        initSocket();
    }
    $('#tablePlayer1').html(makeTable(1));
    $('#tablePlayer2').html(makeTable(2));
    sizeContent();

    open_player_name_modal();
});

function initSocket() {
    socket.on('fireResult', isHit => {
        if (isHit) {
            markMyHit(lastFire[0] , lastFire[1]);
        } else {
            markMyNoHit(lastFire[0] , lastFire[1]);
        }
    });
    socket.on('fireResultEnemy', (x, y, isHit) =>{
        if (isHit) {
            markOpponentHit(x,y);
        } else {
            markOpponentNoHit(x,y) 
        }
    });
    socket.on('myShips', playerField => {
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                if (playerField[y][x]) {
                    markMyShips(x,y);
                }
            }
        }
    });
    socket.on('playerTurn', isYourTurn => {
        if (isYourTurn) {
            $('#myLabel').css('color', 'red');
            $('#opponentLabel').css('color', 'black');
        }
        else {
            $('#myLabel').css('color', 'black');
            $('#opponentLabel').css('color', 'red');
        }
    });
    socket.on('won',highscore => {
        document.getElementById('myBody').style.backgroundColor = 'green';
        $('#highscore').html('DEIN HIGHSCORE: ' + highscore);
        $('#resetGame').css('visibility', 'visible');
    });
    socket.on('lost',highscore => {
        document.getElementById('myBody').style.backgroundColor = 'red';
        $('#highscore').html('GEGNER SEIN HIGHSCORE: '+ highscore);
        $('#resetGame').css('visibility', 'visible');
    });
    socket.on('myDestroyedShips', (x,y) => {
        markOpponentDestroy(x,y);
    });
    socket.on('opponentDestroyedShips', (x,y) => {
        markMyDestroy(x,y);
    });
    socket.on('refreshName', name => {
        $("#opponentLabel").html(name);
    });

    socket.on('resetField', () => {
        $('#tablePlayer1').html(makeTable(1));
        $('#tablePlayer2').html(makeTable(2));
        document.getElementById('myBody').style.backgroundColor = 'white';
        $('#highscore').html('');
        $('#resetGame').css('visibility', 'hidden');
    });

    socket.on('rejoinGame', (myShots, opponentShots) => {
        myShots.forEach(shot => {
            if(shot["typeOfHit"] === "noHit") {
                markMyNoHit(shot["xCoordinate"], shot["yCoordinate"]);
            } else if(shot["typeOfHit"] === "hit") {
                markMyHit(shot["xCoordinate"], shot["yCoordinate"]);
            } else if(shot["typeOfHit"] === "destroyed"){
                markMyDestroy(shot["xCoordinate"], shot["yCoordinate"]);
            }
        });
        opponentShots.forEach(shot => {
            if(shot["typeOfHit"] === "noHit") {
                markOpponentNoHit(shot["xCoordinate"], shot["yCoordinate"]);
            } else if(shot["typeOfHit"] === "hit") {
                markOpponentHit(shot["xCoordinate"], shot["yCoordinate"]);
            } else if(shot["typeOfHit"] === "destroyed"){
                markOpponentDestroy(shot["xCoordinate"], shot["yCoordinate"]);
            }
        });
    });
    socket.on('onLobbyFull', () => {
        window.location.href = "http://" + window.location.host + "/full-lobby.html";
    });
}

function markMyHit(x,y) {
    document.getElementById('enemField' + x + y).style.backgroundColor = '#FF5341';
}

function markMyNoHit(x,y) {
    document.getElementById('enemField' + x + y).style.backgroundColor = '#0ab2bd';
}

function markMyDestroy(x,y) {
    document.getElementById('enemField' + x + y).style.backgroundColor = '#008eb7';
}

function markOpponentHit(x,y) {
    document.getElementById('myField' + x + y).style.backgroundColor = '#034044';
}

function markOpponentNoHit(x,y) {
    document.getElementById('myField' + x + y).style.backgroundColor = '#0ab2bd';
}

function markOpponentDestroy(x,y) {
    document.getElementById('myField' + x + y).style.backgroundColor = '#008eb7';
}

function markMyShips(x,y){
    document.getElementById('myField' + x + y).style.backgroundColor = '#000000';
}

function fire(x, y) {
    lastFire = [x, y];
    socket.emit('fire', x, y);
}

function makeTable(playerNumber) {
    let str = '';
    str += '<tbody>';
    for (let y = 0; y < 10; y++) {
        str += '<tr>';
        for (let x = 0; x < 10; x++) {
            if (playerNumber == 1) {
                str += '<td class="spielfeld' + playerNumber + '" id= myField' + x + y + '></td>';
            } else {
                str += '<td onclick="fire(' + x + ',' + y + ')" class="spielfeld' + playerNumber + '" id= enemField' + x + y + '></td>';
            }
        }
        str += '</tr>';
    }
    str += '</tbody>';
    return str;
}

$('#playerName').modal({
    show: true,
    keyboard: false,
    backdrop: 'static'
});

function open_player_name_modal() {
    $('#playerName').modal({
        show: true,
        keyboard: false,
        backdrop: 'static'
    });
}

function reset_the_game(){
    socket.emit('restart');
}

function set_player_name() {
    let myLabel = document.getElementById('myLabelInput');
    // We have to reset the form errors with custom validity
    myLabel.setCustomValidity('');

    if (myLabel.checkValidity()) {
        let myLabelName = myLabel.value.trim();
        if (myLabelName.length == 0) {
            myLabel.setCustomValidity('Du brauchst einen Namen');
        } else {
            document.getElementById('myLabel').innerHTML = myLabelName;
            $('#playerName').modal('hide');
            socket.emit('setPlayerName', myLabelName);
        }
    }
}

function sizeContent() {
    let newHeight = $("html").height()*0.8 + "px";
    $(".wrapper").css("height", newHeight);
    let marginLeft = ($("html").width()*0.5 - $(".table-bordered").height()*0.5) + "px";

    document.getElementById("tablePlayer1").setAttribute("style","width: " + $(".table-bordered").height()+"px" + "!important");
    document.getElementById("tablePlayer2").setAttribute("style","width: " + $(".table-bordered").height()+"px" + "!important");
    $("#changePlayername").css("margin-left", marginLeft);
    $(".namesOfPlayer").css("margin-left", marginLeft);
}
