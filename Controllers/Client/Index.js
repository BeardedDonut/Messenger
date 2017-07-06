/**
 * Created by navid on 7/3/17.
 */

const EVENT_REGISTER = "Register" ;
const EVENT_LOG_IN = "Login" ;
const EVENT_C2C_MSG = "CCMsg" ;
const EVENT_BROADCAST = "Broadcast";
const EVENT_CLIENT_NOT_FOUND = "ClientNotFound" ;
const EVENT_DISCONNECT = "disconnect";
const EVENT_LOG_OUT = "Logout" ;

var Clients = [];

//on connection callback
function on_connection(socket){

    socket.on(EVENT_REGISTER , function (data) { on_register(socket , data.client_name)}) ;

    socket.on(EVENT_LOG_IN , function (data) { on_login(socket , data.client_name)});

    socket.on(EVENT_BROADCAST , function (data) {on_broadcast_message(socket , data.client_sender , data.msg)});

    socket.on(EVENT_C2C_MSG , function (data) {on_c2c_message(socket , data.client_sender , data.client_receiver , data.msg)});

    socket.on(EVENT_DISCONNECT , function () {on_disconnect(socket)})
}


//on login procedures
function on_login(socket , client_name){

    Clients.push({"client_name" : client_name , "socket" : socket}) ;

    //broadcasting the logged user to others so everyone will be notified of new client
    socket.broadcast.emit(EVENT_LOG_IN , client_name);

    //send the previously connected clients identity to the new logged in client
    for(i= 0 ; i < Clients.length ; i++){
        if ( JSON.stringify(Clients[i].client_name) == JSON.stringify(client_name))
            continue;
        else{
            socket.emit(EVENT_LOG_IN , Clients[i].client_name);
        }
    }
}

//this function handles Broadcast messages
function on_broadcast_message( socket , client_sender , msg){
    if (client_sender == null)
        client_sender = "";
    socket.broadcast.emit(EVENT_BROADCAST , {"client_sender" : client_sender , "message" : msg});
}


//this function handles Client to Client messages
function on_c2c_message(socket , client_sender , client_receiver , msg){

    var receiver_socket ;
    //find the socket of the receiver client
    for (i =0 ; i < Clients.length ; i++){
        if(JSON.stringify(client_receiver )== JSON.stringify(Clients[i].client_name)){
            receiver_socket = Clients[i].socket;
            break;
        }
    }


    if ( i != Clients.length )
        receiver_socket.emit(EVENT_C2C_MSG , { "client_sender" : client_sender , "message" : msg}); //if found send the message to the client
    else
        socket.emit(EVENT_CLIENT_NOT_FOUND , client_receiver + " not found.");//else send back proper error
}

//on disconnect procedures
function on_disconnect(socket){

    var disconnected_client;
    //find the disconnected Client name
    for(i= 0 ; i < Clients.length ; i++){
        if ( Clients[i].socket == socket) {
            disconnected_client= Clients[i].client_name;
            Clients.splice(i , 1); //delete the disconnected client from the Clients list
            break;
        }
    }

    //notify other client of the disconnected Client so they could update their list of online clients
    for(i= 0 ; i < Clients.length ; i++)
        Clients[i].socket.emit(EVENT_LOG_OUT , disconnected_client);
}


exports.on_connection = on_connection ;