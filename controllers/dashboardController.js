const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

const Flash = require("../utils/Flash");
const User = require("../models/User");
const Profile = require("../models/Profile");
const errorFormatter = require("../utils/validationErrorFormatter");

exports.dashboardGetController = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.redirect("/dashboard/create-profile");
    }
    if (profile) {
      return res.render("/explorer", {
        title: "InstaPixy - Home",
        flashMessage: Flash.getMessage(req),
      });
    }

    res.redirect("/dashboard/create-profile");
  } catch (e) {
    next(e);
  }
};

exports.createProfileGetController = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({
      user: req.user._id,
    });
    if (profile) {
      return res.redirect("/dashboard/edit-profile");
    }

    res.render("pages/dashboard/create-profile", {
      title: "Create Your Profile",
      flashMessage: Flash.getMessage(req),
      error: {},
    });
  } catch (e) {
    next(e);
  }
};

exports.createProfilePostController = async (req, res, next) => {
  let errors = validationResult(req).formatWith(errorFormatter);

  if (!errors.isEmpty()) {
    return res.render("pages/dashboard/create-profile", {
      title: "Create Your Profile",
      flashMessage: Flash.getMessage(req),
      error: errors.mapped(),
    });
  }

  let { name, title, bio, website, facebook, twitter, github } = req.body;

  try {
    let profile = new Profile({
      user: req.user._id,
      name,
      title,
      bio,
      profilePics: req.user.profilePics,
      links: {
        website: website || "",
        facebook: facebook || "",
        twitter: twitter || "",
        github: github || "",
      },
      posts: [],
      bookmarks: [],
    });

    let createdProfile = await profile.save();
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { profile: createdProfile._id } }
    );

    req.flash("success", "Profile Created Successfully");
    res.redirect("/explorer");
  } catch (e) {
    next(e);
  }
};

exports.editProfileGetController = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.redirect("/dashboard/create-profile");
    }

    res.render("pages/dashboard/edit-profile", {
      title: "Edit Your Profile",
      error: {},
      flashMessage: Flash.getMessage(req),
      profile,
    });
  } catch (e) {
    next(e);
  }
};

exports.editProfilePostController = async (req, res, next) => {
  let errors = validationResult(req).formatWith(errorFormatter);

  let { name, title, bio, website, facebook, twitter, github } = req.body;

  if (!errors.isEmpty()) {
    return res.render("pages/dashboard/create-profile", {
      title: "Edit Your Profile",
      flashMessage: Flash.getMessage(req),
      error: errors.mapped(),
      profile: {
        name,
        title,
        bio,
        links: {
          website,
          facebook,
          twitter,
          github,
        },
      },
    });
  }

  try {
    let profile = {
      name,
      title,
      bio,
      links: {
        website: website || "",
        facebook: facebook || "",
        twitter: twitter || "",
        github: github || "",
      },
    };

    let updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { $set: profile },
      { new: true }
    );
    req.flash("success", "Profile Updated Successfully");
    res.render("pages/dashboard/edit-profile", {
      title: "Edit Your Profile",
      error: {},
      flashMessage: Flash.getMessage(req),
      profile: updatedProfile,
    });
  } catch (e) {
    next(e);
  }
};
exports.bookmarksGetController = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({
      user: req.user._id,
    });

    if (!profile) {
      return res.redirect("/dashboard/create-profile");
    }

    profile = await Profile.findOne({
      user: req.user._id,
    }).populate({
      path: "bookmarks",
      model: "Post",
      select: "title thumbnail",
    });
    res.render("pages/dashboard/bookmarks", {
      title: "My Bookmarks",
      flashMessage: Flash.getMessage(req),
      posts: profile.bookmarks,
    });
  } catch (e) {
    next(e);
  }
};

exports.deleteProfileGetController = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({
      user: req.user._id,
    });
    if (!profile) {
      return res.redirect("/dashboard/create-profile");
    }

    res.render("pages/auth/deleteAccount", {
      title: "Delete Your Profile",
      flashMessage: Flash.getMessage(req),
      error: {},
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
};
exports.deleteProfilePostController = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({
      user: req.user._id,
    });
    if (!profile) {
      return res.redirect("/dashboard/create-profile");
    }

    let match = await bcrypt.compare(req.body.password, req.user.password);
    if (match) {
      newPassword = req.body.password + "_UserDeleted_";

      let hash = await bcrypt.hash(newPassword, 11);
      await User.findOneAndUpdate(
        { _id: req.user._id },
        {
          $set: {
            password: hash,
            profilePics: "/uploads/Unavailable.png",
          },
        },

        { new: true }
      );
      await Profile.findOneAndUpdate(
        { user: req.user._id },
        {
          $set: {
            title: "🚫User Unavailable🚫",
            bio: "🚫User Unavailable🚫",
            name: "InstaPixy User",
          },
          links: {},
        },

        { new: true }
      );

      req.session.destroy((err) => {
        if (err) {
          return next(err);
        }
        res.send(
          `<script>alert("✅Account Deleted Successfully!!✅"); window.location.href = "/explorer"; </script>`
        );
      });
    } else {
      req.flash("fail", "Invalid Password! Enter Password Correctly");
      return res.redirect("/dashboard/delete");
    }
  } catch (e) {
    console.log(e);
    next(e);
  }
};

exports.instachatgetController = async (req, res, next) => {
  try {
    let profile = await Profile.findOne({ user: req.user._id });
    if (!profile) {
      return res.redirect("/dashboard/create-profile");
    }

    res.redirect("https://instapixy-chat-app.herokuapp.com/");
  } catch (e) {
    next(e);
  }
};
