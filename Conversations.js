import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import io from 'socket.io-client';
import Page from 'src/components/Page';
import LinearProgress from '@mui/material/LinearProgress';
import {
  Typography,
  Container,
  Paper,
  Box,
  Grid,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';

const Conversations = ({ handleChatSelection, users, user, allMessage, setAllMessage }) => {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    // Replace with your actual logic to fetch user chats
    const fetchConversations = async () => {
      try {
       //ye apni api calls…backend ke hisab se
        // const response = await fetch('/api/chats');
        // const data = await response.json();
        
        // Changing the data to a static array
        const data = [{'name':'Harry', 'email':'harry@gmail.com'},
        {'name':'Shan', 'email':'shan@gmail.com'}];

        console.log('users',users);
        // for (let i=0; i<users.length; i++){
        //   if(users[i]?.email === user.email){
        //     users.remove(i);
        //   }
        // }

        setChats(users);
      } catch (error) {
        console.error('Error fetching chats:', error.message);
      }
    };

    fetchConversations();
  }, []); // sayad refresh karana hoga

  console.log("user mail convo",user.email);

  return (
    <Container>
      <Typography variant="h4" sx={{color:"black"}}>Conversations</Typography>
      <Divider />
      <Box>
        {users.filter((us) => us.email != user.email).map((chat) => (
          <Box sx={{color:"black", cursor:"pointer"}} key={chat.id} onClick={() => handleChatSelection(chat)}>
            <Typography variant="h5">{chat.name}</Typography>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default Conversations;
