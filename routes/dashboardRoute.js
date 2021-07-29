const router = require('express').Router()
const { isAuthenticated } = require('../middleware/authMiddleware')
const profileValidator = require('../validator/dashboard/profileValidator')

const {
    dashboardGetController,
    createProfileGetController,
    createProfilePostController,
    editProfileGetController,
    editProfilePostController,
    bookmarksGetController,
    deleteProfileGetController,
    deleteProfilePostController,instachatgetController
    
} = require('../controllers/dashboardController')

router.get('/bookmarks', isAuthenticated, bookmarksGetController)

router.get('/create-profile', isAuthenticated, createProfileGetController)
router.post('/create-profile', isAuthenticated, profileValidator, createProfilePostController)
router.get('/delete', isAuthenticated, deleteProfileGetController )
router.post('/delete', isAuthenticated, deleteProfilePostController )

router.get('/edit-profile', isAuthenticated, editProfileGetController)
router.get('/insta-chat', isAuthenticated, instachatgetController)

router.post('/edit-profile', isAuthenticated, profileValidator, editProfilePostController)
router.get('/', isAuthenticated, dashboardGetController)

module.exports = router