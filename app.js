const express = require("express");
const bodyParser = require("body-parser");
const myRoute = require("./Routes/route");
const HttpError = require("./models/http-errorModel");

const port = 5000;
const app = express();

app.use(bodyParser.json());

app.use("/", myRoute);

app.use((req, res, next) => {
  const error = new HttpError("Could not found route", 404);

  throw error;
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }

  res.status(error.code || 500);
  res.json({ message: error.message ? error.message : "An Error Occured" });
});

app.listen(port);
