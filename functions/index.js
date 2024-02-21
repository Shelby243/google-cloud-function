/* eslint-disable comma-dangle */
/* eslint-disable object-curly-spacing */
/* eslint-disable indent */
/* eslint-disable max-len */
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");

setGlobalOptions({ maxInstances: 10 });
// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Main App
const app = express();

app.use(cors({ origin: true }));

// Routes
app.get("/", (req, res) => {
  return res.status(200).send("Welcome to Google cloud functions API");
});

// Create -> post()
app.post("/api/create", (req, res) => {
  (async () => {
    try {
      await getFirestore()
        .collection("userDetails")
        .doc(`/${Date.now()}/`)
        .create({
          id: Date.now(),
          name: req.body.name,
          mobile: req.body.mobile,
          address: req.body.address,
        });
      return res.status(200).send({ status: "success", msg: "Date saved" });
    } catch (error) {
      console.log("error: ", error);
      return res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});
app.post("/api/v1/predict", (req, res) => {
  (async () => {
    try {
      const pred = await axios.post(
        "https://solutions-challenge-5lwmw6wrbq-lm.a.run.app/predict",
        {
          data: req.body.data,
        }
      );
      const timestamp = new Date().toISOString();
      const temp = pred.data.prediction[0][0];
      const hum = pred.data.prediction[0][1];
      const currTemp = req.body.data[req.body.data.length - 1]["temperature"];
      const currHum = req.body.data[req.body.data.length - 1]["humidity"];

      await getFirestore()
        .collection("Temp&Humidity")
        .doc(`/${Date.now()}/`)
        .create({
          id: Date.now(),
          timestamp: timestamp,
          predict_temp: temp,
          current_temp: currTemp,
          predict_hum: hum,
          current_hum: currHum,
        });
      return res.status(200).send({ status: "success", msg: "Date saved" });
    } catch (error) {
      console.log("error: ", error);
      return res.status(500).send({ status: "Failed", msg: error });
    }
  })();
});
// get -> get()

// fetch all data from firestore

app.get("/api/v1/data", (req, res) => {
  (async () => {
    try {
      const response = [];
      const snapshot = await getFirestore()
        .collection("Temp&Humidity")
        .orderBy("timestamp", "asc")
        .get();
      snapshot.forEach((doc) => {
        const selectedItem = {
          timestamp: doc.data().timestamp,
          predict_temp: doc.data().predict_temp,
          current_temp: doc.data().current_temp,
          predict_hum: doc.data().predict_hum,
          current_hum: doc.data().current_hum,
        };
        response.push(selectedItem);
      });

      return res.status(200).send({ status: "Success", data: response });
    } catch (error) {
      return res.status(500).send({ status: "Failded", msg: error });
    }
  })();
});

// export the api to firebase cloud functions

exports.app = onRequest(app);
