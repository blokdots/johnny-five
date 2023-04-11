const Board = require("./board");
const Pin = require("./pin");
// const { toFixed } = require("./fn");

/**
 * This atrocity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
function sleepus(usDelay) {
  const startTime = process.hrtime();
  let deltaTime;
  let usWaited = 0;

  while (usDelay > usWaited) {
    deltaTime = process.hrtime(startTime);
    usWaited = (deltaTime[0] * 1e9 + deltaTime[1]) / 1000;
  }
}

/**
 * This atrocity is unfortunately necessary.
 * If any other approach can be found, patches
 * will gratefully be accepted.
 */
function sleep(ms) {
  sleepus(ms * 1000);
}

// https://github.com/Seeed-Studio/Seeed_RGB_LED_Matrix/blob/master/grove_two_rgb_led_matrix.cpp

const COLORS = {
  red: 0x00,
  orange: 0x12,
  yellow: 0x18,
  green: 0x52,
  cyan: 0x7f,
  blue: 0xaa,
  purple: 0xc3,
  pink: 0xdc,
  white: 0xfe,
  black: 0xff,
};

const transformMStoHex = (ms) => {
  let d = Math.floor(ms * 32.7675);
  if (d > 255 * 255) {
    d = 255 * 255;
  }

  return d;
};

