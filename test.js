var FFmpeg = require('./plain-ffmpeg');

options = {
	global: {
		'-y': null,
	},
	input: {
		'-i': 'http://istec.colostate.edu/me/facil/dynamics/files/drop.avi'
	},
	output: {
		'-f': 'mp4',
		'-c:v': 'libx264',
		'-c:a': 'libfaac',
		'test.mp4': null
	}
}

ffmpeg = new FFmpeg(options);
ffmpeg.start()

// console.log(ffmpeg.options);

// // Test progress parser
// ffmpeg = new FFmpeg();

// progress_string = "frame=  182 fps= 62 q=32766.0 Lsize=     301kB time=00:00:06.00 bitrate= 411.5kbits/s";
// progress_obj = {frame: '182', fps: '62', targetSize: '301', timeMark: '00:00:06.00', kbps: '411.5'};

// console.log("Parsed progress:");
// console.log(ffmpeg._parseProgress(progress_string));

// // TODO: test the eventEmiter

// ffmpeg = new FFmpeg();
// ffmpeg.on('data', function(){})
// if ('data' in ffmpeg.proc._events)
// 	console.log("Binding events OK");
// else
// 	console.log("Binding events FAIL");