const router=require('express').Router()
const{explorerGetController,singlePostGetController}=require('../controllers/exploreController')

router.get('/',explorerGetController)
router.get('/:postId', singlePostGetController)

module.exports=router