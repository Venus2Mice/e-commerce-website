import app from './app';
import connectToDataBase from './config/connectDb';
import { Server } from 'socket.io';
import { createServer } from 'node:http';
import socketService from './middleware/SocketIO';
require('dotenv').config();

connectToDataBase();

//socketService
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.REACT_URL || 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true,
        allowEIO3: true
    }
});

socketService(io);

//Connect
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(">>> Backend is running on the port = " + PORT);
});