## Plain FFmpeg

Plain FFmpeg is really tiny library for constructing and executing FFmpeg processes from Node.

### Features

* Output from stderr is formated in JSON
* Unlike other FFmpeg wrappers, it exposes the actual process and it's events
* It doesn't provide convinience methods that mask options i.e you'll be using `.in('-r', 24)` to set the input framerate instead of `.setFramerate(24)`
