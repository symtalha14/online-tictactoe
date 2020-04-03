
"use strict";
var WebSocketServer = require("websocket").server;

var http = require('http');

var clients = [];

var client_rooms = {}
var client_info={}
var room_connections={};
var server = http.createServer((req, res) => {

});




server.listen(8000, () => {
    console.log((new Date()) + " Server started on PORT:8000");

});

var wsServer = new WebSocketServer({
    httpServer: server
});
var all_clients_connected = [];
var client_count = -1;
wsServer.on('request', (req) => {
    console.log((new Date()) + ' Connection from origin:' + req.origin);
    var connection = req.accept(null, req.origin);
    var index = clients.push(connection) - 1;
    var client_id = false;
    var room_num = false;
    console.log((new Date()) + " Connection Accepted");

    //on a new connection
    //if user is disconnected
    connection.on('close', (connection) => {
        if (client_id) {
            console.log((new Date()) + " Client " + client_id + " disconnected");
            var room = roomNum(client_id);
            var current_clients = room_connections[room]; 
            console.log(current_clients);
            // room_connections[room].splice(room_connections[room].indexOf(connection),1);
            for(var c in current_clients){
                current_clients[c].sendUTF(JSON.stringify({
                    type:"left",
                    data:client_info[client_id]
                }));
            }
            clients.splice(index, 1);
        }
    });
    connection.on('message', (message) => {
        console.log(client_rooms);
        if (message.type == 'utf8') {
            //if user does not exist
            var req_to_join = false;
            if (!client_id) {
                if (JSON.parse(message.utf8Data).type == "JOIN") {
                    console.log("Request to join!");
                    req_to_join=true;
                    room_num = JSON.parse(message.utf8Data).room_num;
                    if (room_num in client_rooms) {
                        if (client_rooms[room_num].length < 2) {
                            room_connections[room_num][0].sendUTF(JSON.stringify({
                                type:"peered",
                                data:JSON.parse(message.utf8Data).user
                            }));
                            connection.sendUTF(JSON.stringify({
                                type: 'user_id',
                                data: [client_id, room_num]
                            }));
                            connection.sendUTF(JSON.stringify({
                                type:"opponent",
                                name:client_info[client_rooms[room_num][0]]
                            }));
                            client_id = Math.floor(Math.random() * 8000);
                            client_rooms[room_num].push(client_id);
                            room_connections[room_num].push(connection);
                            client_info[client_id]=JSON.parse(message.utf8Data).user;
                            room_connections[room_num].forEach((x)=>{
                                x.sendUTF(JSON.stringify({
                                    type:"players",
                                    data:[client_info[client_rooms[room_num][0]],client_info[client_rooms[room_num][1]]]
                                }));
                            });
                            req_to_join = true;
                            console.log("Client added to room!");
                        } else {
                            console.log("Room is full!");
                        }
                    } else {
                        console.log("No such Room!");
                        connection.sendUTF(
                            JSON.stringify({
                                type: 'not_sent',
                                data: "No such room!"
                            })
                        );
                    }
                }
                client_count++;
                all_clients_connected.push(client_count);
                if ((JSON.parse(message.utf8Data).type == "register")) {
                    client_id = Math.floor(Math.random() * 8000);
                    room_num = Math.floor(Math.random() * 10000);
                    client_rooms[room_num] = [];
                    //tracking user ids
                    client_rooms[room_num].push(client_id);
                    //tracking connections
                    client_info[client_id]=JSON.parse(message.utf8Data).register;
                    room_connections[room_num]=[];
                    room_connections[room_num].push(connection);
                
                connection.sendUTF(JSON.stringify({
                    type: 'user_id',
                    data: [client_id, room_num]
                }));
                console.log((new Date()) + " New User created with user id:" + client_id);
            }}
            //if user exists
            else {
               
                console.log(client_info);
                var data = JSON.parse(message.utf8Data);
                var room_num = data.room_num;
                if (room_num in client_rooms) {
                    if (client_rooms[room_num].length == 2) {
                        var recipent_clients = room_connections[room_num];
                        if(data.type=="move"){
                            for (let i = 0; i < 2; i++) {
                                if (recipent_clients[i] != connection) {
                                    // var ind = clients.indexOf(recipent_clients[i]);
                                    recipent_clients[i].sendUTF(
                                        JSON.stringify(
                                            {
                                                type: "move",
                                                data: data.val,
                                                sender:client_info[client_id]
                                            }
                                        )
                                    );
                                }
                            }
                        }
                        if(data.type=='outgoing'){
                            for (let i = 0; i < 2; i++) {
                                if (recipent_clients[i] != connection) {
                                    // var ind = clients.indexOf(recipent_clients[i]);
                                    recipent_clients[i].sendUTF(
                                        JSON.stringify(
                                            {
                                                type: "incoming",
                                                data: data.msg,
                                                sender:client_info[client_id]
                                            }
                                        )
                                    );
                                }
                            }
                        }
                    } else {
                        connection.sendUTF(
                            JSON.stringify({
                                type: 'not_peered',
                                data: "Not peered!"
                            })
                        );
                    }
                } else {
                    connection.sendUTF(
                        JSON.stringify({
                            type: 'not_sent',
                            data: "No such room!"
                        })
                    );
                }
            }
        }

    });




});

let roomNum=(client_id)=>{
    for(var room in client_rooms){
        var clients_in_room = client_rooms[room];
        if(clients_in_room.indexOf(client_id)!=-1){
            return room;
        }
    }
    
    return -1;
}