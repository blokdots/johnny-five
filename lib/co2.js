const Board = require("./board");
const Emitter = require("events");
const Pin = require("./pin");
const priv = new Map();

/* Grove CO2 Sensor MH-Z16 */

const commandReadGas = Buffer.from([
  0xff,
  0x01,
  0x86,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x79,
]);

/**
 *
 * @constructor
 *
 * @param {Object} options Options: pin(s), serialport
 *
 * Sample initialization
 *
 *    new five.CO2({ pins: {rx: 2, tx: 3});
 *
 */

class CO2 extends Emitter {
  constructor(options) {
    super();

    // Allow users to pass in a 2 element array for rx and tx pins
    if (Array.isArray(options)) {
      options = {
        pins: {
          rx: options[0],
          tx: options[1],
        },
      };
    }

    if (typeof options.pins === "undefined") {
      options.pins = {};
    }

    this.baud = 9600;
    this.maxBytesToRead = 9;

    Board.Component.call(this, (options = Board.Options(options)));

    // Create a "state" entry for privately
    // storing the state of the instance
    let state = {
      temperature: 0.0,
      co2: 0.0,
    };

    priv.set(this, state);

    // Getters for private state values
    Object.defineProperties(this, {
      temperature: {
        get() {
          return state.temperature;
        },
      },
      co2: {
        get() {
          return state.co2;
        },
      },
    });

    if (this.initialize) {
      this.initialize(options);
    }
  }

  /*
   * Default intialization for CO2 Sensor
   */
  initialize(options) {
    const state = priv.get(this);
    state.portId =
      options.serialPort || options.portId || options.port || options.bus;

    // firmata.js has a SERIAL_PORT_IDs.DEFAULT that is not
    // necessary in other IO plugins so it won't always exist.
    if (typeof state.portId === "undefined" && this.io.SERIAL_PORT_IDs) {
      state.portId = this.io.SERIAL_PORT_IDs.SW_SERIAL0;
    }

    // Set the pin modes
    ["tx", "rx"].forEach((pin) => {
      if (this.pins[pin]) {
        this.io.pinMode(this.pins[pin], this.io.MODES.SERIAL);
      }
    });

    this.io.serialConfig({
      portId: state.portId,
      baud: this.baud,
      rxPin: this.pins.rx,
      txPin: this.pins.tx,
    });

    // Start reading from serial port and send the readGasConcentration command every X milliseconds
    this.listen(1000);
  }

  // if you know what you are doing you can send additional commands, like sensor calibration
  sendCommand(commandByteArray) {
    const state = priv.get(this);
    this.io.serialWrite(state.portId, commandByteArray);
  }

  listen(intervalFrequency) {
    const state = priv.get(this);

    let received = [];
    this.io.serialRead(state.portId, this.maxBytesToRead, (data) => {
      received.push(...data);
      if (received.length >= this.maxBytesToRead) {
        const data = Buffer.from(received);
        if (calculateChecksum(data) === data[8]) {
          this.calculateGasConcentration(data);
        }
        received = [];
      }
    });

    this.interval = setInterval(() => {
      this.io.serialWrite(state.portId, commandReadGas);
    }, intervalFrequency);
  }

  calculateGasConcentration(byteBuffer) {
    const state = priv.get(this);
    const last = { ...state };

    state.co2 = calculateGas(byteBuffer);
    state.temperature = calculateTemp(byteBuffer);

    this.emit("data", {
      temperature: state.temperature,
      co2: state.co2,
    });

    if (last.temperature !== state.temperature || last.co2 !== state.co2) {
      this.emit("change", {
        temperature: state.temperature,
        co2: state.co2,
      });
    }
  }
}

function calculateChecksum(buffer) {
  let checksum = 0;
  for (let i = 1; i < 8; i++) {
    checksum += buffer[i];
  }
  checksum = 0xff - (checksum % 256);
  checksum += 1;
  return checksum;
}

function calculateGas(buffer) {
  return buffer[2] * 256 + buffer[3];
}

function calculateTemp(buffer) {
  return buffer[4] - 40;
}

/* istanbul ignore else */
if (!!process.env.IS_TEST_MODE) {
  CO2.purge = () => {
    priv.clear();
  };
}
module.exports = CO2;
