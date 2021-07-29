const bcrypt = require("bcrypt");
var nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");
const Flash = require("../utils/Flash");

const User = require("../models/User");
const errorFormatter = require("../utils/validationErrorFormatter");

exports.signupGetController = (req, res, next) => {
  res.render("pages/auth/signup", {
    title: "Create A New Account",
    error: {},
    value: {},
    flashMessage: Flash.getMessage(req),
  });
};

exports.signupPostController = async (req, res, next) => {
  let { username, email, password } = req.body;

  let errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    req.flash("fail", "Please Check Your Form");
    return res.render("pages/auth/signup", {
      title: "Create A New Account",
      error: errors.mapped(),
      value: {
        username,
        email,
        password,
      },
      flashMessage: Flash.getMessage(req),
    });
  }

  try {
    let hashedPassword = await bcrypt.hash(password, 11);

    let user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();
    req.flash("success", "User Created Successfully");
    res.redirect("/auth/login");
  } catch (e) {
    next(e);
  }
};

exports.loginGetController = (req, res, next) => {
  res.render("pages/auth/login", {
    title: "Login to Your Account",
    error: {},
    flashMessage: Flash.getMessage(req),
  });
};

exports.loginPostController = async (req, res, next) => {
  let { email, password } = req.body;

  let errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    req.flash("fail", "Please Check Your Form");
    return res.render("pages/auth/login", {
      title: "Login to Your Account",
      error: errors.mapped(),
      flashMessage: Flash.getMessage(req),
    });
  }

  try {
    let user = await User.findOne({
      email,
    });
    if (!user) {
      req.flash("fail", "Please Provide Valid Credentials");
      return res.render("pages/auth/login", {
        title: "Login to Your Account",
        error: {},
        flashMessage: Flash.getMessage(req),
      });
    }

    let match = await bcrypt.compare(password, user.password);
    if (!match) {
      req.flash("fail", "Please Provide Valid Credentials");
      return res.render("pages/auth/login", {
        title: "Login to Your Account",
        error: {},
        flashMessage: Flash.getMessage(req),
      });
    }
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        console.log(err);
        return next(err);
      }
      req.flash("success", "Successfully Logged In");
      res.redirect("/dashboard/create-profile");
    });
  } catch (e) {
    next(e);
  }
};

exports.logoutController = (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    return res.redirect("/auth/login");
  });
};
exports.changePasswordGetController = async (req, res, next) => {
  res.render("pages/auth/changePassword", {
    title: "Change My Password",
    flashMessage: Flash.getMessage(req),
  });
};

exports.changePasswordPostController = async (req, res, next) => {
  let { oldPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    req.flash("fail", "Password Does Not Match");
    return res.redirect("/auth/change-password");
  }

  try {
    let match = await bcrypt.compare(oldPassword, req.user.password);
    if (!match) {
      req.flash("fail", "Invalid Old Password");
      return res.redirect("/auth/change-password");
    }

    let hash = await bcrypt.hash(newPassword, 11);
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { password: hash } }
    );
    req.flash("success", "Password Updated Successfully");
    return res.redirect("/auth/change-password");
  } catch (e) {
    next(e);
  }
};

exports.forgetPasswordGetController = (req, res, next) => {
  res.render("pages/auth/forgetPassword", {
    title: "Retrieve Your Password",
    error: {},
    flashMessage: Flash.getMessage(req),
  });
};

const JWT_SECRET = "9e535f56ba53738ed24d6f97f5a3f1277c688394";

exports.forgetPasswordPostController = async (req, res, next) => {
  const { email } = req.body;
  let errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    req.flash("fail", "Please Check Your Form");
    return res.render("pages/auth/forgetPassword", {
      title: "Retrieve Your Password",
      error: errors.mapped(),
      flashMessage: Flash.getMessage(req),
    });
  }

  try {
    let user = await User.findOne({
      email,
    });
    if (!user) {
      req.flash("fail", "Please Enter Registered Email Address");
      return res.render("pages/auth/forgetPassword", {
        title: "Retrieve Your Password",
        error: {},
        flashMessage: Flash.getMessage(req),
      });
    }
    const secret = JWT_SECRET + user.password;
    const payload = {
      email: user.email,
      id: user.id,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "15m" });
    const link = `http://localhost/auth/resetpassword/${user.id}/${token}`;

    var transporter = nodemailer.createTransport({
      service: "gmail",

      auth: {
        user: "19bcs1705@gmail.com",
        pass: "arijiT@1705",
      },
    });

    var mailOptions = {
      from: "19bcs1705@gmail.com",
      to: email,
      subject: "Link for Password Retrieval",
      text: link,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    console.log(link);
    req.flash("success", "OTP Link Sent | Valid for 15mins");

    res.redirect("/auth/forgotPassword");
  } catch (e) {
    next(e);
  }
};

exports.resetPasswordGetController = async (req, res, next) => {
  let queryStr = req.params;
  try {
    const { id, token } = req.params;
    let user = await User.findOne({
      _id: id,
    });
    if (!user) {
      req.flash("fail", "Link is Invalid");
      return res.render("pages/auth/forgetPassword", {
        title: "Retrieve Your Password",
        error: {},
        flashMessage: Flash.getMessage(req),
      });
    }
    if (id != user._id) {
      req.flash("fail", "Link is Invalid");
      return res.render("pages/auth/forgetPassword", {
        title: "Retrieve Your Password",
        error: {},
        flashMessage: Flash.getMessage(req),
      });
    }
    const secret = JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);

    res.render("pages/auth/resetPassword", {
      title: "Reset Your Password",
      error: {},
      flashMessage: Flash.getMessage(req),
      queryStr,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.resetPasswordPostController = async (req, res, next) => {
  let queryStr = req.params;

  let { newPassword, confirmPassword } = req.body;
  let { id, token } = req.params;
  try {
    let user = await User.findOne({
      _id: id,
    });
    if (!user) {
      req.flash("fail", "Link is Invalid | Password Not Updated");
      return res.render("pages/auth/forgetPassword", {
        title: "Retrieve Your Password",
        error: {},
        flashMessage: Flash.getMessage(req),
      });
    }
    if (id != user._id) {
      req.flash("fail", "Link is Invalid | Password Not Updated");
      return res.render("pages/auth/forgetPassword", {
        title: "Retrieve Your Password",
        error: {},
        flashMessage: Flash.getMessage(req),
      });
    }
    if (newPassword !== confirmPassword) {
      req.flash("fail", "Password Does Not Match");
      return res.render("pages/auth/resetpassword", {
        title: "Retrieve Your Password",
        error: {},
        flashMessage: Flash.getMessage(req),
        queryStr,
      });
    }
    const secret = JWT_SECRET + user.password;
    const payload = jwt.verify(token, secret);

    let hash = await bcrypt.hash(newPassword, 11);
    await User.findOneAndUpdate({ _id: id }, { $set: { password: hash } });
    req.flash("success", "Password Updated Successfully");
    return res.redirect("/auth/login");
  } catch (e) {
    console.log(e);
    next(e);
  }
};
