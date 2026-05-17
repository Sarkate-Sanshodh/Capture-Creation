const mongoose = require("mongoose");
const bcryp = require('bcrypt');

const userSchema = mongoose.Schema({
    name: {
    type: String,
    required: [true, 'please enter here name first']
  },
  email: {
    type: String,
    required: [true, 'please enter here email first'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'please enter here password'],
    minlength: [6, 'Password has minimum 6 length ']
  },
  role: {
    type: String,
    enum: ['photographer', 'customer'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpires: {
    type: Date
  }
});

/// hsah the password before save 
userSchema.pre('save' , async function(next) {
    if(this.isModified('password')){
        const salt = await bcryp.genSalt(10);
        this.password = await bcryp.hash(this.password , salt);
    }
    next(); 
});

userSchema.statics.login = async function(email , password) {
    const user = await this.findOne({email});
    if(user){
        const auth = await bcryp.compare(password , user.password);
        if(auth){
            return user;
        }
        throw Error('invalid email and Password');
    }
    throw Error('invalid email and password');
    
};

module.exports = mongoose.model("User" , userSchema);
