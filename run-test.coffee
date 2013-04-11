FFmpeg = require './plain-ffmpeg'

ffmpeg = new FFmpeg()

ffmpeg.input('http://istec.colostate.edu/me/facil/dynamics/files/drop.avi')
ffmpeg.output('out/video.mp4')
ffmpeg.out('-y')
ffmpeg.start()

# console.log ffmpeg

# ffmpeg.proc.stderr.pipe(process.stdout)

ffmpeg.proc.on 'progress', (progress) ->
    console.log progress

# ffmpeg.proc.on 'exit', () ->
#     console.log 'done'

# ffmpeg.proc.stderr.on 'data', () ->
#   console.log 'data!'