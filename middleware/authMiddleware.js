const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { models } = require('mongoose');


// require Authentication user are login or not cheack token
const authRequire = (req , res , next)=>{
    const token = req.cookies.jwt;

    if(token){
        jwt.verify(token , process.env.JWT_SECRET , (err , decodeToken) =>{
            if(err){
                console.log(err.message);
                res.redirect('/login');
                
            }else{
                next();
            }
        });
    }
    else{
        res.redirect('/login');
    }
};


// check the what is the user role 
const checkRole = (role)=> {
    return (req,res,next) => {
        if(res.locals.user && res.locals.user.role === role){
            next();
        }else{
          res.status(403).render('403', { title: 'Forbidden' });
        }

    };

};


// check current user
const checkUser = (req ,res ,next)=>{
    const token = req.cookies.jwt;
    if(token){
        jwt.verify(token , process.env.JWT_SECRET , async(err,result)=>{
            if(err){
                res.locals.user = null;
                next();
            }
            else{
              let user = await User.findById(result.id);
              res.locals.user = user;
              next();
            }
        });
    }else{
        res.locals.user = null ;
        next();
    }
};

module.exports = {authRequire , checkRole , checkUser}