const { ColorSensor, Board } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  const color_sens = new ColorSensor({
    controller: "TCS3472",
  });

  console.log("Color Sensor is running 🎨");

  color_sens.on("change", (v) => {
    console.log("Raw:", color_sens.raw);
    console.log("RGB:", color_sens.rgb);
    console.log("Temp:", color_sens.temp + " K");
    console.log("Lux:", color_sens.lux);

    console.log("---------------------------");
  });
});
