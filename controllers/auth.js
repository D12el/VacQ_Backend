const User = require('../models/User');

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
const sendTokenResponse = (user, statusCode, res) => {
    //create JWT token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true //for security -> JS code cannot access cookie
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true; //send cookie only on https
    }

    //res.cookie('token', token, options) means set cookie in browser named 'token' with value token and options
    //this cookie (cookies specific on domain) is automatically sent back to server in every request
    res.status(statusCode).cookie('token', token, options).json({ success: true, token });
}


//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        //const token = user.getSignedJwtToken();
        //res.status(200).json({success:true, token});
        sendTokenResponse(user, 200, res);
    }
    catch (err) {
        res.status(400).json({success:false, error: err.message});
        consiole.log(err.stack);
    }
}

//@desc     Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = async (req, res, next) => {
    const {email, password} = req.body;

    //validate email & password
    if(!email || !password){
        return res.status(400).json({success:false, error: 'Please provide an email and password'});
    }

    //check for user by email
    const user = await User.findOne({email}).select('+password'); //password is select:false in model -> need select(+password) to override it
    if(!user){
        return res.status(401).json({success:false, error: 'Invalid credentials'});
    }

    //check if password matches
    const isMatch = await user.matchPassword(password); //user is a model that collect attribute that we .findOne({email}) -> use matchPassword method
    if(!isMatch){
        return res.status(401).json({success:false, error: 'Invalid credentials'});
    }

 
    //const token = user.getSignedJwtToken();
    //res.status(200).json({success:true, token});
    sendTokenResponse(user, 200, res);
}

//@desc     Get current logged in user
//@route    POST /api/v1/auth/me
//@access   Private
exports.getMe = async (req,res,next) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({success:true, data:user});
    //where is res.user come from???
    //we use protect -> next() -> getMe !!!
    //protect -> verify token (get user_id) -> set req.user = User.findByID(user_id) -> next()
    //getMe -> use req.user which is setted from protect
}