import { Server } from 'socket.io';

const activeRooms = new Map(); // roomCode -> Map of socketId -> { socketId, username }

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-room', ({ roomCode, username }) => {
      socket.join(roomCode);
      
      if (!activeRooms.has(roomCode)) {
        activeRooms.set(roomCode, new Map());
      }
      
      const roomUsers = activeRooms.get(roomCode);
      const userObj = { 
        socketId: socket.id, 
        username: username || `Guest #${socket.id.substring(0, 4)}` 
      };
      roomUsers.set(socket.id, userObj);

      console.log(`Socket ${socket.id} joined room ${roomCode} as ${userObj.username}`);

      io.to(roomCode).emit('room-users', Array.from(roomUsers.values()));
      socket.to(roomCode).emit('user-joined', userObj);
    });

    socket.on('text-update', ({ roomCode, content }) => {
      socket.to(roomCode).emit('text-update', content);
    });

    socket.on('file-transfer', ({ roomCode, file }) => {
      socket.to(roomCode).emit('file-transfer', file);
    });

    socket.on('cursor-move', ({ roomCode, username, position }) => {
      socket.to(roomCode).emit('cursor-move', { 
        socketId: socket.id, 
        username, 
        position 
      });
    });

    socket.on('disconnecting', () => {
      for (const roomCode of socket.rooms) {
        if (activeRooms.has(roomCode)) {
          const roomUsers = activeRooms.get(roomCode);
          const leavingUser = roomUsers.get(socket.id);
          roomUsers.delete(socket.id);
          
          if (roomUsers.size === 0) {
            activeRooms.delete(roomCode);
          } else {
            io.to(roomCode).emit('room-users', Array.from(roomUsers.values()));
            if (leavingUser) {
              io.to(roomCode).emit('user-left', leavingUser);
            }
          }
        }
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}
