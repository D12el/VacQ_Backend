const Hospital = require('../models/Hospital');

const qs = require('qs');

//@desc     Get all hospitals
//@route    GET /api/v1/hospitals
//@access   Public
exports.getHospitals = async (req, res, next) => {
    let query;

    //-- lt, lte, gt, gte, in --
    let parsedQuery = qs.parse(req.query);
    //console.log(parsedQuery);
    const removeFields = ['select', 'sort', 'page', 'limit']; // remove other fields to do gt, gte, lt, lte, in
    removeFields.forEach(param => delete parsedQuery[param]);
    //console.log(parsedQuery);
    let queryStr = JSON.stringify(parsedQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    query = Hospital.find(JSON.parse(queryStr)).populate('appointments');

    //-- Select Fields --
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    //-- Sort --
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    //-- Pagination --
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hospital.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const pagination = {};
    if(endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }
    if(startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }
    
    try {
        const hospitals = await query;
        return res.status(200).json({success:true, count:hospitals.length, pagination, data:hospitals});
    } catch (err) {
        return res.status(400).json({success:false});
    }
}


//@desc     Get single hospital
//@route    GET /api/v1/hospitals/:id
//@access   Public
exports.getHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if(!hospital) {
            return res.status(400).json({success:false, error:"Hospital not found"});
        }
        return res.status(200).json({success:true, data:hospital});
    } catch (err) {
        return res.status(400).json({success:false});
    }
}


//@desc     Create new hospital
//@route    POST /api/v1/hospitals
//@access   Private (only admin can create hospital)
exports.createHospital = async (req, res, next) => {
    const hospital = await Hospital.create(req.body);
    res.status(201).json({success:true, data:hospital});
}

//@desc     Update hospital
//@route    PUT /api/v1/hospitals/:id
//@access   Private (only admin can update hospital)
exports.updateHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if(!hospital) {
            return res.status(400).json({success:false, error:"Hospital not found"});
        }
        return res.status(200).json({success:true, data:hospital});
    } catch (err) {
        res.status(400).json({success:false});
    }
}

//for cascade delete
const Appointment = require('../models/Appointment');

//@desc     Delete hospital
//@route    DELETE /api/v1/hospitals/:id
//@access   Private (only admin can delete hospital)
exports.deleteHospital = async (req, res, next) => {
    try {
        const hospital = await Hospital.findById(req.params.id);
        if(!hospital) {
            return res.status(404).json({success:false, error:"Hospital not found with id of " + req.params.id});
        }
        await Appointment.deleteMany({hospital: hospital._id}); //cascade delete -> delete all appt of this hospital
        await Hospital.deleteOne({_id: req.params.id});

        res.status(200).json({success:true, data:{}});
    } catch (err) {
        res.status(400).json({success:false});
    }
} 