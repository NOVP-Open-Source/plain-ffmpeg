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

    // Option setter
    self._option = function(opt, key, val) {
        self.options[opt][key] = (val || null);
    }

    // Helper methods for setting input and output options.
    self.in  = self._option.bind(self, 'in');
    self.out = self._option.bind(self, 'out');

    // Pushes options to an array in the right order
    self._compileOptions = function() {
        var compiled_options = [];
        for (var key in self.options.in) {
            compiled_options.push(key);
            if (self.options[key])
                compiled_options.push(self.options[key]);
        }
        compiled_options.push('-i');
        compiled_options.push(self.input_path);
        for (var key in self.options.out) {
            compiled_options.push(key);
            if (self.options[key])
                compiled_options.push(self.options[key]);
        }
        compiled_options.push(self.output_path);
        return compiled_options;
    }

    self._parseProgress = function(line) {
        if (line.substring(0, 5) === 'frame') {
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
                kbps:       progressValues[5],
            }
            
            self.proc.emit('progress', progress);

            return progress;
        }
        return false;
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
        
        // FFmpeg information is written to `stderr`.
        proc.stderr.on('data', self.proc.emit.bind(self.proc, 'info'));

        // We also need to pass stderr data to a function that will
        // filter and emit progress events. 
        // `split` makes sure the parser will get whole lines.
        proc.stderr.pipe(split(/[\r\n]+/)).on('data', self._parseProgress);

        // Callback the actual process, in case anyone needs it.
        if (callback)
            callback(null, proc); // no error
        
        return self;
    }
    
    return self;
}

module.exports = FFmpeg;
