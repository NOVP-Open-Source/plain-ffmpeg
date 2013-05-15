var spawn = require('child_process').spawn,
    split = require('split'),
    EventEmiter = require('events').EventEmitter;

function FFmpeg(input_path, output_path, options) {
    var self = {};
    
    var options = options || {};

    self.proc = new EventEmiter();
    self.input_path = input_path  || null;
    self.output_path = output_path || null;
    self.options = {
        in:  options.in  || {},
        out: options.out || {}
    };
    self.properties = {
        input: {},
        output: {}
    };

    // Option setter
    self._option = function(opt, key, val) {
        self.options[opt][key] = (val || null);
        return self;
    }

    // Helper methods for setting input and output options.
    self.in  = self._option.bind(self, 'in');
    self.out = self._option.bind(self, 'out');

    // Bind `on` events to the eventEmiter, so instead of:
    //   ffmpeg.proc.on(event);
    // you can write:
    //   ffmpeg.on(event);
    self.on = self.proc.on.bind(self.proc);

    // Pushes options to an array in the right order
    self._compileOptions = function() {
        var compiled_options = [];
        for (var key in self.options.in) {
            compiled_options.push(key);
            if (self.options.in[key])
                compiled_options.push(self.options.in[key]);
        }
        compiled_options.push('-i');
        compiled_options.push(self.input_path);
        for (var key in self.options.out) {
            compiled_options.push(key);
            if (self.options.out[key])
                compiled_options.push(self.options.out[key]);
        }
        compiled_options.push(self.output_path);
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

    self.input = function(path) {
        self.input_path = path;
        return self;
    }

    self.output = function(path) {
        self.output_path = path;
        return self;
    }

    self.start = function(callback) {
        var proc = spawn('ffmpeg', self._compileOptions());
        
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
