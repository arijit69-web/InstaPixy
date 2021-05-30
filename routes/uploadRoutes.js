const router = require('express').Router()

const { isAuthenticated } = require('../middleware/authMiddleware')
const upload = require('../middleware/uploadMiddleware')
const Flash = require('../utils/Flash')

const {postImageUploadController,
    uploadProfilePics} = require('../controllers/uploadController')


    router.post(
        "/profilePics",
      upload.single('profilePics'),isAuthenticated,uploadProfilePics)
       
router.get("/profilePics",(req,res)=>{
})

router.post('/postimage',isAuthenticated,upload.single('post-image'),postImageUploadController)

module.exports = router

