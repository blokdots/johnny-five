# blokdots × Johnny Five


## Adding a component

You need to:
1. Add a component file in the "[lib/](lib/)" folder
2. Add the component to the "[lib/johnny-five.js](lib/johnny-five.js)" file
3. If I2C add the config to the "[lib/sip.js](lib/sip.js)" file
4. Add a test file in the "[eg/](eg/)" folder
5. (Also add a test file for contributing to Johnny-Five, see [CONTRIBUTING.md](CONTRIBUTING.md))


## New added components

### SI1145 — Grove Sunlight Sensor

* [Grove Wiki](https://wiki.seeedstudio.com/Grove-Sunlight_Sensor/) 
* [Data Sheet](https://files.seeedstudio.com/wiki/Grove-Sunlight_Sensor/res/Si1145-46-47.pdf)
* [Equivalent Arduino Library](https://github.com/adafruit/Adafruit_SI1145_Library/blob/master/Adafruit_SI1145.cpp)


#### Test Run

```sh
# From root 
node eg/blokdots_sunlight-si1145.js
```

→ [Test file](eg/blokdots_sunlight-si1145.js) if it works\
→ File to edit [I2C config](lib/sip.js) in (search for `SI1145`)\
→ [Component File](lib/blokdots_sunlight.js)