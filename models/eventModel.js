const mongoose = require("mongoose");
const crypto = require('crypto');


const eventSchema = mongoose.Schema({
    eventName : {
        type:String,
        required:[true , "event name is complsary"]
    },
    eventDate:{
     type: Date,
     required: [true , 'event date is complsary']
    },

    photographer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },

     uniqueLink: {
        type: String,
         default: () => crypto.randomBytes(8).toString('hex'),
        unique: true,
        require:true
    },

    photos: [{
       type:String
    }],

    selectedPhotos: [{
      type:String
    }]

});

const Event = mongoose.model('event' , eventSchema);
module.exports = Event;