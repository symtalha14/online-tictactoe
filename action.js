var keey;
var elem;
var moves = [1, 2, 3, 4, 5, 6, 7, 8, 9];
var score_x = 0;
var score_o = 0;
var occup = {};
var count = 0;
var X = true;
var opponent = "";
var turn=false;
window.WebSocket = window.WebSocket || window.MozWebSocket;

var connection = new WebSocket('ws://127.0.0.1:8000');

let sendMove = (index) => {
    if(turn){
        getMove(index);
    var moved;
    if(!X){
        moved="X";
    }else{
        moved="O";
    }
    connection.send(JSON.stringify({
        "type": 'move',
        "val": index,
        "moved":moved,
        "room_num": ROOM_NUM,
        "client_id": CLIENT_ID          
    }));
    turn=false;
    }else{
        if(!opponent){
            alert("You have no opponent!");
        }else{
            alert("Not your turn");
        }
    }
  
}
var players=[];
function getMove(index) {

    if (X) {
        
        document.getElementById('warning').innerText =(players[1]==myName)?"Your Move":players[1]+'\'s Move ';
    } else { document.getElementById('warning').innerText =(players[0]==myName)?"Your Move":players[0]+'\'s Move '; }
    keey = parseInt(index);
    var temp;
    temp = moves;
    elem = document.getElementById(index);
    var valid_move = (temp[keey - 1] != 'occ');

    if (X && valid_move) {

        elem.innerText = 'X';
        elem.className="move-font";
        elem.style.color = '#0d3acc';
        temp[keey - 1] = 'occ';
        occup[index] = 'X';
        X = false;

    } else if (!X && valid_move) {
        elem.innerText = 'O';
        elem.className="move-font";
        elem.style.color = '#790404';
        temp[keey - 1] = 'occ';
        occup[index] = 'O';
        X = true;


    }
    else {
        document.getElementById('warning').innerText = 'Already Occupied !'
    }
    winner();
    turn=false;
}
//freeze sends a 
function winner() {
    var i = 1;
    count++;
    game = false;
    for (i; i < 10; i += 3) {
        if (typeof occup[i] != 'undefined') {
            if ((occup[i] == occup[i + 1]) && (occup[i + 1] == occup[i + 2])) {
                if (occup[i] == 'X') { score_x++ } else score_o++;
                document.getElementById('warning').innerText = occup[i] + ' WINS !';
                game = true;
                break
            }
            else if ((occup[1] == occup[4]) && (occup[4] == occup[7])) {
                if (occup[i] == 'X') { score_x++ } else score_o++;
                document.getElementById('warning').innerText = occup[i] + ' WINS !';
                game = true;
                break
            }
            else if ((occup[1] == occup[5]) && (occup[5] == occup[9]) && (typeof occup[1] != 'undefined')) {
                if (occup[1] == 'X') { score_x++ } else score_o++;
                document.getElementById('warning').innerText = occup[5] + ' WINS !';
                game = true;
                break
            }
            else if ((occup[3] == occup[5]) && (occup[5] == occup[7]) && (typeof occup[3] != 'undefined')) {
                if (occup[3] == 'X') { score_x++ } else score_o++;
                document.getElementById('warning').innerText = occup[3] + ' WINS !';
                game = true;
                break
            }
            else if ((occup[3] == occup[6]) && (occup[6] == occup[9]) && (typeof occup[3] != 'undefined')) {
                if (occup[3] == 'X') { score_x++ } else score_o++;
                document.getElementById('warning').innerText = occup[3] + ' WINS !';
                game = true;
                break
            }
            else if ((occup[2] == occup[5]) && (occup[5] == occup[8]) && (typeof occup[2] != 'undefined')) {
                if (occup[2] == 'X') { score_x++ } else score_o++;
                document.getElementById('warning').innerText = occup[2] + ' WINS !';
                game = true;
                break
            }


            else if (count == 9) {
                document.getElementById('warning').innerText = 'Draw !';
                game = true;
                break
            }
        }

    }

    document.getElementById('x').innerText = players[0] + '-' + score_x;
    document.getElementById('o').innerText = players[1] + '-' + score_o;
    if (game) {
        for (let i = 1; i < 10; i++) {
            document.getElementById(String(i)).innerText = '';
        }
        occup = {};
        count = 0;
        moves = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    }
}
window.WebSocket = window.WebSocket || window.MozWebSocket;

var connection = new WebSocket('ws://127.0.0.1:8000');
var CLIENT_ID = "";
var ROOM_NUM = "";
let sendMsg = () => {
    var msg = document.querySelector("#msg").value;

    document.querySelector("#msgs").innerHTML += ("You: " + msg + "<br>");
    var data = {
        type:'outgoing',
        "client_id": CLIENT_ID,
        "room_num": ROOM_NUM,
        "msg": msg,
    }
    connection.send(JSON.stringify(data));
}

// if user is running mozilla then use it's built-in WebSocket

var myName;

//Register
let register = () => {
    var user = document.querySelector("#sender").value;
    myName = user;
    players.push(user);
    turn=true;
    document.querySelector("#player").innerText = user;
    var data = {
        "register": user
    }
    sends=true;
    connection.send(JSON.stringify(data));
    document.querySelector("#sender").style.display = "none";
    document.querySelector("#reg-btn").style.display = "none";
    document.querySelector("#join_room_num").style.display = "none";
    document.querySelector("#user").style.display = "none";
    console.log("Request sent to the server!")
    // connection is opened and ready to use

}

//join room request
let JoinRoom = () => {
    var msg = document.querySelector("#join_room_num").value;
    var user = document.querySelector("#user").value;
    myName=user;
    document.querySelector("#player").innerText = user;

    var data = {
        "room_num": msg,
        "user": user,
        type: "JOIN"
    }
    connection.send(JSON.stringify(data));
}
// connection.onopen = function () {
//     connection.send("Initiate!");
//     connection.send("Sent!");
//     connection.send("Sent!");

//     connection.send("Sent!");

//     console.log("Request sent to the server!")
//     // connection is opened and ready to use
// };

connection.onerror = function (error) {
    console.log(error);

};

connection.onmessage = function (message) {

    console.log(message);
    var data = JSON.parse(message.data);
    console.log(data);
    if(data.type=="players"){
        players=data.data;
        document.getElementById('warning').innerText =(players[0]==myName)?"Your Move":players[0]+'\'s Move ';

    }
    if (data.type == "peered") {
        document.querySelector("#status").innerHTML += (data.data + " joined the game");
        opponent = data.data;
        
    }
    if (data.type == "opponent") {
        opponent = data.name;
        console.log(opponent);
    }
    if (data.type == "user_id") {
        CLIENT_ID = data.data[0];
        ROOM_NUM = data.data[1];

        document.querySelector("#client_id").innerText = "Client ID: " + CLIENT_ID;
        document.querySelector("#room_num").innerText = "Room Number: " + ROOM_NUM;
    }
    if (data.type == "incoming") {
        document.querySelector("#err").innerText = "";
        document.querySelector("#msgs").innerHTML += data.sender + ": " + data.data + "<br>";
        var occ = (data.data in occup);
        if (!occ) {
            getMove(data.data);
        }
    }
    if (data.type == "move") {
        document.querySelector("#err").innerText = "";
        var occ = (data.data in occup);
        if (!occ) {
            getMove(data.data);
        }
        turn=true;
    }
    if (data.type == "not_peered" || data.type == "not_sent") {
        document.querySelector("#err").innerText = data.data;
    }
    if(data.type=="left"){
        document.querySelector("#status").innerHTML+=("<br>"+data.data+" left the game");
    }
};

