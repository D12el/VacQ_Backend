 const jwt = require('jsonwebtoken');
 const User = require('../models/User')

 //Protect routes
 exports.protect = async (req,res,next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        //req.headers.authorization = Bearer 'Token'
        token = req.headers.authorization.split(' ')[1]; //split -> [0] = Bearer, [1] = token data
    }

    if(!token){
        return res.status(401).json({success:false, message:'Not authorize to access this route'});
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET) //verify and decode token
        console.log(decoded);
        req.user =  await User.findById(decoded.id); //find user in database

        next(); //go to next middleware until find return res
    }
    catch(err){
        console.log(err.stack);
        return res.status(401).json({success:false, message:'Not authorize to access this route'});
    }
 }

 //Grant access to specific roles
 exports.authorize = (...roles) => { 
    // ...roles is list of role
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return res.status(403).json({success:false, message:`User role ${req.user.role} is not authorized to access this route`});
        }
        next();
    }
 }