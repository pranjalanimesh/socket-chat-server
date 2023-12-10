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
const Chat = require('./models/Chat');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 4001;

// mongoose.connect('mongodb://localhost:27017/chatapp');
mongoose.connect('mongodb://127.0.0.1:27017/chatapp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
  });


const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

let users = [];
let emailToSocket = {};
let socketToEmail = {};
const { v4: uuidv4 } = require('uuid');

io.on("connection", socket => {

    socket.on("join chat", async (data) => {
        try {
            const user = {
                'name': data.name,
                'email': data.email,
                'role': data.role,
                // 'qrataid': data.qrataid,
                'qrataid': uuidv4(),
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
                    // qrataid: data.qrataid,
                    qrataid: user.qrataid,
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

// Update the "join chat" event
socket.on("join chat", async (data) => {
    try {
        const user = {
            'name': data.name,
            'email': data.email,
            'role': data.role,
            'qrataid': data.qrataid,
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
                qrataid: data.qrataid,
            });
            await newUser.save();
        }

        // Fetch the user from the database to ensure we have the updated data
        const updatedUser = await User.findOne({ email: data.email });

        // Update emailToSocket and socketToEmail mappings
        emailToSocket[updatedUser.email] = socket.id;
        socketToEmail[socket.id] = updatedUser.email;

        // Update users array by fetching from the database
        users = await User.find();
        io.emit("all users", users);
        console.log("New user joined the chat");
    } catch (error) {
        console.error('Error joining chat:', error.message);
    }
});

// Update the "send message" event
socket.on("send message", async (data) => {
    try {
        // Get the sender's email based on the socket ID
        const senderEmail = socketToEmail[socket.id];

        // Validate if senderEmail is available
        if (!senderEmail) {
            console.error('Error sending message: Sender email not found.');
            return;
        }

        // Emit the message to the receiver
        const receiverSocketId = emailToSocket[data.receiver];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receive message", {
                sender: senderEmail,
                content: data.content,
                timestamp: Date.now(),
            });

            console.log("Message distributed successfully");
        } else {
            console.error('Error sending message: Receiver socket not found.');
        }
    } catch (error) {
        console.error('Error sending message:', error.message);
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

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
