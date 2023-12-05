// const express  = require("express");
// const http     = require("http");
// const socketIo = require("socket.io");
// const cors = require('cors'); // Import the cors middleware


// const PORT     = process.env.PORT || 4001;

// // Can also use http server 
// // const app      = express();
// // const server   = http.createServer(app);
// // const io       = socketIo(server); 

// const io = socketIo(PORT, {
//     cors: {
//         origin: '*',
//     }
// });

// // list of users online 
// let users = [];
// let emailToSocket = {};
// let socketToEmail = {};

// io.on("connection", socket => {

//     // when a user joins the chat system
//     socket.on("join chat", (data) => {
//         const user = {
//             'name':data.name,
//             'email':data.email,
//             id: socket.id,
//         }
//         emailToSocket[data.email] = socket.id;
//         socketToEmail[socket.id] = data.email;

//         for(let i=0;i<users.length;i++){
//             if(users[i].email == data.email){
//                 users.splice(i,1);
//             }
//         }
//         users.push(user);

//         io.emit("all users", users);
//         console.log("New user joined the chat");
//     });

//     // sending a message from the client
//     socket.on("send message", (data) => {
//         // console.log(typeof data);
//         // console.log(data);
//         // console.log("\nEmail to socket",emailToSocket,"\n");
//         console.log("sending above data to ", emailToSocket[data.receiver]);

//         // sending the message to the receiver
//         socket.to(emailToSocket[data.receiver]).emit("receive message", data);
//         console.log("message distributed to receiver")
//     });

//     // mechanism for disconnecting a user
//     socket.on("disconnect user", (data) => {
//         console.log('disconnect user',data);
//         console.log('users before', users);
//         console.log('mail to remove', data.email);
//         console.log('socket to remove', data.id);
//         users = users.filter((user) => user.email !== data.email && user.id !== data.id);
//         console.log(data.name+" disconnected")
//         console.log('users after', users);
//         io.emit("all users", users);
//     });
// });

// // server.listen(PORT, () => console.log(`Listening on port ${PORT}`));

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const User = require('./models/User');
const Message = require('./models/Message');
const Chat = require('./models/Chat'); // Import the Chat model
const mongoose = require('mongoose');

const PORT = process.env.PORT || 4001;

mongoose.connect('mongodb://localhost:27017/chatapp');

const io = socketIo(PORT, {
    cors: {
        origin: '*',
    }
});

let users = [];
let emailToSocket = {};
let socketToEmail = {};

io.on("connection", socket => {

    socket.on("join chat", async (data) => {
        try {
            const user = {
                'name': data.name,
                'email': data.email,
                'role': data.role,
                id: socket.id,
            };

            // Save or update user in the database
            const existingUser = await User.findOne({ email: data.email });

            if (existingUser) {
                // Update existing user's socketId
                existingUser.socketId = socket.id;
                existingUser.role = data.role;
                await existingUser.save();
            } else {
                // Create a new user
                const newUser = new User({
                    name: data.name,
                    email: data.email,
                    socketId: socket.id,
                    role: data.role,
                });
                await newUser.save();
            }

            emailToSocket[data.email] = socket.id;
            socketToEmail[socket.id] = data.email;

            // Update users array by fetching from the database
            users = await User.find();
            io.emit("all users", users);
            console.log("New user joined the chat");
        } catch (error) {
            console.error('Error joining chat:', error.message);
        }
    });

    socket.on("join group", async (data) => {
        try {
            const user = await User.findOne({ email: data.email });

            // Find or create the group chat
            let chat = await Chat.findOne({ chatName: data.chatName });
            if (!chat) {
                chat = new Chat({
                    chatName: data.chatName,
                    isGroupChat: true,
                    users: [user._id],
                    owner: user._id,
                    groupAdmin: [user._id],
                });
                await chat.save();
            } else {
                // Add user to the group chat
                chat.users.push(user._id);
                await chat.save();
            }

            // Join the group chat room
            socket.join(data.chatName);

            // Emit the group chat details to the client
            io.to(socket.id).emit("group joined", { chatName: data.chatName });

            console.log(`${user.name} joined the group chat "${data.chatName}"`);
        } catch (error) {
            console.error('Error joining group chat:', error.message);
        }
    });

    socket.on("send group message", async (data) => {
        try {
            const sender = await User.findOne({ email: data.sender });

            // Save the group message to the database
            const message = new Message({
                sender: sender._id,
                content: data.message,
            });
            await message.save();

            // Update the group's latest message
            const chat = await Chat.findOne({ chatName: data.chatName });
            chat.latestMessage = message._id;
            await chat.save();

            // Broadcast the group message to all members
            io.to(data.chatName).emit("receive group message", data);
            console.log(`Group message distributed to ${data.chatName}`);
        } catch (error) {
            console.error('Error sending group message:', error.message);
        }
    });

    socket.on("disconnect user", async (data) => {
        try {
            // Remove user from the database
            await User.deleteOne({ email: data.email, socketId: data.id });

            users = await User.find();
            io.emit("all users", users);
            console.log(data.name + " disconnected");
        } catch (error) {
            console.error('Error disconnecting user:', error.message);
        }
    });
});

// Your server listening code remains unchanged
// server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
