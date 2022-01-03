const connectDb = require("./db/db");
const companiesRouter = require("./routes/companies");
const videoCreatorsRouter = require("./routes/videocreators");
const express = require("express");
const cors = require("cors");

const fs = require('fs');
const path = require('path');

const app = express();
connectDb();


//TODO: Add appropriate schemas/models to the models folder.
//! NOTE - you can modify the user.js schema, but make sure to adjust validation accordingly!
//TODO: Add routes to the routes folder. By convention, there should be a file for each schema/model
//! NOTE - for each route file, don't forget to import your router into index.js and add a new app.use statement below!

app.use(cors());
app.use(express.json());
app.use(`/api/company`, companiesRouter);
app.use(`/api/video-creator`, videoCreatorsRouter);

app.use('uploads/images', express.static(path.join('uploads', 'images')));
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

const port = process.env.PORT || 3200;
app.listen(port, () => {
  console.log(`Server started on port: ${port}`);
});
