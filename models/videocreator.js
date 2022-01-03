const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const videoCreatorSchema = mongoose.Schema({
  name: { type: String, required: true, minLength: 5, maxLength: 50 },
  email: {
    type: String,
    unique: true,
    required: true,
    minLength: 2,
    maxLength: 255,
  },
  password: { type: String, required: true, minLength: 8, maxLength: 2046 },
  isAdmin: { type: Boolean, required: true },
  image: { type: String, default: ""}
});

videoCreatorSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
      image: this.image
    },
    config.get("JWT_SECRET")
  );
};

const validateVideoCreator = (videocreator) => {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(2046).required(),
    isAdmin: Joi.bool().required(),
    image: Joi.string()
  });
  return schema.validate(videocreator);
};

const validateLogin = (req) => {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(8).max(2046).required(),
  });
  return schema.validate(req);
};

const videoCreator = mongoose.model("videoCreator", videoCreatorSchema);
module.exports.videoCreator = videoCreator;
module.exports.videoCreatorSchema = videoCreatorSchema;
module.exports.validateVideoCreator = validateVideoCreator;
module.exports.validateLogin = validateLogin;
