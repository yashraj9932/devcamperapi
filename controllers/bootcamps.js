const ErrorResponse = require("../utils/errorResponse");
const BootCamp = require("../models/Bootcamp");

//@desc   Get All Bootcamps
//@route  GET /api/v1/bootcamps
//@Acess Public

exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await BootCamp.find();
    res
      .status(200)
      .json({ success: true, count: bootcamps.length, data: bootcamps });
  } catch (error) {
    next(err);
  }
};

//@desc   Get single Bootcamps
//@route  GET /api/v1/bootcamps/:id
//@Acess Public

exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await BootCamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 405)
      );
    }
    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc   Create new Bootcamp
//@route   POST /api/v1/bootcamps/:id
//@Acess Private

exports.createBootcamp = async (req, res, next) => {
  // console.log(req.body);
  try {
    const bootcamp = await BootCamp.create(req.body);

    res.status(201).json({ success: true, msg: bootcamp });
  } catch (err) {
    // res.status(400).json({ success: false });
    next(err);
  }
};

//@desc   Update Bootcamp
//@route   PUT /api/v1/bootcamps/:id
//@Acess Private

exports.updateBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await BootCamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 405)
      );
    }

    res.status(200).json({ success: true, data: bootcamp });
  } catch (err) {
    next(err);
  }
};

//@desc   Delete Bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@Acess Private

exports.deleteBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await BootCamp.findByIdAndDelete(req.params.id);
    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 405)
      );
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(err);
  }
};
