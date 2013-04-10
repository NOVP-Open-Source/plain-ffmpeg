var FFmpeg = require('./plain-ffmpeg');

testOptionsAreSet = function() {
	if (ffmpeg.input_path === 'test_input_path')
		console.log("Setting input path: OK")
	else
		console.log("Setting input path: FAIL")


	if (ffmpeg.output_path === 'test_output_path')
		console.log("Setting output path: OK")
	else
		console.log("Setting output path: FAIL")


	if (ffmpeg.options.in['-r'] === '24')
		console.log("Setting input option: OK")
	else
		console.log("Setting input opiton: FAIL")

	if (ffmpeg.options.out['-y'] === null)
		console.log("Setting output option: OK")
	else
		console.log("Setting output opiton: FAIL")

	if (ffmpeg._compileOptions().toString() === [ '-r', '-i', 'test_input_path', '-y', 'test_output_path' ].toString())
		// Converting to strings and comparing is not a guarantee,
		// but it's a good enough option for now.
		// TODO: change array comparison method.
		console.log("Compiling options: OK")
	else
		console.log("Compiling options: FAIL")
}

// Test setter methods
console.log('Testing setter methods:')

ffmpeg = new FFmpeg();

ffmpeg.input('test_input_path');
ffmpeg.output('test_output_path');
ffmpeg.in('-r', '24')
ffmpeg.out('-y');

testOptionsAreSet();

// Test constructor
console.log('Testing constructor:')

options = {
	in: {'-r': '24'},
	out: {'-y': null}
}

ffmpeg = new FFmpeg('test_input_path', 'test_output_path', options)

testOptionsAreSet();