const { Sunlight, Board } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const sunlight = new Sunlight({
    controller: "SI1145"
  });

  console.log('Sunlight is running ☀️')

  sunlight.on("change", () => {
    console.log("Sunlight:");
    console.log("IR: ", sunlight.ir);
    console.log("UV: ", sunlight.uv);
    console.log("Ambient: ", sunlight.ambient);
    console.log("--------------------------------------");
  });
});
