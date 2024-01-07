const { MongoClient, GridFSBucket } = require('mongodb');
const Post=require('../models/postSchema')
const mongoose = require('mongoose');
const multer = require('multer');
const fs=require('fs')

require('dotenv').config();
const mongoClient = new MongoClient(process.env.MONGO_URI)
const conn = mongoose.createConnection(process.env.MONGO_URI);

let gfs;

conn.once('open', async() => {
  console.log('File Upload Online!');
  await mongoClient.connect().then(()=>{
    console.log('Db ready for file Upload!')
  })
  // Initialize GridFSBucket
  const db = mongoClient.db('test'); // Replace with your actual database name
  gfs = new GridFSBucket(db);
});

//const upload = multer({ dest: 'temp/' });
const upload = multer({ storage: multer.memoryStorage() });

const addPost = async (req, res) => {
  const { poster, postTitle, postSummary ,category} = req.body;
  if (!poster || !postTitle || !postSummary  || !req.file) {
    return res.status(400).json({ msg: 'Inadequate post data or missing file' });
  }
  const file = req.file;
 // Access file buffer directly
 const fileBuffer = file.buffer;

  // Create a write stream to GridFS
  const writeStream = gfs.openUploadStream(file.originalname, {
    metadata: {
      // Use mongoose.mongo.ObjectId
      _id: new mongoose.mongo.ObjectId(),
    },
  });
  // Log progress for writing data to the database
  let progress = 0;
  

// Write the file buffer to the stream
  writeStream.end(fileBuffer);
  writeStream.on('data', (chunk) => {
    progress += chunk.length;
    const totalSize = writeStream.s.currentSize;
    const percent = Math.round((progress / totalSize) * 100);
    console.log(`Database Write Progress: ${percent}%`);
  });
  // Handle errors
  writeStream.on('error', (err) => {
    console.error(err);
    return res.status(500).json({ msg: 'Internal Server Error' });
  });

  writeStream.on('finish', async () => {
    const post = new Post({
      poster,
      postTitle,
      postSummary,
      likes:0,
      file: { filename: file.originalname },
      category,
    });

    try {
      await post.save();
      console.log("Post upload successful!")
      return res.status(201).json({ msg: 'New post added!' });
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: 'Internal Server Error' });
    }
  });
};

const addPostWithUpload = (req, res, next) => {
  upload.single('files')(req, res, (err) => {
    if (err) {
      return res.status(500).json({ msg: 'File upload error' });
    }
    addPost(req, res, next);
  });
};

const addLike = async(req, res) => {
  const {id}=req.params
    
    if(!id||!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({msg:"no or invalid id!"})
    }
    const post=await Post.findOne({_id:id})
    if(!post){
        return res.status(404).json({msg:"No post data found!"})
    }
    return res.status(200).json(post)
};
const removeLike = async(req, res) => {
  const {id}=req.params
    
    if(!id||!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({msg:"no or invalid id!"})
    }
    const post=await Post.findOne({_id:id})
    if(!post){
        return res.status(404).json({msg:"No post data found!"})
    }
    return res.status(200).json(post)
};




// const getPost=async (req,res)=>{
//     const {id}=req.params
    
//     if(!id||!mongoose.Types.ObjectId.isValid(id)){
//         return res.status(404).json({msg:"no or invalid id!"})
//     }
//     const post=await Post.findOne({_id:id})
//     if(!post){
//         return res.status(404).json({msg:"No post data found!"})
//     }
//     return res.status(200).json(post)
// }
// const getMostRecentPost=async (req,res)=>{
//     const mostRecentEntry = await Post.findOne().sort({ createdAt: -1 }).limit(1)

//     if (mostRecentEntry) {
//     // The mostRecentEntry variable now contains the most recent document
    
//     return res.status(200).json(mostRecentEntry)
//     } else {
//     // Handle the case where there are no entries in the collection
    
//     return res.status(404).json({msg:"no entries"})
//     }

// }
const getAllPosts=async(req,res)=>{
    const posts=await Post.find()
    if(!posts||posts.length===0){
        return res.status(404).json({msg: "No post Data to show!"})
    }

    res.status(200).json(posts)

}
// const deletePost=async(req,res)=>{
//     const {id}=req.params
    
//     if(!id||!mongoose.Types.ObjectId.isValid(id)){
//         return res.status(404).json({msg:"no or invalid id!"})
//     }
//     const post=await Post.findOneAndDelete({_id:id})
//     if(!post){
//         return res.status(404).json({msg:"No post data found!"})
//     }
//     return res.status(200).json(post)
// }
const getPost = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ msg: 'No or invalid id!' });
  }

  try {
    const file = await gfs.find({ _id: mongoose.Types.ObjectId(id) }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({ msg: 'No post data found!' });
    }

    return res.status(200).json(file[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Internal Server Error' });
  }
};
const getMostRecentPost = async (req, res) => {
  try {
    const mostRecentEntry = await gfs.find().sort({ uploadDate: -1 }).limit(1).toArray();
    
    if (mostRecentEntry.length > 0) {
      return res.status(200).json(mostRecentEntry[0]);
    } else {
      return res.status(404).json({ msg: 'No entries' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Internal Server Error' });
  }
};

// const getAllPosts = async (req, res) => {
//   try {
//     const posts = await gfs.find().toArray();
//     console.log(posts)
//     if (!posts || posts.length === 0) {
//       return res.status(404).json({ msg: 'No post data to show!' });
//     }

//     return res.status(200).json(posts);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ msg: 'Internal Server Error' });
//   }
// };

const getImage = async(req, res) => {
  const filename = req.params.filename;

  if (!filename) {
    console.log('Filename not provided!')
    return res.status(400).json({ msg: 'Filename not provided' });
  }

  // Retrieve the file from GridFS
  const readStream = gfs.openDownloadStreamByName(filename);

  // Set the proper content type for the response
  res.set('Content-Type', 'image/jpeg'); // Adjust the content type based on your image format

  // Pipe the image stream to the response
  readStream.pipe(res);

  // Handle errors
  readStream.on('error', (err) => {
    console.error('Error reading image:', err);
    res.status(500).json({ msg: 'Internal Server Error' });
  });
};
const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ msg: 'No or invalid id!' });
  }

  try {
    const file = await gfs.find({ _id: mongoose.Types.ObjectId(id) }).toArray();
    
    if (!file || file.length === 0) {
      return res.status(404).json({ msg: 'No post data found!' });
    }

    await gfs.deleteOne({ _id: mongoose.Types.ObjectId(id) });

    return res.status(200).json(file[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: 'Internal Server Error' });
  }
};



module.exports = {
  addPost:addPostWithUpload,
  getAllPosts,
  getImage,
  addLike,
  removeLike,
  getPost,
  getMostRecentPost,
  deletePost
};