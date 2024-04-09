const Board = require("./board");
const Emitter = require("events");
const { toFixed, map } = require("./fn");

const Controllers = {
  TCS3472: {
    initialize: {
      value(options, callback) {
        // const state = priv.get(this);
        // state.gain = options.gain || 16;
        // state.integrationTime = options.integrationTime || 700;
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "TCS3472", options).on("data", (data) =>
          callback(data),
        );
      },
    },
  },
};

class ColorSensor extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(this, (options = Board.Options(options)));
    Board.Controller.call(this, Controllers, options);

    // this.calibration = {
    //   white: {
    //     r: 65535,
    //     g: 65535,
    //     b: 65535,
    //   },
    //   black: {
    //     r: 8546,
    //     g: 11065,
    //     b: 9999,
    //   },
    // };

    const freq = options.freq || 250;
    let last = null;
    let raw = null;

    if (typeof this.initialize === "function") {
      this.initialize(options, (data) => {
        raw = data;
      });
    }

    Object.defineProperties(this, {
      raw: {
        get() {
          return raw;
        },
      },
      rgb: {
        get() {
          // https://forums.adafruit.com/viewtopic.php?t=140172

          const r = Math.floor(raw.r / 256);
          const g = Math.floor(raw.g / 256);
          const b = Math.floor(raw.b / 256);

          return {
            r: r,
            g: g,
            b: b,
          };
        },
      },
      lux: {
        get() {
          /* This only uses RGB ... how can we integrate clear or calculate lux */
          /* based exclusively on clear since this might be more reliable?      */
          let illuminance =
            -0.32466 * raw.r + 1.57837 * raw.g + -0.73191 * raw.b;

          return toFixed(illuminance, 0);
        },
      },
      temp: {
        get() {
          let X, Y, Z; /* RGB to XYZ correlation      */
          let xc, yc; /* Chromaticity co-ordinates   */
          let n; /* McCamy's formula            */
          let cct;

          /* 1. Map RGB values to their XYZ counterparts.    */
          /* Based on 6500K fluorescent, 3000K fluorescent   */
          /* and 60W incandescent values for a wide range.   */
          /* Note: Y = Illuminance or lux                    */
          X = -0.14282 * raw.r + 1.54924 * raw.g + -0.95641 * raw.b;
          Y = -0.32466 * raw.r + 1.57837 * raw.g + -0.73191 * raw.b;
          Z = -0.68202 * raw.r + 0.77073 * raw.g + 0.56332 * raw.b;

          /* 2. Calculate the chromaticity co-ordinates      */
          xc = X / (X + Y + Z);
          yc = Y / (X + Y + Z);

          /* 3. Use McCamy's formula to determine the CCT    */
          n = (xc - 0.332) / (0.1858 - yc);

          /* Calculate the final CCT */
          cct =
            449.0 * Math.pow(n, 3) +
            3525.0 * Math.pow(n, 2) +
            6823.3 * n +
            5520.33;

          /* Return the results in degrees Kelvin */
          return toFixed(cct, 0);
        },
      },
    });

    setInterval(() => {
      if (raw === null) {
        return;
      }

      const data = {
        c: this.raw.c,
        r: this.raw.r,
        g: this.raw.g,
        b: this.raw.b,
      };

      this.emit("data", data);

      if (
        last === null ||
        this.raw.c !== last.c ||
        this.raw.r !== last.r ||
        this.raw.g !== last.g ||
        this.raw.b !== last.b
      ) {
        // only emit if has values
        if (last !== null) {
          this.emit("change", data);
        }

        last = { ...data };
      }
    }, freq);
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  ColorSensor.Controllers = Controllers;
  ColorSensor.purge = function () {};
}

module.exports = ColorSensor;
