const { getAllPosts,getImage,addPost,getMostRecentPost,getPost,deletePost } = require('../controllers/Postcontrollers')


const postRoute=require('express').Router()


postRoute.get('/posts',getAllPosts)
postRoute.get('/image/:filename',getImage)
postRoute.post('/new',addPost)
postRoute.get('/recent',getMostRecentPost)
postRoute.get('/:id',getPost)
postRoute.delete('/:id',deletePost)

module.exports=postRoute



// `
// Source: Conversation with Bing, 29/12/2023
// (1) Express multer middleware. http://expressjs.com/en/resources/middleware/multer.html.
// (2) GitHub - expressjs/multer: Node.js middleware for handling multipart .... https://github.com/expressjs/multer.
// (3) Multer: Easily upload files with Node.js and Express. https://blog.logrocket.com/multer-nodejs-express-upload-file/.
// (4) Using Multer to Store Files in Express: A Comprehensive Guide. https://medium.com/@aman003malhotra/using-multer-to-store-files-in-express-a-comprehensive-guide-d1acd25ef4d5.
// (5) How to use Multer to upload files in Node.js and Express. https://dev.to/codexam/how-to-use-multer-to-upload-files-in-nodejs-and-express-2a1a.`
