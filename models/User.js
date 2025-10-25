const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); //for password encryption
const jwt = require('jsonwebtoken'); //for JWT token

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email']
    },
    role:{
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createAt:{
        type: Date,
        default: Date.now
    }
})

//Encrypt password using bcrypt -> brcypt use salt and hash to encrypt password -> in slide
//.pre('save') -> before saving this data to database -> run this function
UserSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); 
    //salt is ramdomly generated -> hash password with salt -> hashed password have salt in it -> ... 
    // when compare password, it will extract salt from hashed password and use it to hash the entered password
})

//Model.methods.MethodName = function(){...} -> create a method for this model
UserSchema.methods.matchPassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password); //this.password is salted hashed password
}

UserSchema.methods.getSignedJwtToken = function(){
    // Generate JWT token for this user
    // - Payload will contain { id: userId } and { exp: expiration time }
    // - Payload is Base64-encoded (not encrypted) → anyone can decode and read it
    // - Payload cannot be modified without the secret key (checked via signature)
    // - Secret key signs the payload and verifies that the token is from our server
    // - If the payload is modified, the signature (last part of the token) will not match
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRE});
}

module.exports = mongoose.model('User', UserSchema);

