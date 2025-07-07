const Listing= require('../models/list.js')
const User= require('../models/userLogin.js')
const UserDetail = require("../models/userDetails.js")
const {cloudinary} = require("../cloudConfig.js");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


module.exports.index=  async (req,res,next)=>{
    const allList= await Listing.find({});
    res.render("./listing/index.ejs",{allList});
}
module.exports.AddNewList= async (req,res,next)=>{
    if(!req.isAuthenticated()){ // isUnauthenticated is opposite
        req.flash("error","You must be logged in to add new list");
        return res.redirect("/user/login");
    }
    req.flash("success","Place added");
    res.render("./listing/newPlace.ejs");
}
module.exports.Added=  async (req,res,next)=>{
    if(!req.isAuthenticated()){ 
        req.flash("error","You must be logged in to add new list");
        return res.redirect("/user/login");
    }
    let {title, description,location, country,price}= req.body;
    let url,filename;
    if(req.file && req.file.path && req.file.filename ){
    url= req.file.path;
    filename= req.file.filename;
    }
    else{
        url="https://res.cloudinary.com/dzvbhall2/image/upload/v1751867611/demoIMG_qbsco5.jpg";
        filename="image";
    }
    await Listing.insertOne(
        {
            title: title,
            description: description,
            location: location,
            country: country,
            price:price,

            image: {
                filename: "filename",
                url: url
            },
            owner: req.user._id
        }
    
    );
    req.flash("success","New Place Successfully added!" );
    res.redirect("/listing/home");
      
}
module.exports.listDetails = async (req,res,next)=>{
    let {_id}= req.params;
    let checkList = await Listing.findById(_id);
    if(!checkList){
        next({message: "Place does not exist"});
    }
    const singleList= await Listing.findById(_id).populate("owner").populate("reviews");
    res.render("./listing/listDetails.ejs",{singleList});
}
module.exports.editDetails = async (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in to  Edit details");
        return res.redirect("/user/login");
    }
    let {_id}= req.params;
    const oldList= await Listing.findById(_id);
    if( ! req.user._id.equals(oldList.owner._id)){
        req.flash("error","You are not owner of this list");
        return res.redirect(`/listing/${_id}`);
    }
    res.render("./listing/editDetails.ejs",{oldList});
}
module.exports.updatedList = async (req,res,next)=>{
    let {_id}= req.params;
    let listDetails = await Listing.findById(_id);
    if(!req.isAuthenticated() || ! req.user._id.equals(listDetails.owner._id)){
        req.flash("error", "Something went wrong");
        return res.redirect(`/listing/${_id}`);
    }
    let {title, description,location, country, price}= req.body;
    await Listing.findByIdAndUpdate(_id,{title:title});
    await Listing.findByIdAndUpdate(_id,{description:description});
    await Listing.findByIdAndUpdate(_id,{location: location});
    await Listing.findByIdAndUpdate(_id,{country: country});
    await Listing.findByIdAndUpdate(_id,{price: price});  
    if (req.file && req.file.path && req.file.filename) {  
        await Listing.findByIdAndUpdate(_id,{
            image:{
                filename: req.file.filename,
                url: req.file.path
            }
        })
    }
    else {
       console.log("Image exist"); 
    }
    setTimeout(()=>{
        res.redirect("/listing/home");
    },2000);
}
module.exports.Delete =  async (req,res,next)=>{
    let {_id}=req.params;
    let willbeDeleted= await Listing.findById(_id);
    if(!req.isAuthenticated() || ! req.user._id.equals(willbeDeleted.owner._id)){
        req.flash("error", "You are not host of this list");
        return res.redirect(`/listing/${_id}`);
    }
    let decide=444;
    let message ="Are you sure you want to delete? "
    res.render("./listing/error.ejs",{decide,willbeDeleted,message});
}
module.exports.deleteConfirm = async (req,res,next)=>{
    let {_id}= req.params;
    let willbeDeleted= await Listing.findById(_id);
    if(!req.isAuthenticated() || ! req.user._id.equals(willbeDeleted.owner._id)){
        req.flash("error", "Deletion unsuccessfull!");
        return res.redirect(`/listing/${_id}`);
    }
    await Listing.findByIdAndDelete(_id);
    setTimeout(()=>{
        req.flash("success","Deletion Successfull");
        res.redirect("/listing/home");
    },2000)  
}
module.exports.SignUp =  async (req,res,next)=>{
  let {email,username,password}= req.body;
  let existingUser =await User.findOne({email:email});
        console.log(existingUser);
        if(existingUser){
            let error= "Email is already registerd" ;
            console.log(error);
            const Decide= 1;
            res.render("./listing/signup.ejs",{error,Decide});
            return;
        }
        existingUser =await User.findOne({username:username});
        console.log(existingUser);
        if(existingUser){
            let error= "Username is not available" ;
            console.log(error);
            const Decide= 2;
            res.render("./listing/signup.ejs",{error,Decide});
            return;
        }
    const newUser = new User({ email, username});
    const registeredUser= await User.register(newUser, password);
    const code = Math.floor(100 + Math.random() * 900).toString();
    registeredUser.verificationCode = code;
    registeredUser.verificationCodeExpires = Date.now() + 600000; // 10 mins
    await registeredUser.save();
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`
    };
    
    await transporter.sendMail(mailOptions);
    res.render('./listing/verifyStatus.ejs', { email });
    
};

module.exports.verify = async (req, res, next) => {
    const { email, code } = req.body;
  try {
    const user = await User.findOne({ 
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error","Invalid verification code!! Try again");
        return res.render('./listing/verifyStatus.ejs', {email});
    }
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next(err);
      }
        req.flash("success","Verification successfull")
        res.redirect('/listing/home'); 
    });
    
  } catch (err) {
    console.error('Verification error:', err);
  }
}


module.exports.forgotPass= async(req,res,next)=>{
    let {email,username,password}= req.body;
    let existingUser =await User.findOne({email:email});
        if(!existingUser){
            let error= "Email does not exist" ;
            console.log(error);
            const Decide= 1;
            res.render("./listing/forgotPass.ejs",{error,Decide});
            return;
        }
        existingUser =await User.findOne({username:username});
        if(!existingUser){
            let error= "Username does not exist" ;
            console.log(error);
            const Decide= 2;
            res.render("./listing/forgotPass.ejs",{error,Decide});
            return;
        }
    const code = Math.floor(100 + Math.random() * 900).toString();
    existingUser.verificationCode = code;
    existingUser.verificationCodeExpires = Date.now() + 600000; // 10 mins
    await existingUser.save();
        const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
        }
    });
    console.log("6")
    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`
    };
    
    await transporter.sendMail(mailOptions);
    res.render('./listing/verifyPass.ejs', { email,password });
}


