
const express = require("express");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const {bindUserWithRequest}=require('./authMiddleware')
const setLocals=require('./setLocals')
const store = new MongoDBStore({
    uri: "mongodb+srv://arijit:Arijit@2000@cluster0.vbdmt.mongodb.net/details?retryWrites=true&w=majority",
  
    collection: "sessions",
    expires: 60 * 60 * 1000 * 2,
  });
  
const middleware = [
    express.static("public"),
    express.urlencoded({ extended: true }),
    express.json(),
    session({
      secret: process.env.SECRET_KEY || "SECRET_KEY",
      resave: false,
      saveUninitialized: false,
      store: store,
    }),
    bindUserWithRequest(),
    setLocals(),
    flash(),
  ];

  module.exports=app=>{
      middleware.forEach(m=>{
          app.use(m)
      })
  }