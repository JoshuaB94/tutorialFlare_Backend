const mongoose = require("mongoose");
const Joi = require("joi");

const videoUploadSchema = new mongoose.Schema({
    title: {type: String, required: true},
    video: {type: String, default: ""}
});

const validateVideoUpload = (videoupload) => {
    const schema = Joi.object({
        title: Joi.string().required(),
        video: Joi.string()
    });
    return schema.validate(videoupload);
}

const VideoUpload = mongoose.model("VideoUpload", videoUploadSchema);
module.exports.VideoUpload = VideoUpload;
module.exports.videoUploadSchema = videoUploadSchema;
module.exports.validateVideoUpload = validateVideoUpload;