const redisClient = require('../config/redis-config');
const socketio = require('socket.io');

// Require Database Models
const userModel = require('../models/user-model');
const roomModel = require('../models/room-model');

const socketHandler = (server) => {
    const io = socketio(server, {
        transports: ['websocket'],
        pingInterval: 10000,
        pingTimeout: 5000,
    });

    io.on('connection', (socket) => {
        socket.on('join-room', async ({ roomId, userId }) => {
            const room = io.sockets.adapter.rooms.get(roomId) || new Set();

            if (room.size == 0) {
                socket.join(roomId);
                socket.emit('player-joined', { roomId, player: 'X' });

                const user = await userModel.findOne({ _id: userId });

                io.to(roomId).emit('load-waiting-window', user);
                io.emit('room-created', { roomId, user });

                const newRoom = await roomModel.create({
                    roomId: roomId,
                    username: user.username,
                    userid: user._id,
                    userPic: user.profilePic.replace('./public', ''),
                });
            } else if (room.size == 1) {
                socket.join(roomId);
                socket.emit('player-joined', { roomId, player: 'O' });
                io.to(roomId).emit('start-game', { roomId });

                const user = await userModel.findOne({ _id: userId });

                io.to(roomId).emit('load-game-board', user);
                io.emit('room-full', { roomId });

                await roomModel.findOneAndDelete({ roomId });
            }
        });

        socket.on(
            'req-sync-profile-pic',
            ({ roomId, xPlayer, oPlayer, username }) => {
                io.to(roomId).emit('sync-profile-pic', {
                    xPlayer,
                    oPlayer,
                    username,
                });
            },
        );

        socket.on('send-message', ({ roomId, messageText }) => {
            socket.to(roomId).emit('got-message', messageText);
        });

        socket.on('send-sticker', ({ roomId, sticker }) => {
            socket.to(roomId).emit('got-sticker', sticker);
        });

        socket.on('player-click', ({ index, roomId, player }) => {
            io.to(roomId).emit('make-changes', { index, player });
        });

        socket.on('increase-pts', async ({ roomId, userId }) => {
            const user = await userModel.findOneAndUpdate(
                { _id: userId },
                { $inc: { coins: 2 } },
                { new: true },
            );
            await redisClient.del(`user:${user.username}`);
            await redisClient.setEx(
                `user:${user.username}`,
                3600,
                JSON.stringify(user),
            );
        });

        socket.on('dicrease-pts', async ({ roomId, userId }) => {
            const user = await userModel.findOneAndUpdate(
                { _id: userId },
                { $inc: { coins: -1 } },
                { new: true },
            );
            await redisClient.del(`user:${user.username}`);
            await redisClient.setEx(
                `user:${user.username}`,
                3600,
                JSON.stringify(user),
            );
        });

        socket.on('next-turn', ({ nextTurn, roomId }) => {
            io.to(roomId).emit('set-turn', { nextTurn });
        });

        socket.on(
            'player-won',
            async ({ playerWon, currentPlayer, roomId, userId }) => {
                if (playerWon == currentPlayer) {
                    const user = await userModel.findOneAndUpdate(
                        { _id: userId },
                        { $inc: { coins: 2 } },
                        { new: true },
                    );
                    await redisClient.del(`user:${user.username}`);
                    await redisClient.setEx(
                        `user:${user.username}`,
                        3600,
                        JSON.stringify(user),
                    );
                } else {
                    const user = await userModel.findOneAndUpdate(
                        { _id: userId },
                        { $inc: { coins: -1 } },
                        { new: true },
                    );
                    await redisClient.del(`user:${user.username}`);
                    await redisClient.setEx(
                        `user:${user.username}`,
                        3600,
                        JSON.stringify(user),
                    );
                }
                io.to(roomId).emit('game-over', { playerWon });
            },
        );

        socket.on('draw', ({ roomId }) => {
            io.to(roomId).emit('game-draw');
        });

        socket.on('destroy-room', async (roomId) => {
            const room = io.sockets.adapter.rooms.get(roomId);

            if (room) {
                io.emit('room-full', { roomId });

                await roomModel.findOneAndDelete({ roomId });

                room.forEach((socketId) => {
                    const memberSocket = io.sockets.sockets.get(socketId);
                    if (memberSocket) {
                        memberSocket.leave(roomId);
                    }
                });
            }
        });

        socket.on('page-refreshed', () => {
            const rooms = [...socket.rooms].filter(
                (room) => room !== socket.id,
            );

            rooms.forEach((room) => {
                const roomData = io.sockets.adapter.rooms.get(room);

                io.to(room).emit('player-disconnected', {
                    socketId: socket.id,
                    roomsLen: roomData.length,
                });
            });
        });

        socket.on('disconnecting', () => {
            const rooms = [...socket.rooms].filter(
                (room) => room !== socket.id,
            );

            rooms.forEach((room) => {
                const roomData = io.sockets.adapter.rooms.get(room);

                io.to(room).emit('player-disconnected', {
                    socketId: socket.id,
                    roomsLen: roomData.length,
                });
            });
        });
    });
};

module.exports = socketHandler;
