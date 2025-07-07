const mongoose = require("mongoose");
const User = require("./userLogin");
const UserDetailSchema = new mongoose.Schema(
    {
        fullName:{
            firstName: {
                type: String,
                required: true
            },
            lastName: String,
        },
        phone: Number,
        profilePic:{
            url: String,
            filename: String
        },
        address: String,
        owner:{
                type:mongoose.Schema.Types.ObjectId,
                ref : "User"
            }
    }
)
const UserDetail = mongoose.model("UserDetailSchema",UserDetailSchema);
module.exports = UserDetail;