const mongoose = require("mongoose");


const photoSchema = mongoose.Schema({
    url : {
        type:String,
        required:true
    },
    filename:{
     type:String,
     required: true
    },

   event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true,
    },
    selectedByCustomer: {
        type: Boolean,
        default: false,
    },
} , {timestamp:true});

module.exports = mongoose.model("Photo" , photoSchema);