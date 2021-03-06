const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const companySchema = mongoose.Schema({
  company: { type: String, required: true, minLength: 5, maxLength: 50 },
  email: {
    type: String,
    unique: true,
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  password: { type: String, required: true, minLength: 8, maxLength: 2046 },
  isCompany: { type: Boolean, required: true },
  image: { type: String, default: "" },
  companyProfileId: { type: mongoose.Types.ObjectId }
});

companySchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      company: this.company,
      email: this.email,
      isCompany: this.isCompany,
      image: this.image,
      companyProfileId: this.companyProfileId
    },
    config.get("JWT_SECRET")
  );
};

const validateCompany = (company) => {
  const schema = Joi.object({
    company: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(2046).required(),
    isCompany: Joi.bool().required(),
    image: Joi.string(),
    companyProfileId: Joi.string()
  });
  return schema.validate(company);
};

const validateLogin = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(2046).required(),
  });
  return schema.validate(req);
};

const Company = mongoose.model("Company", companySchema);
module.exports.Company = Company;
module.exports.companySchema = companySchema;
module.exports.validateCompany = validateCompany;
module.exports.validateLogin = validateLogin;
