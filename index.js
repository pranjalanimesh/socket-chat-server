// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
// import io from 'socket.io-client';
// import Page from 'src/components/Page';
// import LinearProgress from '@mui/material/LinearProgress';
// import {
//   Typography,
//   Container,
//   Paper,
//   Box,
//   Grid,
//   Button,
//   Divider,
//   CircularProgress,
//   Card,
//   CardContent,
//   CardMedia,
//   createTheme,
//   ThemeProvider
// } from '@mui/material';
// import Conversations from './Conversations'; // Replace with your MyChats component
// import Chat from './Chat'; // Replace with your SingleChat component
// import { ConnectingAirportsOutlined } from '@mui/icons-material';

// const ENDPOINT = 'http://localhost:4001'; 

// const Inbox = () => {
//   const [messages, setMessages] = useState({});
//   const [selectedChat, setSelectedChat] = useState({name:"My chat", email:"default"});
//   const [notification, setNotification] = useState([]);
//   const [users, setUsers] = useState([]); // Replace with your users state
//   const [user, setUser] = useState({'name':useSelector((state) => state.authJwt.user.firstName), 'email':useSelector((state) => state.authJwt.user.email)}); 
//   const [socket, setSocket] = useState(null);

  
//   const talentId = useSelector((state) => state.authJwt.user._id);
//   const firstName = useSelector((state) => state.authJwt.user.firstName);
//   const email = useSelector((state) => state.authJwt.user.email);
  
//   console.log("user", user);
//   const handleChatSelection = (chat) => {
//     if (!messages[chat.email]){
//       messages[chat.email] = [];
//       setMessages(messages);
//     }
//     setSelectedChat(chat);
//   };
  
//   useEffect(() => {    
//     console.log("user",user);
    
//     let newSocket = io(ENDPOINT);

//     newSocket.emit('join chat', {email:email, name:firstName});

//     newSocket.on("all users", (users) => {
//       console.log("all users",users);
//       for (let i=0; i<users.length; i++){
//         if(users[i]?.email === email){
//           setUser(users[i]);
//         }
//       }
//       setUsers(users);
//     });

//     newSocket.on("receive message", (data) => {
//       console.log('receive message', data);
//       if (!messages[data.sender]){
//         messages  [data.sender] = [];
//       }
//       messages[data.sender] = [...messages[data.sender],data];
//       setMessages(messages);
//     });

//     // console.log("emitted join chat",email, firstName);
//     console.log("user connected",user)

//     setSocket(newSocket);

//     // Emit a request when the user disconnects
//     return () => {
//       newSocket.emit("disconnect user", user);
//       console.log('user disconnecting', user);
//       newSocket.disconnect(); 
//     };
//   }, []);

//   console.log('all users',users);

//   const sendMessage = async (data) => {
//     try {
//       socket.emit("send message", data);
//     } catch (error) {
//       console.error('Error sending message:', error.message);
//     }
//   };

//   return (
//     <Page title="Inbox | Minimal-UI" >
//         <Typography variant='h2' mt={10} mb={10} align='center' color='black'>Inbox</Typography>

//         <Container>
//           <Grid container spacing={3} sx={{height:700}} >
//             <Grid item xs={12} md={4} >
//               <Conversations
//                 handleChatSelection={handleChatSelection}
//                 notification={notification}
//                 setNotification={setNotification}
//                 allMessage={messages}
//                 setAllMessage={setMessages}
//                 users={users}
//                 user={user}
//                 />
//             </Grid>
//             <Grid item xs={12} md={8} >
//               <Chat
//                 selectedChat={selectedChat}
//                 notification={notification}
//                 setNotification={setNotification}
//                 user = {user}
//                 allMessage={messages}
//                 setAllMessage={setMessages}
//                 sendMessage={sendMessage}
//                 />
//             </Grid>
//           </Grid>
//         </Container>
//     </Page>
//   );
// };

// export default Inbox;

// import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import axios from 'axios';
// import io from 'socket.io-client';
// import Page from 'src/components/Page';
// import Conversations from './Conversations'; 
// import Chat from './Chat';

// const ENDPOINT = 'http://localhost:4001'; 

// const Inbox = () => {
//   const [messages, setMessages] = useState({});
//   const [selectedChat, setSelectedChat] = useState({ name: "My chat", email: "default" });
//   const [notification, setNotification] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [user, setUser] = useState({
//     'name': useSelector((state) => state.authJwt.user.firstName),
//     'email': useSelector((state) => state.authJwt.user.email),
//     'qrataid': 'your_qrataid_value_here',
//     'role': 'talent',// Add this line
    
//   });
  
//   const [socket, setSocket] = useState(null);

