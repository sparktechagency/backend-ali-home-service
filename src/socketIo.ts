// socketIO.js
import { Server as HttpServer } from "http";
import { Server } from "socket.io";
const initializeSocketIO = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
    // reconnection: true,
    // reconnectionAttempts: 3, // Number of reconnection attempts
    // reconnectionDelay: 1000, // Delay in milliseconds between reconnection attempts
  });
  io.on("connection", (socket) => {
    console.log("connected", socket?.id);
    socket.on("message", (message) => {
      console.log(message);
    });
    socket.on("disconnect", () => {
      console.log(`ID: ${socket.id} disconnected`);
    });
    // Additional Socket.IO event handlers can be added here
  });
  return io;
};

export default initializeSocketIO;
