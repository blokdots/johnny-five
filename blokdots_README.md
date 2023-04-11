# blokdots × Johnny Five

## Adding a component

You need to:

1. Add a component file in the "[lib/](lib/)" folder
2. Add the component to the "[lib/johnny-five.js](lib/johnny-five.js)" file
3. If I2C add the config to the "[lib/sip.js](lib/sip.js)" file
4. Add a test file in the "[eg/](eg/)" folder
5. (Also add a test file for contributing to Johnny-Five, see [CONTRIBUTING.md](CONTRIBUTING.md))

## New added components

### TCS3472 — Grove I2C Color Sensor

- [Grove Wiki](https://wiki.seeedstudio.com/Grove-I2C_Color_Sensor/)
- [Data Sheet](https://github.com/SeeedDocument/Grove-I2C_Color_Sensor/raw/master/res/TCS3472%20Datasheet.pdf)
- [Equivalent Arduino Library](https://github.com/Seeed-Studio/Grove_I2C_Color_Sensor_TCS3472)

### SI1145 — Grove Sunlight Sensor

- [Grove Wiki](https://wiki.seeedstudio.com/Grove-Sunlight_Sensor/)
- [Data Sheet](https://files.seeedstudio.com/wiki/Grove-Sunlight_Sensor/res/Si1145-46-47.pdf)
- [Equivalent Arduino Library](https://github.com/adafruit/Adafruit_SI1145_Library/blob/master/Adafruit_SI1145.cpp)

#### Test Run

```sh
# From root
node eg/blokdots_sunlight-si1145.js
```

→ [Test file](eg/blokdots_sunlight-si1145.js) if it works\
→ File to edit [I2C config](lib/sip.js) in (search for `SI1145`)\
→ [Component File](lib/blokdots_sunlight.js)

### CO2 Sensor

### MY9221 — LED Matrix

! This should be refactored into the `lib/led/matrix.js`. Currently it has its own class `lib/blokdots_LEDMatrix_MY9221.js`

#### Test Run

```sh
# From root
node eg/blokdots_led-matrix-MY9221.js
```

→ [Test file](eg/blokdots_led-matrix-MY9221.js) if it works\
