require('dotenv').config();
const express = require("express");
const ejsMate= require("ejs-mate");
const wrapAsync= require("./wrapAsync");
const Listingcontrol= require("../controller/listing");
const multer = require("multer");
const{storage} = require("../cloudConfig");
const passport = require("passport"); // framework of authentication
const upload = multer({storage});


const listingRoute  = express.Router({mergePramas: true});
const userRoute = express.Router({mergeParams: true});


listingRoute.route("/home")
.get(wrapAsync( Listingcontrol.index));
listingRoute.route("/new")
.get( wrapAsync(Listingcontrol.AddNewList));
listingRoute.route("/added")
.post(
    upload.single("image"),
    wrapAsync(
    Listingcontrol.Added)
)
listingRoute.route("/:_id")
.get(wrapAsync( Listingcontrol.listDetails));
listingRoute.route("/:_id/edit")
.get( wrapAsync(Listingcontrol.editDetails));
listingRoute.route("/:_id/updatedList")
.post( upload.single("image"),
    wrapAsync(
    Listingcontrol.updatedList ));
listingRoute.route("/:_id/delete")
.get( wrapAsync(Listingcontrol.Delete));

listingRoute.route("/:_id/delete/confirm")
.get(wrapAsync(Listingcontrol.deleteConfirm));
listingRoute.route('/search-list')
.post(wrapAsync(Listingcontrol.searchList))
listingRoute.route("/:_id/review")
.post(wrapAsync(Listingcontrol.addReview));
listingRoute.route("/:id/delete-review/:reviewid")
.get(wrapAsync(Listingcontrol.deleteReview));


userRoute.route("/signup")
.get(wrapAsync(async (req,res,next)=>{
    res.render("./listing/signup.ejs")
}))
.post(wrapAsync((Listingcontrol.SignUp)));
userRoute.route("/login")
.get(wrapAsync(async (req,res,next)=>{
    res.render("./listing/login.ejs");
}))
.post(passport.authenticate("local",{
        failureRedirect: "/user/login",
        failureFlash: true
    }),wrapAsync(Listingcontrol.login ))
userRoute.route("/logout")
.get(wrapAsync(Listingcontrol.logout))
userRoute.route("/profile")
.get(wrapAsync(async (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged In")
        res.redirect("/listing/home");
        return;
    }
    res.render("./listing/profile.ejs");
}))
.post(wrapAsync(Listingcontrol.profile));
userRoute.route("/verify-email")
.post(wrapAsync(Listingcontrol.verify))
userRoute.route("/forgot")
.get((req,res)=>{
    res.render("./listing/forgotPass.ejs");
})
userRoute.route("/forgotpass")
.post(wrapAsync(Listingcontrol.forgotPass));
userRoute.route("/verify-pass/:password")
.post(wrapAsync(Listingcontrol.verifyPass))
userRoute.route("/:list_id/review/:_id/liked")
.get(Listingcontrol.Liked);
userRoute.route("/:list_id/review/:_id/disliked")
.get(Listingcontrol.disLiked);
userRoute.route("/feedback")
.get(Listingcontrol.feedbackRender)
.post(Listingcontrol.sendFeedback);

module.exports = {listingRoute, userRoute}
