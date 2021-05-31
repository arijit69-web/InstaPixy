const Flash = require("../utils/Flash");
const readinTime=require('reading-time')
const post=require("../models/Post")
const { validationResult } = require("express-validator");
const errorFormatter = require("../utils/validationErrorFormatter");
const Post = require("../models/Post");
const Profile=require("../models/Profile");
const { request } = require("express");
exports.createPostGetController = async(req, res, next) => {
  let profile = await Profile.findOne({ user: req.user._id })
  if (!profile) {
      return res.redirect('/dashboard/create-profile')
  }
  res.render("pages/dashboard/post/createPost", {
    title: "Create a New Post",
    error: {},
    flashMessage: Flash.getMessage(req),
    value: {},
  });
};
exports.createPostPostController = async(req, res, next) => {
  let errors = validationResult(req).formatWith(errorFormatter);
  let { title, body, tags } = req.body;

  if (!errors.isEmpty()) {
    res.render("pages/dashboard/post/createPost", {
      title: "Create a New Post",
      error: errors.mapped(),
      flashMessage: Flash.getMessage(req),
      value: {
        title,
        body,
        tags,
      },
    });
  }
  else{
  if(tags)
  {
    tags=tags.split(',')
    tags=tags.map(t=>t.trim())

  }
  let readTime=readinTime(body).text
let post=new Post({
  title,
  body,
  tags,
  author:req.user._id,
  thumbnail:"",
  readTime,
  likes:[],
  dislikes:[],
  comments:[]
})
if(req.file)
{
  post.thumbnail=`/uploads/${req.file.filename}`
}
try{
  let createPost=await post.save()
  await Profile.findOneAndUpdate({
    user:req.user._id
  }
  ,
  {$push:{'posts':createPost._id}}
  )
  req.flash('success','Post Created Successfully')
return res.redirect(`/posts/edit/${createPost._id}`)
}
catch(e)
{
  next(e)
}
  
  }
};

exports.editPostGetController=async (req,res,next)=>{
  let postId=req.params.postId
  try{
  let post= await Post.findOne({author:req.user._id,_id:postId})

  if(!post)
  {
    let error=new Error('404 Page Not Found')
    error.status=404
    throw error
  }
 
    res.render('pages/dashboard/post/editPost',{
      title:'Edit Your Post',
      error:{},
      flashMessage:Flash.getMessage(req),
      post
    })

}catch(e)
{console.log(e)
  next(e)
}
}
exports.editPostPostController =async(req,res,next)=>{

  let errors = validationResult(req).formatWith(errorFormatter);
  let postId=req.params.postId

  let { title, body, tags } = req.body;
  
  try{
    let post= await Post.findOne({author:req.user._id,_id:postId})
    if(!post)
    {
      let error=new Error('404 Page Not Found')
      error.status=404
      throw error
    }
    if (!errors.isEmpty()) {
      res.render("pages/dashboard/post/createPost", {
        title: "Create a New Post",
        error: errors.mapped(),
        flashMessage: Flash.getMessage(req),post
       
      });
    }
  
    if(tags)
    {
      tags=tags.split(',')
      tags=tags.map(t=>t.trim())
    }
    let thumbnail=post.thumbnail
    if(req.file)
    {
thumbnail=`uploads/${req.file.filename}`
    }

   await Post.findOneAndUpdate({
      _id:post._id
    },
    {$set:{title,body,tags,thumbnail}},
    {new:true}
    )
    req.flash('success','Post Updated Successfully')
    res.redirect('/posts/edit/'+post._id)

  }catch(e)  
  {console.log(e)
    next(e)
  }
  
  
}

exports.deletePostGetController=async(req,res,next)=>{
  let {postId}=req.params

  try{
let post=await Post.findOne({author:req.user._id,_id:postId})
if(!post)
{
  let error=new Error('404 Page Not Found')
  error.status=404
  throw error
}

await Post.findOneAndDelete({_id:postId})

await Profile.findOneAndUpdate({user:req.user._id},
  {$pull:{'posts':postId}}

  )
  req.flash('success','Post Deleted Successfully')
  res.redirect('/posts')
  }catch(e)
  {
    next(e)
  }
}


exports.postsGetController=async (req,res,next)=>{
try{
  let posts=await Post.find({author:req.user._id})
  res.render('pages/dashboard/post/posts',
  {title:'My Posts',
  posts,
  flashMessage:Flash.getMessage(req)

  })

}catch(e)
{
  next(e)
}
}