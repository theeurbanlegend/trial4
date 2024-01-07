const mongoose=require('mongoose')
const ChatSession=require('../models/chatSchema')
const addSession = async (req, res) => {
  try {
    const { senderId, receiverId, sessionId } = req.body;

    // Find session if exists
    const existingSession = await ChatSession.findOne({ sessionId: { $in: [sessionId, `${receiverId}:${senderId}`] } });

    if (existingSession) {
      return res.status(200).json({ msg: 'Existing session', session: existingSession });
    }

    // If no session found, create a new one
    const session = await ChatSession.create({ sessionId, senderId, receiverId, chatReplay: [] });

    res.status(201).json({
      message: 'Chat session created successfully',
      session,
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

  
const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { message, senderId, receiverId } = req.body;

    // Check if the session exists with the original sessionId
    let updatedSession = await ChatSession.findOne({sessionId:sessionId});

    // If not found, check with the reversed sessionId
    if (!updatedSession) {
      const reversedSessionId = `${receiverId}:${senderId}`;
      updatedSession = await ChatSession.findOne({sessionId:reversedSessionId});
    }

    if (!updatedSession) {
      return res.status(404).json({
        message: 'Chat session not found',
      });
    }

    // Add the message to the chatReplay array
    updatedSession.chatReplay.push({ message, senderId, receiverId });

    // Save the updated session
    updatedSession = await updatedSession.save();

    res.status(200).json({
      message: 'Chat session updated successfully',
      session: updatedSession,
    });
  } catch (error) {
    console.error('Error updating chat session:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};


const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const inputString = sessionId
    const splitArray = inputString.split(':');

    // Now, splitArray is an array containing both sides of the string
    const leftSide = splitArray[0];
    const rightSide = splitArray[1];
    // Check if the session exists with the original sessionId
    let session = await ChatSession.findOne({sessionId:sessionId});

    // If not found, check with the reversed sessionId
    if (!session) {
      const reversedSessionId = `${rightSide}:${leftSide}`;
      session = await ChatSession.findOne({sessionId:reversedSessionId});
    }

    if (!session) {
      return res.status(404).json({
        message: 'Chat session not found',
      });
    }

    res.status(200).json({
      session,
    });
  } catch (error) {
    console.error('Error getting chat session:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
};

module.exports = {
  getSession,
  addSession,
  updateSession,
};
