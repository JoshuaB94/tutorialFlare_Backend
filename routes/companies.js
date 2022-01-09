const { Company, validateLogin, validateCompany } = require("../models/company");
const { CompanyProfile, validateCompanyProfile } = require("../models/companyprofile");
const fileUpload = require("../middleware/file-upload");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

//* POST register a new company
router.post("/register", fileUpload.single("image"), async (req, res) => {
  try {
    const { error } = validateCompany(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let company = await Company.findOne({ email: req.body.email });
    if (company)
      return res.status(400).send(`Email ${req.body.email} already claimed!`);

    const salt = await bcrypt.genSalt(10);
    company = new Company({
      company: req.body.company,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      isCompany: req.body.isCompany,
      // image: req.file.path
    });

    await company.save();
    const token = company.generateAuthToken();
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({
        _id: company._id,
        company: company.company,
        email: company.email,
        isCompany: company.isCompany,
        image: company.image
      });
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* POST a valid login attempt
//! when a user logs in, a new JWT token is generated and sent if their email/password credentials are correct
router.post("/login", async (req, res) => {
  try {
    const { error } = validateLogin(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let company = await Company.findOne({ email: req.body.email });
    if (!company) return res.status(400).send(`Invalid email or password.`);

    const validPassword = await bcrypt.compare(
      req.body.password,
      company.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = company.generateAuthToken();
    return res.send(token);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* Get all companies
router.get("/", async (req, res) => {
  try {
    const company = await Company.find();
    return res.send(company);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* DELETE a single company from the database
router.delete("/:_id", async (req, res) => {
  try {
    const company = await Company.findById(req.params._id);
    if (!company)
      return res
        .status(400)
        .send(`Company with id ${req.params._id} does not exist!`);
    await company.remove();
    return res.send(company);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* POST setup a new company profile
router.post("/:_id/profile-setup", async (req, res) => {
  try {
    const { error } = validateCompanyProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const company = await Company.findById(req.params._id);

    let companyprofile = await CompanyProfile.findOne({ _id: req.body.id });
    if (companyprofile)
      return res.status(400).send(`Company Profile Already Exists`);

    companyprofile = new CompanyProfile({
      CompanyName: req.body.CompanyName,
      Mission: req.body.Mission,
      Bio: req.body.Bio,
      Website: req.body.Website,
      // Image: req.body.Image
    });

    await companyprofile.save();

    company.companyProfileId = companyprofile._id
    await company.save();

    return res.send([company, companyprofile]);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* GET all company profiles
router.get("/profile", async (req, res) => {
  try {
    const companyprofile = await CompanyProfile.find();
    return res.send(companyprofile);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* GET a company by id
router.get("/profile/:_id", async (req, res) => {
  try {
    const companyprofile = await CompanyProfile.findById(req.params._id);
    return res.send(companyprofile);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

module.exports = router;