module.exports.verifyPass = async (req, res, next) => {
    const { email, code } = req.body;
    const {password } = req.params;
  try {
    const user = await User.findOne({ 
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash("error","Invalid verification code!! Try again");
        return res.render('./listing/verifyPass.ejs', {email,password});
    }
    await user.setPassword(password);
    await user.save();
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();
    req.login(user, (err) => {
      if (err) {
        console.error('Login error:', err);
        return next( {message: 'Error during auto-login'} );
      }
        req.flash("success","Password Change successfull")
        res.redirect('/listing/home'); // Redirect to your app's main page
    });
    
  } catch (err) {
    console.error('Verification error:', err);
    //res.render('error', { message: 'Error during verification' });
  }
}

module.exports.searchList= async(req,res,next)=>{
    let {title}= req.body;
    console.log(title);
    let allList;
    allList= await Listing.find({title:{
        $regex: new RegExp(title,'i')
    }});
    res.render("./listing/index.ejs",{allList})   
}
module.exports.addReview = async (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in")
        res.redirect("/user/login");
        return;
    }
    let {_id}=req.params;
    // const ranUsername=faker.person.fullName();
    const reviewData={
        ...req.body.review,
        username: req.user.username
    };
    let singleList= await Listing.findById(_id);

    let newReview= new Review(reviewData);
    singleList.reviews.push(newReview);
    await newReview.save();
    await singleList.save();
    res.redirect(`/listing/${_id}`);
}
module.exports.deleteReview =  async(req,res,next)=>{
   let {id, reviewid} = req.params;
    if(!req.isAuthenticated()){
        req.flash("error","You must be logged in")
        res.redirect("/user/login");
        return
    }
    let singleList = await Listing.findById(id);
    console.log(singleList);
    if(! (req.user._id.equals(singleList.owner._id))){ 
        req.flash("error","You don't have access to delete this review");
        res.redirect(`/listing/${id}`);
        return;
    }
    // let {id,reviewid} = req.params;
    await Listing.findByIdAndUpdate(id,{$pull: {reviews: reviewid}});
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/listing/${id}`);
}
module.exports.login= async (req,res,next)=>{
        req.flash("success","Login Successful, Welcome to travel.com!!");
        res.redirect("/listing/home");
}
module.exports.logout = async (req,res,next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You are already logged out")
        res.redirect("/listing/home");
        return
    }
    req.logout((err)=>{
        if(err) next(err);
        req.flash("success","Logout successfully");
        res.redirect("/listing/home");
    })
}
module.exports.profile = async(req,res,next)=>{
     if(!req.isAuthenticated()){
        req.flash("error","You must be logged in")
        res.redirect("/user/login");
        return
    }
    let {firstName, lastName, phone, address}= req.body;
    let existing = await UserDetail.findOne({owner:req.user._id});
    if(existing){
        existing.fullName.firstName= firstName;
        existing.fullName.lastName= firstName;
        existing.phone= phone;
        existing.address= address;
        await existing.save();
    }
    else{
        await UserDetail.create({
            owner: req.user._id,
            fullName:{
                firstName,
                lastName
            },
            phone,
            address
        });
    }
    res.redirect("/listing/home");
}
    