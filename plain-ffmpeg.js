var spawn = require('child_process').spawn,
    split = require('split');

function FFmpeg(input_path, output_path, options) {
    var self = {};
    
    var options = options || {};

    self.proc = null;
    self.input_path = input_path  || null;
    self.output_path = output_path || null;
    self.options = {
        in:  options.in  || {},
        out: options.out || {}
    };

    self._option = function(opt, key, val) {
        self.options[opt][key] = (val || null);
    }

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
        if (line.substring(0,5) === 'frame') {
            self.proc.emit('progress', line);
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
        self.proc.stderr.pipe(split(/[\r\n]+/)).on('data', self._parseProgress)
        return self;
    }

    return self;
}

module.exports = FFmpeg;
