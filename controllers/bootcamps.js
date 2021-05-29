const ErrorResponse = require("../utils/errorResponse");
const BootCamp = require("../models/Bootcamp");
const asyncHandler = require("../middlewares/async");
const geocoder = require("../utils/geocoder");

const path = require("path");

//@desc   Get All Bootcamps
//@route  GET /api/v1/bootcamps
//@Acess Public

exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//@desc   Get single Bootcamps
//@route  GET /api/v1/bootcamps/:id
//@Acess Public

exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootCamp.findById(req.params.id).populate("courses");

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 405)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

//@desc   Create new Bootcamp
//@route   POST /api/v1/bootcamps/:id
//@Acess Private

exports.createBootcamp = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  const publishedBootcamp = await BootCamp.findOne({ user: req.user.id });

  //If the user is not an admin,they cannot add more than one bootcamp
  if (publishedBootcamp && req.user.role != "admin") {
    return next(
      new ErrorResponse("The user has already published a bootcamp", 400)
    );
  }

  const bootcamp = await BootCamp.create(req.body);

  res.status(201).json({ success: true, msg: bootcamp });
});

//@desc   Update Bootcamp
//@route   PUT /api/v1/bootcamps/:id
//@Acess Private

exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  // try {
  let bootcamp = await BootCamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 405)
    );
  }

  //Making sure it is the bootcamp owner making changes
  const user = req.user.id;
  if (user !== bootcamp.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User id with id${req.user.id} not authorised to update`,
        401
      )
    );
  }

  bootcamp = await BootCamp.findOneAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bootcamp });
  // } catch (err) {
  //   next(err);
  // }
});

//@desc   Delete Bootcamp
//@route  DELETE /api/v1/bootcamps/:id
//@Acess Private

exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootCamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 405)
    );
  }

  //Making sure it is the bootcamp owner making changes
  if (req.user.id !== bootcamp.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User id with id${req.user.id} not authorised to delete`,
        401
      )
    );
  }

  bootcamp.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  console.log(distance);

  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km
  const radius = distance / 3963;

  const bootcamps = await BootCamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// @desc      Upload photo for bootcamp
// @route     PUT /api/v1/bootcamps/:id/photo
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await BootCamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Making sure it is the bootcamp owner making changes
  if (req.user.id !== bootcamp.user.toString() && req.user.role != "admin") {
    return next(
      new ErrorResponse(
        `User id with id${req.user.id} not authorised to delete`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await BootCamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
});
