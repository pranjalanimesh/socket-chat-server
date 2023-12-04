const express  = require("express");
const http     = require("http");
const socketIo = require("socket.io");
const cors = require('cors'); // Import the cors middleware


const PORT     = process.env.PORT || 4001;

// Can also use http server 
// const app      = express();
// const server   = http.createServer(app);
// const io       = socketIo(server); 

const io = socketIo(PORT, {
    cors: {
        origin: '*',
    }
});

// list of users online 
let users = [];
let emailToSocket = {};
let socketToEmail = {};

io.on("connection", socket => {

    // when a user joins the chat system
    socket.on("join chat", (data) => {
        const user = {
            'name':data.name,
            'email':data.email,
            id: socket.id,
        }
        emailToSocket[data.email] = socket.id;
        socketToEmail[socket.id] = data.email;

        for(let i=0;i<users.length;i++){
            if(users[i].email == data.email){
                users.splice(i,1);
            }
        }
        users.push(user);

        io.emit("all users", users);
        console.log("New user joined the chat");
    });

    // sending a message from the client
    socket.on("send message", (data) => {
        // console.log(typeof data);
        // console.log(data);
        // console.log("\nEmail to socket",emailToSocket,"\n");
        console.log("sending above data to ", emailToSocket[data.receiver]);

        // sending the message to the receiver
        socket.to(emailToSocket[data.receiver]).emit("receive message", data);
        console.log("message distributed to receiver")
    });

    // mechanism for disconnecting a user
    socket.on("disconnect user", (data) => {
        console.log('disconnect user',data);
        console.log('users before', users);
        console.log('mail to remove', data.email);
        console.log('socket to remove', data.id);
        users = users.filter((user) => user.email !== data.email && user.id !== data.id);
        console.log(data.name+" disconnected")
        console.log('users after', users);
        io.emit("all users", users);
    });
});

// server.listen(PORT, () => console.log(`Listening on port ${PORT}`));