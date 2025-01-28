const userModel = require('../models/user-model');
const roomModel = require('../models/room-model');

const usersApiRout = async (req, res)=>{
    const regExpUsername = new RegExp(`^${req.params.username}$`, 'i');

    const user = await userModel.findOne({ username: regExpUsername });

    if(!user) return res.status(404).json({ errorCode: 404,  message: 'User not found!' });

    res.status(200).json(user);
}

const leaderboardApiRout = async (req, res)=>{

    const users = await userModel.find({}).sort({coins: -1}).limit(10);

    if(!users) return res.status(404).json({ errorCode: 404, message: 'Users not found!' });

    res.status(200).json(users)
}

const waitingRoomsApiRout = async (req, res)=>{
    const rooms = await roomModel.find({});

    if(!rooms) return res.status(404).json({ errorCode: 404, message: 'Rooms not found!' });

    res.status(200).json(rooms);    
}

module.exports = { usersApiRout, leaderboardApiRout, waitingRoomsApiRout };