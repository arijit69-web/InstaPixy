const express = require("express");
const mongoose = require("mongoose");
const chalk  =require('chalk')
const setMiddleware=require('./middleware/middleware')
const setRoutes=require('./routes/routes')
const app = express();
const path = require("path");

//Playground Routes
// const validatorRoutes=require('./playground/validator')//Should be remove

//Setup View Engine
app.set("view engine", "ejs");
app.set("views", "views");

//Using Middleware Directory
setMiddleware(app)

//Using Routes from Routes Directory
setRoutes(app)

app.use((req,res,next)=>{
let error=new Error('404 NOT FOUND')
error.status=404
next(error)
})
app.use((error,req,res,next)=>{
if(error.status===404)
{
  return res.render('pages/error/404',{flashMessage:{},title:'⚠️404 PAGE NOT FOUND⚠️'})
}
else{
  res.render('pages/error/500',{flashMessage:{},title:'⚠️500 INTERNAL SERVER ERROR⚠️'})
}
})
// app.use('/playground',validatorRoutes)//Should be remove

const PORT = 80 || process.env.PORT;
mongoose
  .connect(
    "mongodb+srv://arijit:Arijit@2000@cluster0.vbdmt.mongodb.net/details?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }
  )
  .then(() => {


   
    
    app.listen(PORT, () => {
      console.log(chalk.cyan("Database Connected"));
      console.log(chalk.cyan("App is Starting"));
    });
  })
  .catch((e) => {
   
    return console.log(chalk.red.inverse("Error Occured"));
  });
