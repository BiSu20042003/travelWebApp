const mongoose= require("mongoose");
const reviewSch =new mongoose.Schema({
    username : String,
    comment : String,
    rating:{
        type: Number,
        min: 1,
        max: 5
    },
    createdAt :{
        type: Date,
        default : Date.now()
    }
});
module.exports = mongoose.model("Review", reviewSch);