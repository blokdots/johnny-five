const Board = require("./board");
const Emitter = require("events");
const { toFixed } = require("./fn");

const Controllers = {
  SI1145: {
    initialize: {
      value(options, callback) {
        const { Drivers } = require("./sip");
        Drivers.get(this.board, "SI1145", options)
          .on("data", data => callback(data));
      }
    },
    toUVindex : {
      value( value ) {
        return toFixed(value / 100, 2);
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

    const freq = options.freq || 250;
    let last = null;
    let raw = null;

    if (!this.toUVindex) {
      this.toUVindex = options.toUVindex || (x => x);
    }

    if (typeof this.initialize === "function") {
      this.initialize(options, data => {
        raw = data;
      });
    }

    Object.defineProperties(this, {
      uv: {
        get() {
          return this.toUVindex(raw.uv);
        }
      },
      ir: {
        get() {
          return raw.ir
        }
      },
      vis: {
        get() {
          return raw.vis
        }
      }
    });

    setInterval(() => {
      if (raw === null) {
        return;
      }

      const data = {
        uv: this.uv,
        ir: this.ir,
        vis: this.vis
      };

      this.emit("data", data);

      if( last === null || this.vis !== last.vis || this.ir !== last.ir || this.uv !== last.uv){
        
        // only emit if has values
        if( last !== null ){
          this.emit("change", data);
        }

        last = {...data};
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
