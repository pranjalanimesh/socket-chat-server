const express  = require("express");
const http     = require("http");
const socketIo = require("socket.io");
const cors = require('cors');
const User = require('./models/User');
const Message = require('./models/Message');
const Conversation = require('./models/Conversation');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 4001;

// mongoose.connect('mongodb://localhost:27017/chat');
mongoose.connect('mongodb://127.0.0.1:27017/chat', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error.message);
});


const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("Server is running");
});

app.post("/chats", async (req, res) => {
    try {   
        
        // let senderQrataId = req.body.senderQrataId;
        let senderEmail = req.body.senderEmail;
        // let receiverQrataId = req.body.receiverQrataId;
        let receiverEmail = req.body.receiverEmail; 

        // Find the sender user in the database
        let sender = await User.findOne({email: senderEmail });
        let contacts = sender.contacts;
        let receiver = contacts.find((contact) => contact.email === receiverEmail);
        let conversationId = receiver.conversationId;
        let conversation = await Conversation.findOne({ _id: conversationId });
        res.status(200).json(conversation);
    } catch (error) {
        console.log('Error fetching chats:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

let users = [];          // online users
let emailToSocket = {};  // email: socketId
let socketToEmail = {};

io.on("connection", socket => {
    // Update the "join chat" event
    socket.on("join chat", async (data) => {
        try {
            const user = {
                'name': data.name,
                'email': data.email,
                'role': data.role,
                "id": socket.id,
                'qrataid': data.qrataid,
            };

            if (users.findIndex((user) => user.email === data.email) == -1) {
                // Add user to the users array
                users.push(user);
            } else {
                users[users.findIndex((user) => user.email === data.email)] = user;
            }

            // Save or update user in the database
            const existingUser = await User.findOne({ qrataid: data.qrataid });

            if (existingUser) {
                existingUser.name = data.name;
                existingUser.email = data.email;
                existingUser.role = data.role;
                await existingUser.save();
            } else {
                // Create a new user
                const newUser = new User({
                    name: data.name,
                    email: data.email,
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
            io.emit("all users", users);
            console.log("New user joined the chat");
        } catch (error) {
            console.log('Error joining chat:', error.message);
        }
    });

    // Update the "send message" event
    socket.on("send message", async (data) => {
        try {
            // data contains
            // - senderQrataId: qrataid of the sender => using this we can find the sender's email
            // - receiverQrataId: qrataid of the receiver
            // - senderEmail: email of the sender
            // - receiverEmail: email of the receiver
            // - content: message content
            // - timestamp: timestamp of the message

            // algo used here
            // - if the receiver is online(it will be in the users array if online), send the message to the receiver
            // - find the sender user in the db and check if there it has a conversation with the receiver... check if the contacts of sender has receiver in it
            // - if there is then add the message to the conversation 
            // - else create a new conversation and add the message to it

            // Get the sender's email based on the socket ID
            // const senderEmail = socketToEmail[socket.id];

            // Validate if senderEmail is available
            if (!data.senderEmail) {
                console.log('Error sending message: Sender email not found.');
                return;
            }

            console.log("message data", data);

            let sent = false;

            let receiverOnline = users.findIndex((user)=>user.id === data.receiverSocketId) != -1;

            
            if (receiverOnline) {
                // Receiver is online
                console.log("Receiver is online");
                // Emit the message to the receiver
                if (data.receiverSocketId) {
                    io.to(data.receiverSocketId).emit("receive message", {
                        senderEmail: data.senderEmail,
                        content: data.content,
                        receiverEmail: data.receiverEmail,
                        senderSocketId: data.senderSocketId,    // Add sender socket id here
                        receiverSocketId: data.receiverSocketId,    // Add receiver socket id here
                        timestamp: Date.now(),
                    });
                    console.log("Message distributed successfully");
                } else {
                    console.log('Error sending message: Receiver socket not found.');
                }
            }
            
            // Find the sender user in the database 
            let sender = await User.findOne({ email: data.senderEmail });
            let receiver = await User.findOne({ email: data.receiverEmail });

            console.log("sender", sender);
            console.log("receiver", receiver);
            
            // Find the receiver user in the sender contacts
            if ( sender.contacts.findIndex((contact) => contact.email === data.receiverEmail) != -1 ) {

                // Conversation exists
                console.log("Conversation exists");
                // Find the conversation
                const conversation1 = await Conversation.findOne({ users: [sender._id, receiver._id] });
                const conversation2 = await Conversation.findOne({ users: [receiver._id, sender._id] });
                console.log("conversation1", conversation1);
                console.log("conversation2", conversation2);
                let conversation = conversation1 ? conversation1 : conversation2;

                console.log("conversation", conversation);

                // Create a new message
                const message = new Message({
                    sender: sender._id,
                    senderEmail: sender.email,
                    conversation: conversation._id,
                    content: data.content,
                    timestamp: Date.now(),
                });
                // Save the message
                await message.save();
                // Update the conversation
                conversation.latestMessage = message;
                conversation.messages.push(message);
                await conversation.save();
            } else {
                // Conversation does not exist
                console.log("Conversation does not exist");

                // Create a new conversation
                const conversation = new Conversation({
                    users: [sender._id, receiver._id],
                    messages: []
                });

                // Save the conversation
                await conversation.save();
                // Create a new message
                const message = new Message({
                    sender: sender._id,
                    senderEmail: sender.email,
                    conversation: conversation._id,
                    content: data.content,
                    timestamp: Date.now(),
                });

                // Save the message
                await message.save();

                // Update the conversation
                conversation.latestMessage = message;
                conversation.messages.push(message);
                await conversation.save();

                // Update the sender contacts
                sender.contacts.push({
                    userId: receiver._id,
                    qrataid: receiver.qrataid,
                    name: receiver.name,
                    email: receiver.email,
                    conversationId: conversation._id,
                });
                receiver.contacts.push({
                    userId: sender._id,
                    qrataid: sender.qrataid,
                    name: sender.name,
                    email: sender.email,
                    conversationId: conversation._id,
                });

                sender.conversations.push(conversation._id);
                receiver.conversations.push(conversation._id);
                sender.save();
                receiver.save();
            }

        } catch (error) {
            console.error('Error sending message:', error.message);
        }
    });

    socket.on("disconnect user", async (data) => {
        try {
            // Remove user from the database
            // delete the user from users
            users = users.splice(users.findIndex((user) => user.email === data.email), 1);
            // delete the user from emailToSocket
            emailToSocket[data.email] = undefined;
            // delete the user from socketToEmail
            socketToEmail[socket.id] = undefined;
            io.emit("all users" , users);
            console.log(data.name + " disconnected");
        } catch (error) {
            console.error('Error disconnecting user:', error.message);
        }
    });
});

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
