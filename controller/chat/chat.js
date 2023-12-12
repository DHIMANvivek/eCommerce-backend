const express = require('express');
const UserModel = require('../../models/users');
const app = express();
const socketIO = require('socket.io');
const httpServer = require('http').createServer(app);
const jwtVerify = require('../../middlewares/jwtVerify');
const ChatModel = require('../../models/chat/chat');
const { writeFile } =  require("fs");

const io = socketIO(httpServer);

io.use(jwtVerify);

const allOnlineUsers = async (req, res) => {
    try {
        const onlineUsers = await UserModel.find({ is_online: 'true', role: 'user' });
        res.json(onlineUsers);
    } catch (error) {
        console.error('Error retrieving online users:', error);
        throw error;
    }
 };

const chatSocket = async (socket) => {
    // console.log('A user connected to /chat namespace.');
    socket.emit('message', "how may i help you?");
    const cookieString = JSON.stringify(socket.handshake.headers.cookie);
    if(!cookieString) {
    return;
    }
    const cookiePairs = cookieString.split(';');
    const userTokenPair = cookiePairs.find(pair => pair.includes('userToken'));

    let userToken = null;
    if (userTokenPair) {
        const keyValue = userTokenPair.split('=');
        userToken = keyValue[1];
    }
    if(!userToken) {
        // console.log('No user token found');
        return;
    }
    const parts = userToken.split('.');

    const encodedPayload = parts[1];
    const decodedPayload = atob(encodedPayload);
    const id = JSON.parse(decodedPayload).id;
    const role = JSON.parse(decodedPayload).role;

    socket.on('newMessage', async (message) => {
        console.log('Received new message:', message);

        socket.emit('userMessages', message);

        if (role === 'user') {
            // Update is_online to true when a new message is received
            UserModel.findByIdAndUpdate(id, { $set: { is_online: true } }, { new: true })
                .exec()
                .then((doc) => {
                    console.log('Updated User:', doc);
                })
                .catch((err) => {
                    console.log('Something went wrong when updating data:', err);
                });

            // Save the message to the database
            const newMessage = new ChatModel({
                sender: id,
                receiver: '652b9c1480dd9b13abd5ee3a',
                message: message,
                createdAt: new Date(), 
            });

            try {
                const savedMessage = await newMessage.save();
                socket.emit('userMessage', savedMessage);
                socket.broadcast.emit('getChatDetail', true);
                io.to('admin').emit('newMessage', savedMessage.message);

                console.log('Message saved successfully:', savedMessage);
            } catch (err) {
                console.log('Error saving message:', err);
                throw err;
            }
          }

        socket.on('disconnect', () => {
            console.log('User disconnected');
            UserModel.findByIdAndUpdate(id, { $set: { is_online: false } }, { new: true })
                .exec()
                .then((doc) => {
                    console.log('Updated User:', doc);
                })
                .catch((err) => {
                    console.log('Something went wrong when updating data:', err);
                });
            });
    });

    socket.on('replyMessage', async (message) => {
        console.log('Received new  message:', message);
            try {
        
            } catch (err) {
                console.log('Error saving message:', err);
                throw err;
            }
        socket.broadcast.emit('replymessage', message);
    });
    
    socket.on('receivedUserMessage', async (message) => {
        console.log('Received new user message:', message);
        socket.broadcast.emit('receivedUserMessage', message);
    });

    socket.on('saveadminMessage', async (message) => {
        console.log('Received new admin2 message:', message);

        socket.broadcast.emit('saveadminMessage', message);

            try {
             const newMessage = new ChatModel({
                sender: '652b9c1480dd9b13abd5ee3a',
                receiver: message.receiver,
                adminMessage: message.message,
                createdAt: new Date(), 
            });

            console.log('Message saved successfully:', newMessage);

                const savedMessage = await newMessage.save();

        
        socket.broadcast.emit('loadadminNewChat', message);
        }
        catch (err) {
            console.log('Error saving message:', err);
            throw err;
        }
    });

    socket.on('existChat', async (message) => {
        console.log('Received sender id :', message);
        var userchats = await ChatModel.find({ sender: message, receiver: '652b9c1480dd9b13abd5ee3a' })
        var adminchats = await ChatModel.find({ sender: '652b9c1480dd9b13abd5ee3a', receiver: message });
        console.log('Received new user message:', userchats);
        console.log('Received new admin message:', adminchats);

        if(userchats) {
            socket.emit('loadExistChat', userchats);
            socket.emit('loadadminExistChat', adminchats);
        }
    });

    socket.on("upload", (file, callback) => {
        console.log(file);
        writeFile("/tmp/upload", file, (err) => {
          callback({ message: err ? "failure" : "success" });
        });
      });

    // chatting implementation
    socket.on('newChat', async (message) => {
        console.log('Received new user message:', message);
        socket.broadcast.emit('loadNewChat', message);
    });
    
    socket.emit('welcomeMessage', 'Welcome to the chat!');
};

app.use(express.raw({ type: 'application/json' }));

module.exports = {
    chatSocket,
    allOnlineUsers
};
