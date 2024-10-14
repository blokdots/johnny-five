const { Board, CO2 } = require("../lib/johnny-five.js");
const board = new Board();

board.on("ready", () => {
  /*
   * This is the simplest initialization
   * We assume SW_SERIAL0 for the port
   */
  var co2 = new CO2({
    pins: {
      rx: 2,
      tx: 3,
    },
  });

  // If CO2 concentration or temperature change, log it
  co2.on("data", (data) => {
    console.log("DATA\t", "CO2:", data.co2, "Temp:", data.temperature);
  });

  co2.on("change", (data) => {
    console.log("CHANGE\t", "CO2:", data.co2, "Temp:", data.temperature);
  });
});