const Controllers = {
  MY9221: {
    REGISTER: {
      value: {
        I2C_CMD_CONTINUE_DATA: 0x81,

        GROVE_TWO_RGB_LED_MATRIX_DEF_I2C_ADDR: 0x65, // The device i2c address in default
        GROVE_TWO_RGB_LED_MATRIX_VID: 0x2886, // Vender ID of the device
        GROVE_TWO_RGB_LED_MATRIX_PID: 0x8005, // Product ID of the device

        I2C_CMD_GET_DEV_ID: 0x00, // This command gets device ID information
        I2C_CMD_DISP_BAR: 0x01, // This command displays LED bar
        I2C_CMD_DISP_EMOJI: 0x02, // This command displays emoji
        I2C_CMD_DISP_NUM: 0x03, // This command displays number
        I2C_CMD_DISP_STR: 0x04, // This command displays string
        I2C_CMD_DISP_CUSTOM: 0x05, // This command displays user-defined pictures
        I2C_CMD_DISP_OFF: 0x06, // This command cleans the display
        I2C_CMD_DISP_ASCII: 0x07, // not use
        I2C_CMD_DISP_FLASH: 0x08, // This command displays pictures which are stored in flash
        I2C_CMD_DISP_COLOR_BAR: 0x09, // This command displays colorful led bar
        I2C_CMD_DISP_COLOR_WAVE: 0x0a, // This command displays built-in wave animation
        I2C_CMD_DISP_COLOR_CLOCKWISE: 0x0b, // This command displays built-in clockwise animation
        I2C_CMD_DISP_COLOR_ANIMATION: 0x0c, // This command displays other built-in animation
        I2C_CMD_DISP_COLOR_BLOCK: 0x0d, // This command displays an user-defined color
        I2C_CMD_STORE_FLASH: 0xa0, // This command stores frames in flash
        I2C_CMD_DELETE_FLASH: 0xa1, // This command deletes all the frames in flash

        I2C_CMD_LED_ON: 0xb0, // This command turns on the indicator LED flash mode
        I2C_CMD_LED_OFF: 0xb1, // This command turns off the indicator LED flash mode
        I2C_CMD_AUTO_SLEEP_ON: 0xb2, // This command enable device auto sleep mode
        I2C_CMD_AUTO_SLEEP_OFF: 0xb3, // This command disable device auto sleep mode (default mode)

        I2C_CMD_DISP_ROTATE: 0xb4, // This command setting the display orientation
        I2C_CMD_DISP_OFFSET: 0xb5, // This command setting the display offset

        I2C_CMD_SET_ADDR: 0xc0, // This command sets device i2c address
        I2C_CMD_RST_ADDR: 0xc1, // This command resets device i2c address
        I2C_CMD_TEST_TX_RX_ON: 0xe0, // This command enable TX RX pin test mode
        I2C_CMD_TEST_TX_RX_OFF: 0xe1, // This command disable TX RX pin test mode
        I2C_CMD_TEST_GET_VER: 0xe2, // This command use to get software version
        I2C_CMD_GET_DEVICE_UID: 0xf1, // This command use to get chip id
      },
    },
    initialize: {
      value(options) {
        this.address = this.REGISTER.GROVE_TWO_RGB_LED_MATRIX_DEF_I2C_ADDR;
        options.address = this.address;
        this.io.i2cConfig(options);
      },
    },
    clear: {
      value() {
        this.io.i2cWrite(this.address, [this.REGISTER.I2C_CMD_DISP_OFF]);
        return this;
      },
    },
    fullColor: {
      value(color) {
        const r = color.r; // .toString(16);
        const g = color.g; // .toString(16);
        const b = color.b; // .toString(16);

        console.log(r, g, b);

        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_COLOR_BLOCK,
          r,
          g,
          b,
          0xff,
          0xff,
          true,
        ]);
        return this;
      },
    },
    colorBar: {
      value(percent = 100) {
        let val = Math.floor((percent / 100) * 32);

        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_COLOR_BAR,
          val,
          0xff,
          0xff,
          true,
        ]);
        return this;
      },
    },
    colorWave: {
      value(color = "red", duration = 1000) {
        // freq in ms

        let c = COLORS[color];

        let d = transformMStoHex(duration);

        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_COLOR_WAVE,
          c,
          d & 0xff,
          (d >> 8) & 0xff,
          true,
        ]);
        return this;
      },
    },
    displayColorAnimation: {
      value(index = 2, duration = 1000) {
        let d = transformMStoHex(duration);

        let from = 0;
        let to = 0;

        switch (index) {
          case 0:
            from = 0;
            to = 28;
            break;

          case 1:
            from = 29;
            to = 41;
            break;

          case 2: // rainbow cycle
            from = 255;
            to = 255;
            break;

          case 3: // fire
            from = 254;
            to = 254;
            break;

          case 4: // walking
            from = 42;
            to = 43;
            break;

          case 5: // broken heart
            from = 44;
            to = 52;
            break;

          default:
            break;
        }

        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_COLOR_ANIMATION,
          from,
          to,
          d & 0xff,
          (d >> 8) & 0xff,
          true,
        ]);

        return this;
      },
    },
    displayString: {
      value(text, duration = 1000, color = "red") {
        let d = transformMStoHex(duration);
        let c = COLORS[color];

        const data = [];

        for (let i = 0; i < text.length; i++) {
          data[i] = text.charCodeAt(i);
        }

        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_STR,
          true,
          d & 0xff,
          (d >> 8) & 0xff,
          text.length,
          c,
          ...data,
        ]);

        return this;
      },
    },
    displayNumber: {
      value(num, duration = 1000, color = "red") {
        let d = transformMStoHex(duration);
        let c = COLORS[color];

        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_NUM,
          num & 0xff,
          (num >> 8) & 0xff,
          d & 0xff,
          (d >> 8) & 0xff,
          true,
          c,
        ]);

        return this;
      },
    },
    displayEmoji: {
      value(emojiIndex) {
        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_EMOJI,
          emojiIndex,
          0xff,
          0xff,
          true,
        ]);

        return this;
      },
    },
    draw: {
      value(bitmap) {
        const data = [];

        data[0] = this.REGISTER.I2C_CMD_DISP_CUSTOM;
        data[1] = 0xff; // duration
        data[2] = 0xff; // duration
        data[3] = true; // display forever
        data[4] = 1; // frame count
        data[5] = 0; // current frame index
        data[6] = 0; // empty
        data[7] = 0; // empty

        for (let i = 0; i < bitmap.length; i++) {
          data[8 + i] = bitmap[i];
        }

        let dummy = data.splice(0, 24);
        this.io.i2cWrite(this.address, dummy);

        sleep(1);

        dummy = data.splice(0, 24);
        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_CONTINUE_DATA,
          ...dummy,
        ]);

        sleep(1);

        dummy = data.splice(0, 24);
        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_CONTINUE_DATA,
          ...dummy,
        ]);

        return this;
      },
    },
    rotateDisplay: {
      value(orientation) {
        console.log("should rotate to", orientation);
        this.io.i2cWrite(this.address, [
          this.REGISTER.I2C_CMD_DISP_ROTATE,
          orientation,
        ]);
        return this;
      },
    },
  },
};

Controllers.DEFAULT = Controllers.MY9221;

class LEDMatrix {
  constructor(options) {
    Board.Component.call(this, (options = Board.Options(options)));

    console.log(options);

    Board.Controller.call(this, Controllers, options);

    if (this.initialize) {
      this.initialize(options);
    }

    if (options.orientation) {
      this.rotateDisplay(options.orientation);
    }

    Object.defineProperties(this, {});
  }
  clear() {}
  send() {}
  draw(bitmap) {
    let buffer = [];
  }
  off() {
    console.log("off");
    this.send(this.REGISTER.I2C_CMD_DISP_OFF);
  }
  rotateDisplay() {}
}

module.exports = LEDMatrix;
