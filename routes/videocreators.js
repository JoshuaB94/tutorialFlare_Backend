const { videoCreator, validateLogin, validateVideoCreator } = require("../models/videocreator");
const { validateVideoCreatorProfile, VideoCreatorProfile }  = require("../models/videocreatorprofile");
const fileUpload = require("../middleware/file-upload");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

//* POST register a new video creator
router.post("/register", fileUpload.single("image"), async (req, res) => {
  try {
    const { error } = validateVideoCreator(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let videocreator = await videoCreator.findOne({ email: req.body.email });
    if (videocreator)
      return res.status(400).send(`Email ${req.body.email} already claimed!`);

    const salt = await bcrypt.genSalt(10);
    videocreator = new videoCreator({
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, salt),
      isAdmin: req.body.isAdmin,
      image: req.file.path
    });

    await videocreator.save();
    const token = videocreator.generateAuthToken();
    return res
      .header("x-auth-token", token)
      .header("access-control-expose-headers", "x-auth-token")
      .send({
        _id: videocreator._id,
        name: videocreator.name,
        email: videocreator.email,
        isAdmin: videocreator.isAdmin,
        image: videocreator.image
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

    let videocreator = await videoCreator.findOne({ email: req.body.email });
    if (!videocreator) return res.status(400).send(`Invalid email or password.`);

    const validPassword = await bcrypt.compare(
      req.body.password,
      videocreator.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = videocreator.generateAuthToken();
    return res.send(token);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* Get all video creators
router.get("/", async (req, res) => {
  try {
    const videocreator = await videoCreator.find();
    return res.send(videocreator);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});


//* DELETE a single video creator from the database
router.delete("/:_id", async (req, res) => {
  try {
    const videocreator = await videoCreator.findById(req.params._id);
    if (!videocreator)
      return res
        .status(400)
        .send(`Video Creator with id ${req.params._id} does not exist!`);
    await videocreator.remove();
    return res.send(videocreator);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* POST setup a new video creator profile
router.post("/profile-setup", async (req, res) => {
  try {
    const { error } = validateVideoCreatorProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let videocreatorprofile = await VideoCreatorProfile.findOne({ Name: req.body.Name });
    if (videocreatorprofile)
      return res.status(400).send(`Video Creator Profile Already Exists`);

    videocreatorprofile = new VideoCreatorProfile({
      Name: req.body.Name,
      Location: req.body.Location,
      Skills: {
        skillOne: req.body.skillOne,
        skillTwo: req.body.skillTwo,
        skillThree: req.body.skillThree
      },
      SocialLinks: {
        Youtube: req.body.Youtube,
        Twitter: req.body.Twitter,
        emailAddress: req.body.emailAddress
      }
    });

    await videocreatorprofile.save();
    return res.send({
      Name: videocreatorprofile.Name,
      Location: videocreatorprofile.Location,
      Skills: {
        skillOne: videocreatorprofile.skillOne,
        skillTwo: videocreatorprofile.skillTwo,
        skillThree: videocreatorprofile.skillThree
      },
      SocialLinks: {
        Youtube: videocreatorprofile.Youtube,
        Twitter: videocreatorprofile.Twitter,
        emailAddress: videocreatorprofile.emailAddress
      }
    });
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* GET all video creator profiles
router.get("/profile", async (req, res) => {
  try {
    const videocreatorprofile = await VideoCreatorProfile.find();
    return res.send(videocreatorprofile);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

//* Get a video creator profile by id
router.get("/profile/:_id", async (req, res) => {
  try {
    const videocreatorprofile = await VideoCreatorProfile.findById(req.params._id);
    return res.send(videocreatorprofile);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

module.exports = router;
