const express = require("express");
const ws = require("ws");

const api = require("./api.js");

const app = express();

const fs = require("fs");

const {
  PORT,
  WEATHER_API_KEY,
  WEATHER_LOCATION,
  LEFT_TEXT,
  LEFT_STOP,
  RIGHT_TEXT,
  RIGHT_STOP,
} = JSON.parse(fs.readFileSync("./config.json", "utf8"));

app.use("/", express.static("client"));

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}!`));

const wss = new ws.Server({ server });

const clients = [];

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log("received: %s", message);
  });

  console.log(`Client connected from: ${ws._socket.remoteAddress}`);
  clients.push(ws);
  ws.send(JSON.stringify({ type: "connected" }));

  ws.on("close", () => {
    clients.splice(clients.indexOf(ws), 1);
  });
});

const update = async () => {
  const departuresToWest = await api.bkk.getDepartures(LEFT_STOP);
  const departuresToEast = await api.bkk.getDepartures(RIGHT_STOP);
  const currentTemperature = await api.weather.getCurrentTemperature(
    WEATHER_API_KEY,
    WEATHER_LOCATION
  );

  clients.forEach((c) =>
    c.send(
      JSON.stringify({
        type: "data",
        data: {
          leftText: LEFT_TEXT,
          rightText: RIGHT_TEXT,
          departuresToWest,
          departuresToEast,
          currentTemperature,
        },
      })
    )
  );
};

Object.assign(require("repl").start({}).context, {
  clients,
  reload: () => {
    clients.forEach((c) => c.send(JSON.stringify({ type: "reload" })));
  },
  api,
  update,
  updateInterval: setInterval(update, 5000),
  g: {},
});
