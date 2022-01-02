const mongoose = require("mongoose");
const Joi = require("joi");

const companyProfileSchema = new mongoose.Schema(
    {
        CompanyName: {type: String, required: true, minLength: 0, maxLength: 250},
        Mission: {type: String, required: true, minLength: 0, maxLength: 1500},
        Bio: {type: String, required: true, minLength: 0, maxLength: 1500},
        Website: {type: String, required: false}
    });

const validateCompanyProfile = (companyprofile) => {
    const schema = Joi.object({
        CompanyName: Joi.string().min(0).max(250).required(),
        Mission: Joi.string().min(0).max(1500).required(),
        Bio: Joi.string().min(0).max(1500).required(),
        Website: Joi.string().required()
    });
    return schema.validate(companyprofile);
};

const CompanyProfile = mongoose.model("CompanyProfile", companyProfileSchema);
module.exports.CompanyProfile = CompanyProfile;
module.exports.companyProfileSchema = companyProfileSchema;
module.exports.validateCompanyProfile = validateCompanyProfile;

