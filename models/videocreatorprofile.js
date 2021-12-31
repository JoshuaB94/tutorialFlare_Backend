const mongoose = require("mongoose");
const Joi = require("joi");

const videoCreatorProfileSchema = new mongoose.Schema({
    videoCreatorName: {type: String, required: true, minLength: 0, maxLength: 50},
    videoCreatorLocation: {type: String, required: false, minLength: 0, maxLength: 250},
    videoCreatorSkill: {type: String, required: true, minLength: 0, maxLength: 1500},
    videoCreatorSocialLink: {type: String, required: false}
});

const validateVideoCreatorProfile = (videocreatorprofile) => {
    const schema = Joi.object({
        videoCreatorName: Joi.string().min(0).max(50).required(),
        videoCreatorLocation: Joi.string().min(0).max(250).required(),
        videoCreatorSkill: Joi.string().min(0).max(1500).required(),
        videoCreatorSocialLink: Joi.string().required()
    });
    return schema.validate(videocreatorprofile);
};

const VideoCreatorProfile = mongoose.model("VideoCreatorProfile", videoCreatorProfileSchema);
module.exports.VideoCreatorProfile = VideoCreatorProfile;
module.exports.videoCreatorProfileSchema = videoCreatorProfileSchema;
module.exports.validateVideoCreatorProfile = validateVideoCreatorProfile;