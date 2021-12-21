const mongoose = require("mongoose");
const Joi = require("joi");

const companyProfileSchema = new mongoose.Schema(
    {
        companyName: {type: String, required: true, minLength: 0, maxLength: 50},
        companyMission: {type: String, required: true, minLength: 0, maxLength: 250},
        companyBio: {type: String, required: true, minLength: 0, maxLength: 1500},
        companyWebsite: {type: String, required: false}
    });

const validateCompanyProfile = (companyprofile) => {
    const schema = Joi.object({
        companyName: Joi.string().min(0).max(50).required(),
        companyMission: Joi.string().min(0).max(250).required(),
        companyBio: Joi.string().min(0).max(1500).required(),
        companyWebsite: Joi.string().required()
    });
    return schema.validate(companyprofile);
};

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);
module.exports.CompanyProfile = CompanyProfile;
module.exports.companyProfileSchema = companyProfileSchema;
module.exports.validateCompanyProfile = validateCompanyProfile;

