const fs = require('fs')
const User = require('../models/User')
const Profile = require('../models/Profile')
const Flash = require('../utils/Flash')


exports.uploadProfilePics = async (req, res, next) => {
    if (req.file) {
        try {
            let oldProfilePics = req.user.profilePics
            let profile = await Profile.findOne({
                user: req.user._id
            })
            let profilePics = `/uploads/${req.file.filename}`
            if (profile) {
                await Profile.findOneAndUpdate({
                    user: req.user._id
                }, {
                    $set: {
                        profilePics
                    }
                })
            }
            await User.findOneAndUpdate({
                _id: req.user._id
            }, {
                $set: {
                    profilePics
                }
                })
            
            if (oldProfilePics !== '/uploads/default.jpg') {
                fs.unlink(`public${oldProfilePics}`, err => {
                    if (err) console.log(err)
                })
            }
            res.send(`<script>alert("✅Profile Picture Uploded Successfully!!✅"); window.location.href = "/dashboard/create-profile"; </script>`);

    //   res.render('pages/dashboard/create-profile', {
    //       title: 'Create Your Profile',
    //       error: {},
    //       flashMessage: Flash.getMessage(req),
    //       profile
    //   })
        } catch (e) {
            console.log(e)
           next(e)
        }
    } else {
        res.send(`<script>alert("⚠️Please Upload a Photo First⚠️"); window.location.href = "/dashboard/create-profile"; </script>`);

    }
}
exports.postImageUploadController=(req,res,next)=>{
    if(req.file){
           return res.status(200).json({
                imgUrl:`/uploads/${req.file.filename}`
            })
      
    }
    else{
   return res.send(`<script>alert("⚠️Server Error Occured⚠️"); window.location.href = "/dashboard/create-profile"; </script>`);
    }
}

