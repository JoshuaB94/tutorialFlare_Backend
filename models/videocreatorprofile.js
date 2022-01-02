const mongoose = require("mongoose");
const Joi = require("joi");

const videoCreatorProfileSchema = new mongoose.Schema({
    Name: {type: String, required: true, minLength: 0, maxLength: 50},
    Location: {type: String, required: false, minLength: 0, maxLength: 250},
    Skills: {
       skillOne: {type: String, required: true, minLength: 0, maxLength: 1500},
       skillTwo: {type: String, required: true, minLength: 0, maxLength: 1500},
       skillThree: {type: String, required: true, minLength: 0, maxLength: 1500}
    },
    SocialLinks: {
        Youtube: {type: String, required: false},
        Twitter: {type: String, required: false},
        emailAddress: {type: String, required: false}
    }
});

const validateVideoCreatorProfile = (videocreatorprofile) => {
    const schema = Joi.object({
        Name: Joi.string().min(0).max(50).required(),
        Location: Joi.string().min(0).max(250).required(),
        skillOne: Joi.string().min(0).max(1500).required(),
        skillTwo: Joi.string().min(0).max(1500).required(),
        skillThree: Joi.string().min(0).max(1500).required(),
        Youtube: Joi.string().required(),
        Twitter: Joi.string().required(),
        emailAddress: Joi.string().required()
    });
    return schema.validate(videocreatorprofile);
};

const VideoCreatorProfile = mongoose.model("VideoCreatorProfile", videoCreatorProfileSchema);
module.exports.VideoCreatorProfile = VideoCreatorProfile;
module.exports.videoCreatorProfileSchema = videoCreatorProfileSchema;
module.exports.validateVideoCreatorProfile = validateVideoCreatorProfile;