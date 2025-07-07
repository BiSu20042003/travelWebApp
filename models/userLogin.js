const mongoose= require("mongoose");
const passportLocalMongoose= require("passport-local-mongoose");

const userSchema =new mongoose.Schema(
    {
    email:{
        type: String,
        required : true
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    verificationCode: String,
    verificationCodeExpires: Date
    }
)
userSchema.plugin(passportLocalMongoose);
const Listing= mongoose.model("User",userSchema);
module.exports = Listing;