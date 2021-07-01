const Board = require("./board");
const Emitter = require("events");
const { toFixed } = require("./fn");

const Controllers = {
  SI1145: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "SI1145", options)
          .on("data", ({pressure}) => callback(pressure));
      }
    },
    // kPa (Kilopascals)
    toPressure: {
      value(value) {
        // Pressure output in kPa explained at P. 6, Eqn. 2
        // Typical resolution 0.15kPa from paragraph 2.2 page 3
        return toFixed(((65 / 1023) * value) + 50, 2);
      }
    }
  }
};


class Sunlight extends Emitter {
  constructor(options) {
    super();

    Board.Component.call(
      this, options = Board.Options(options)
    );

    Board.Controller.call(this, Controllers, options);

    const freq = options.freq || 25;
    let last = null;
    let raw = null;

    if (!this.toPressure) {
      this.toPressure = options.toPressure || (x => x);
    }

    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        raw = data;
      });
    }

    Object.defineProperties(this, {
      pressure: {
        get() {
          return this.toPressure(raw);
        }
      }
    });

    setInterval(() => {
      if (raw === null) {
        return;
      }

      const data = {
        pressure: this.pressure
      };

      this.emit("data", data);

      if (this.pressure !== last) {
        last = this.pressure;
        this.emit("change", data);
      }
    }, freq);
  }
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  Sunlight.Controllers = Controllers;
  Sunlight.purge = function() {};
}

module.exports = Sunlight;