//   const talentId = useSelector((state) => state.authJwt.user._id);
//   const firstName = useSelector((state) => state.authJwt.user.firstName);
//   const email = useSelector((state) => state.authJwt.user.email);

//   const handleChatSelection = (chat) => {
//     if (!messages[chat.email]){
//       messages[chat.email] = [];
//       setMessages(messages);
//     }
//     setSelectedChat(chat);
//   };
  
//   useEffect(() => {    
//     let newSocket = io(ENDPOINT);

//     newSocket.emit('join chat', { email: email, name: firstName, qrataid: user.qrataid, role: user.role  });

//     newSocket.on("all users", (users) => {
//       for (let i = 0; i < users.length; i++) {
//         if (users[i]?.email === email) {
//           setUser(users[i]);
//         }
//       }
//       setUsers(users);
//     });

//     newSocket.on("receive message", (data) => {
//       if (!messages[data.sender]){
//         messages[data.sender] = [];
//       }
//       messages[data.sender] = [...messages[data.sender], data];
//       setMessages(messages);
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.emit("disconnect user", user);
//       newSocket.disconnect(); 
//     };
//   }, []);

//   const sendMessage = async (data) => {
//     try {
//       socket.emit("send message", data);
//     } catch (error) {
//       console.error('Error sending message:', error.message);
//     }
//   };

//   return (
//     <Page title="Inbox | Minimal-UI">
//       {/* ... */}
//       <Conversations
//         handleChatSelection={handleChatSelection}
//         notification={notification}
//         setNotification={setNotification}
//         allMessage={messages}
//         setAllMessage={setMessages}
//         users={users}
//         user={user}
//       />
//       <Chat
//         selectedChat={selectedChat}
//         notification={notification}
//         setNotification={setNotification}
//         user={user}
//         allMessage={messages}
//         setAllMessage={setMessages}
//         sendMessage={sendMessage}
//       />
//       {/* ... */}
//     </Page>
//   );
// };

// export default Inbox;
// Import necessary modules
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import Page from 'src/components/Page';
import Conversations from './Conversations'; 
import Chat from './Chat';


// Define the server endpoint
const ENDPOINT = 'http://localhost:4001';

// Inbox component
const Inbox = () => {
  const [messages, setMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState({ name: "My chat", email: "default" });
  const [notification, setNotification] = useState([]);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({
    'name': useSelector((state) => state.authJwt.user.firstName),
    'email': useSelector((state) => state.authJwt.user.email),
    'qrataid': 'your_qrataid_value_here',
    'role': 'talent', // Add this line
  });
  
  const [socket, setSocket] = useState(null);

  const talentId = useSelector((state) => state.authJwt.user._id);
  const firstName = useSelector((state) => state.authJwt.user.firstName);
  const email = useSelector((state) => state.authJwt.user.email);

  // Function to handle chat selection
  const handleChatSelection = (chat) => {
    if (!messages[chat.email]){
      messages[chat.email] = [];
      setMessages(messages);
    }
    setSelectedChat(chat);
  };
  
  useEffect(() => {    
    // Create a new socket connection
    let newSocket = io(ENDPOINT);

    // Emit 'join chat' event with user data, including 'role'
    newSocket.emit('join chat', {
      email: email,
      name: firstName,
      qrataid: user.qrataid,
      role: user.role,
    });

    // Listen for 'all users' event and update the state
    newSocket.on("all users", (users) => {
      for (let i = 0; i < users.length; i++) {
        if (users[i]?.email === email) {
          setUser(users[i]);
        }
      }
      setUsers(users);
    });

    // Listen for 'receive message' event and update the state
    newSocket.on("receive message", (data) => {
      if (!messages[data.sender]){
        messages[data.sender] = [];
      }
      messages[data.sender] = [...messages[data.sender], data];
      setMessages(messages);
    });

    // Set the socket state
    setSocket(newSocket);

    // Clean up the socket connection when the component unmounts
    return () => {
      newSocket.emit("disconnect user", user);
      newSocket.disconnect(); 
    };
  }, []);

  // Function to send a message
  const sendMessage = async (data) => {
    try {
        socket.emit("send message", data);
        console.log("Message sent from frontend:", data);
    } catch (error) {
        console.error('Error sending message from frontend:', error.message);
    }
};


  // Render the Inbox component
  return (
    <Page title="Inbox | Minimal-UI">
      <Conversations
        handleChatSelection={handleChatSelection}
        notification={notification}
        setNotification={setNotification}
        allMessage={messages}
        setAllMessage={setMessages}
        users={users}
        user={user}
      />
      <Chat
        selectedChat={selectedChat}
        notification={notification}
        setNotification={setNotification}
        user={user}
        allMessage={messages}
        setAllMessage={setMessages}
        sendMessage={sendMessage}
      />
    </Page>
  );
};

// Export the Inbox component
export default Inbox;
