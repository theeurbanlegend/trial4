const express = require('express');
const {  addSession, updateSession, getSession } = require('../controllers/chatControllers');
const chatRouter = express.Router();

// Save a chat message
chatRouter.post('/add', addSession);
chatRouter.post('/update/:sessionId', updateSession);

// Get all chat messages
chatRouter.get('/get/:sessionId', getSession);

module.exports = chatRouter;
