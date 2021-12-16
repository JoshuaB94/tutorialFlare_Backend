const mongoose = require("mongoose");
const Joi = require("joi")

const companySchema = new mongoose.Schema(
    {
        companyName: {type: String, required: true},
        companyMission: {type: String, required: true, minLength: 164, maxLength: 250},
        companyBio: {type: String, required: true, minLength: 0, maxLength: 1500},
        companyWebsite: {type: String, required: false}
    }
)