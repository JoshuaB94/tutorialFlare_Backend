const { videoCreator, validateLogin, validateVideoCreator } = require("../models/videocreator");
const { validateVideoCreatorProfile, VideoCreatorProfile }  = require("../models/videocreatorprofile");
const fileUpload = require("../middleware/file-upload");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcryptjs");
const express = require("express");
const res = require("express/lib/response");
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
      isCreator: req.body.isCreator,
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
        isCreator: videocreator.isCreator,
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
router.post("/:_id/profile-setup",fileUpload.single("image"), async (req, res) => {
  try {
    const { error } = validateVideoCreatorProfile(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const videocreator = await videoCreator.findById(req.params._id);

    let videocreatorprofile = await VideoCreatorProfile.findOne({ _id: req.body.id });
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
      },
      Image: req.body.Image
    });

    await videocreatorprofile.save();

    videocreator.vcProfileId = videocreatorprofile._id 
    await videocreator.save();
    
    return res.send([videocreator, videocreatorprofile]);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

// //* PUT a Video Creator Profile by Id
// router.put("/:_id/profile-update",[fileUpload.single("image"), auth], async (req, res) => {
//   const videocreatorprofile = await VideoCreatorProfile.findById(req.params._id);
//   if (req.body.isCreator) {
//     try {
//       const videocreatorprofile = await VideoCreatorProfile.findByIdAndUpdate(req.params._id, {
//         $set: req.body,
//       });
//       res.status(200).json("Account has been updated");
//     } catch (err) {
//       return res.status(500).json(err);
//     }
//   } else {
//     return res.status(403).json("You can update only your account!");
//   }
// });


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
router.get("/:_id/profile", async (req, res) => {
  try {
    const videocreatorprofile = await VideoCreatorProfile.findById(req.params._id);
    return res.send(videocreatorprofile);
  } catch (ex) {
    return res.status(500).send(`Internal Server Error: ${ex}`);
  }
});

module.exports = router;
