require('dotenv').config();
const express= require("express");
const ejsMate= require("ejs-mate");
const flash = require("connect-flash");
const mongoose= require("mongoose");
const path = require("path");
const { resolve6 } = require("dns");
const cookieParser = require("cookie-parser");
const session= require("express-session");
const mongoStore = require("connect-mongo");
const Listing= require("./models/list.js");
const Listingcontrol= require("./controller/listing.js") 
const Review = require("./models/review.js"); 
const multer = require("multer");
const{storage} = require("./cloudConfig.js");
const upload = multer({storage}); 
const app= express();
const passport = require("passport"); 
const localStrategy= require("passport-local"); 
const User = require("./models/userLogin.js");
const UserDetail = require('./models/userDetails.js'); 
const wrapAsync= require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js"); 
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const {listingRoute,userRoute} = require("./utils/router.js")


app.use(cookieParser());
const store= mongoStore.create({
  mongoUrl: process.env.MONGO_ATLAS,
  crypto:{
    secret:process.env.SECRET_SESSIO
  },
  touchAfter: 24*3600
})
const sessionOption = {
    store,
    secret: process.env.SECRET_SESSION,
    resave:false,
    saveUninitialized: true,
    cookie:{
        expires: new Date(Date.now() + 7 * 24 * 3600 * 1000), // amount of milisecond is = 7 Days
        maxAge: 7*24*3600*1000,
        httpOnly: true
    }
}

app.use(session(sessionOption));
app.use(flash());
app.listen( process.env.PORT  || 8080,()=>{
    console.log("app listening");
})
async function main() {
  await mongoose.connect(process.env.MONGO_ATLAS);
}
main().then().catch();
app.use(passport.initialize()); 
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async (req,res,next)=>{
    res.locals.messages = req.flash();
    res.locals.currUser= req.user;
    req.session.prevRoute= req.originalUrl;
    res.locals.prevRoute = req.session.prevRoute;

    if(req.user){
        const userDetails = await UserDetail.findOne(
            {
                owner: req.user._id});
                res.locals.userDetails= userDetails;
    }
    next();
})

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.engine("ejs",ejsMate);


app.use("/listing", listingRoute);
app.use("/user",userRoute)
app.get("/search-suggestions",async (req, res) => {
  try {
    const { title } = req.query;

    if (!title || title.trim() === "") {
      return res.json([]);
    }

    const suggestions = await Listing.find({
      title: { $regex: new RegExp(title.trim(), 'i') }
    }).limit(5);

    res.json(suggestions);
  } catch (err) {
    console.error("Autocomplete error:", err);
    res.status(500).json({ error: "Server error" });
  }
});


app.use((err,req,res,next)=>{
    let {statusCode=400, message="something went wrong"}=err;
    //res.status(statusCode).send({error: message});
    let decide=4;
    res.render("./listing/error.ejs",{decide,message})
})
