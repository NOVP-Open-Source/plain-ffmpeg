var spawn = require('child_process').spawn,
    split = require('split'),
    EventEmiter = require('events').EventEmitter;

function FFmpeg(options) {
    
    var self = {};
    self.options = options || {};

    self.proc = new EventEmiter();

    // Bind `on` events to the eventEmiter, so instead of:
    //   ffmpeg.proc.on(event);
    // you can write:
    //   ffmpeg.on(event);
    self.on = self.proc.on.bind(self.proc);

    // Pushes options to an array in the right order
    self._compileOptions = function(options) {
        var compiled_options = [];
        
        // First set the global FFmpeg options
        for (var key in self.options.global) {
            compiled_options.push(key);
            if (self.options.global[key]) {
                compiled_options.push(self.options.global[key]);
            }
        }
        
        // Remember the input path
        var inputPath = self.options.input['-i'];

        console.log(self.options.input['-i']);
        
        if (typeof inputPath === 'undefined') {
            throw "Input path is not defined";
        }

        // Delete the key so it doesn't show up as a input parameter
        // along with the other params.
        delete self.options.input['-i'];

        for (var key in self.options.input) {
            compiled_options.push(key);
            if (self.options.input[key]) {
                compiled_options.push(self.options.input[key]);
            }
        }

        compiled_options.push('-i');
        compiled_options.push(inputPath);

        // The logic applied here is that the output path
        // will be the only output parameter key that
        // doesn't start with a "-" 
        output_path = undefined;
        for (var key in self.options.output) {
            if (key[0] !== '-') {
                // We found the output path!
                output_path = key; continue;
            }
            compiled_options.push(key);
            if (self.options.output[key]) {
                compiled_options.push(self.options.output[key]);
            }
        }

        if (typeof output_path === 'undefined') {
            throw "Output path is not defined";
        }
        
        compiled_options.push(output_path);

        return compiled_options;
    }

    self._parseProgress = function(line) {
        // Values, ordered:
        //
        // [current frame, frames per second, q (codec dependant parameter),
        // target size, time mark, bitrate]
        //
        // Regex matches series of digits, 'dot' and colons.
        var progressValues = line.match(/[\d.:]+/g)

        var progress = {
            frame:      progressValues[0],
            fps:        progressValues[1],
            targetSize: progressValues[3],
            timeMark:   progressValues[4],
            kbps:       progressValues[5] || 0,  // in case of "N/A"
        }

        return progress;
    }

    self._parseInputProperties = function(line) {
        // Properties: [duration, start, bitrate]
        // Note: regex matches single ':' chars, so we remove them.
        var values = line.match(/[\d.:]+/g).filter(function(val) {
            return val !== ':';
        });

        var properties = {
            duration:      values[0],
            bitrate_kbps:  values[2]
        }

        return properties;
    }

    self._handleInfo = function(line) {
        var line = line.trim();
        if (line.substring(0, 5) === 'frame') {
            self.proc.emit('progress', self._parseProgress(line));
        }
        if (line.substring(0, 8) === 'Duration') {
            var inputProperties = self._parseInputProperties(line);
            self.properties.input = inputProperties;
            self.proc.emit('properties', {from: 'input', data: inputProperties});
        }
    }

    self.start = function(callback) {
        var proc = spawn('ffmpeg', self._compileOptions(self.options));

        proc.stderr.pipe(process.stdin);
        
        // `self.proc` is the exposed EventEmitter, so we need to pass
        // events and data from the actual process to it.
        var default_events = ['data', 'error', 'exit', 'close', 'disconnect'];
        default_events.forEach(function(event) {
            proc.on(event, self.proc.emit.bind(self.proc, event));
        })
        
        // FFmpeg information is written to `stderr`. We'll call this
        // the `info` event.
        // `split()` makes sure the parser will get whole lines.
        proc.stderr.pipe(split(/[\r\n]+/)).on('data', self.proc.emit.bind(self.proc, 'info'));

        // We also need to pass `stderr` data to a function that will
        // filter and emit `progress` events.
        proc.stderr.pipe(split(/[\r\n]+/)).on('data', self._handleInfo);

        // Return the process object, in case anyone needs it.
        if (callback)
            callback(null, proc); // no error
        
        return self;
    }

    return self;
}

module.exports = FFmpeg;
