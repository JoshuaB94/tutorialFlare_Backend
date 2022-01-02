const { Company, validateLogin, validateCompany } = require("../models/company");
const { CompanyProfile, validateCompanyProfile } = require("../models/companyprofile");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

//* POST register a new company
router.post("/register", async (req, res) => {
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
      isAdmin: req.body.isAdmin,
    });

    await company.save();
    const token = company.generateAuthToken();
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({
        _id: company._id,
        company: company.name,
        email: company.email,
        isAdmin: company.isAdmin,
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
router.delete("/:companyId", async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    if (!company)
      return res
        .status(400)
        .send(`Company with id ${req.params.companyId} does not exist!`);
    await company.remove();
    return res.send(company);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* POST setup a new company profile
router.post("/profile-setup", async (req, res) => {
  try {
    const { error } = validateCompanyProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let companyprofile = await CompanyProfile.findOne({ CompanyName: req.body.CompanyName });
    if (companyprofile)
      return res.status(400).send(`Company Profile Already Exists`);

    companyprofile = new CompanyProfile({
      CompanyName: req.body.CompanyName,
      Mission: req.body.Mission,
      Bio: req.body.Bio,
      Website: req.body.Website
    });

    await companyprofile.save();
    return res.send({
      CompanyName: companyprofile.CompanyName,
      Mission: companyprofile.Mission,
      Bio: companyprofile.Bio,
      Website: companyprofile.Website
    });
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
