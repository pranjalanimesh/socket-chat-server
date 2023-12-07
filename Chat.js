// SingleChat.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import io from 'socket.io-client';
import Page from 'src/components/Page';
import {
  Typography,
  Container,
  Box,
  Grid,
  Button,
  Divider,
  TextField
} from '@mui/material';

const Chat = ({
  selectedChat,
  user,
  allMessage,
  setAllMessage,
  sendMessage
}) => {

  const [newMessage, setNewMessage] = useState('');

  const handleTextFieldChange = (e) => {
    setNewMessage(e.target.value);
  };

  const handleEnterPress = (e) => {
    if (e.keyCode == 13) {
      sendMessageChat();
    }
  }

  const sendMessageChat = () => {
    try {
      if (newMessage.trim() === '') {
        setNewMessage('');
        return;
      }

      const data = {
        'content': newMessage,
        'sender': user.email,
        'receiver': selectedChat.email,
        'senderId': user.id,
        'receiverId': selectedChat.id,
        'timestamp': Date.now() // Add timestamp here
      };

      allMessage[selectedChat.email] = [...allMessage[selectedChat.email], data];
      sendMessage(data);
      setAllMessage(allMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  };

  if (selectedChat.email === 'default') {
    return (
      <Container>
        <Typography variant="h4" color='black'>Default Chat</Typography>
        <Divider />
      </Container>
    )
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ color: "black" }}>{selectedChat.name}</Typography>
      <Divider />
      <Box sx={{ height: 500, background: 'yellow' }}>
        {allMessage[selectedChat.email].map((message, index) =>
          (
            <div key={index} style={{ textAlign: message.sender === user.email ? 'right' : 'left', color: 'black' }}>
              {message.content}
              <br />
              <span style={{ fontSize: '0.7em' }}>
                {message.sender === user.email ? 'You' : selectedChat.name}</span>
              <br />
              {/* Display the timestamp */}
              <span style={{ fontSize: '0.7em' }}>Sent at: {new Date(message.timestamp).toLocaleString()}</span>
            </div>
          ))}
      </Box>

      <Box>
        <TextField
          id="outlined-basic"
          variant="filled"
          sx={{ width: 630, alignContent: "flex-end" }}
          value={newMessage}
          onChange={handleTextFieldChange}
          onKeyDown={handleEnterPress} />

        <Button onClick={sendMessageChat}>Send</Button>
      </Box>
    </Container>
  );
};

export default Chat;
