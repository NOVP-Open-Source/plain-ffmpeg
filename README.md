## Plain FFmpeg

Plain FFmpeg is really tiny library for constructing and executing FFmpeg processes from Node.

### Features

* Output from stderr is formated in JSON
* Unlike other FFmpeg wrappers, it exposes the actual process and it's events
* It doesn't provide convinience methods that mask options i.e you'll be using `.in('-r', 24)` to set the input framerate instead of `.setFramerate(24)`

### Example

One way of starting the process is:

```javascript
var FFmpeg = require('./plain-ffmpeg');

var ffmpeg = new FFmpeg({
    global: {'-y': null},
    input: {
        '-i': 'http://domain.com/video.mp4',
        '-r': 24
    },
    output: {
        'output.mov',
        '-c:v': 'libx264'
    }
});
ffmpeg.start();

ffmpeg.on('progress', function(progress) {
	console.log(progress);
})
```
All methods return the object, so you can chain them like:

```javascript
var ffmpeg = new FFmpeg('input_path', 'output_path').out('-f', 'mp4').start()
```

The third argument in the constructor is an `options` object, so you can pass it presets:

```javascript
var h264_preset = {
	in: {'-r', '24'},
	out: {
		'-c:v': 'libx264', 
		'-c:a': 'libaac'
	}
}

var ffmpeg = new FFmpeg('input_path', null, h264_preset).output('output_path');
ffmpeg.start()
```
