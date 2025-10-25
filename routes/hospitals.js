const express = require('express');

const {protect, authorize} = require('../middleware/auth')

const router = express.Router();

const {getHospitals, getHospital, createHospital, updateHospital, deleteHospital} = require('../controllers/hospitals');

router.route('/').get(getHospitals).post(protect, authorize('admin'), createHospital);
router.route('/:id').get(getHospital).put(protect, authorize('admin'), updateHospital).delete(protect, authorize('admin'), deleteHospital);

//use appointments router for /:hospitalId/appointments
const appointmentRouter = require('./appointments');
router.use('/:hospitalId/appointments', appointmentRouter);

module.exports = router; 
//other file can access this router(this file's routes) by ...
//require("./routes/hospitals") => returns this router object
