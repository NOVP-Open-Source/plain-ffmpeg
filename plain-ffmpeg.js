var spawn = require('child_process').spawn;

function FFmpeg(input, output, options) {
    var self = {};
    
    var options = options || {};

    self.proc = null;
    self.input = input || null;
    self.output = output || null;
    self.options = {
        in:  options.in  || {},
        out: options.out || {}
    };

    self._option = function(opt, key, val) {
        self.options[opt][key] = (val || null);
    }

    self._compileOptions = function() {
        compiled_options = [];
        for (var key in self.options.in) {
            compiled_options.push(key);
            if (self.options[key])
                compiled_options.push(self.options[key]);
        }
        compiled_options.push('-i');
        compiled_options.push(self.input);
        for (var key in self.options.out) {
            compiled_options.push(key);
            if (self.options[key])
                compiled_options.push(self.options[key]);
        }
        compiled_options.push(self.output);
        return compiled_options;
    }

    self.in = function(key, val) {
        self._option('in', key, val);
        return self;
    }

    self.out = function(key, val) {
        self._option('out', key, val);
        return self;
    }

    self.start = function() {
        self.proc = spawn('ffmpeg', self._compileOptions());
        return self;
    }

    return self;
}

module.exports = FFmpeg;