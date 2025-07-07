const mongoose= require("mongoose");
const Review = require("./review");
const User = require("./userLogin");
const listingSch =new mongoose.Schema(
    {
    title:{
        type: String,
        required : true
    } ,
    description: String,
    image: {
        url:{
            default: "",
            type: String
        },
      
      filename:{
        type: String,
        default:"",
      },
    },
    price: {
        type: Number,
        required: true
    }
    ,
    location: {
        type: String,
        required: true
    },
    country: String,
    reviews :[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref : "Review"
        }
    ],
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref : "User"
    }
    }
)
const Listing= mongoose.model("listingSch",listingSch);
module.exports = Listing;