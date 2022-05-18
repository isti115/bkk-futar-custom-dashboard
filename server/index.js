const express = require("express");
const ws = require("ws");

const api = require("./api.js");

const app = express();
// const port = 8004

const fs = require("fs");
// const WEATHER_API_KEY = fs.readFileSync('./WEATHER_API_KEY', 'utf8')
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

// app.get('/', (req, res) => res.send('Hello World!'))

const server = app.listen(PORT, () => console.log(`Listening on ${PORT}!`));

// const wss = new ws.Server({ port })
const wss = new ws.Server({ server });

// const content = data => /* html */ `
// <style>
//   body {
//     background-color: black;
//     color: white;
//   }

//   div#container {
//     display: flex;

//     flex-direction: column;
//     justify-content: center;

//     width: 100%;
//     height: 100%;
//   }

//   div#content {
//     font-size: 30px;
//     text-align: center;
//   }
// </style>
// <div id="container">
//   <div id="content">
//     ${data}
//   </div>
// </div>
// `

const clients = [];

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log("received: %s", message);
  });

  console.log(`Client connected from: ${ws._socket.remoteAddress}`);
  clients.push(ws);
  ws.send(JSON.stringify({ type: "connected" }));

  // ws.send(JSON.stringify([
  //   {
  //     name: 'fillRect',
  //     arguments: [10, 10, 200, 100]
  //   }
  // ]))

  // const interval = setInterval(() => ws.send(content(`${new Date()}`)), 1000)

  ws.on("close", () => {
    clients.splice(clients.indexOf(ws), 1);
    // clearInterval(interval)
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
