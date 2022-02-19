const ffmpeg1 = (twitch) => {
  return `-i - -v error -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -strict -2 -ar 44100 -b:a 64k -y -use_wallclock_as_timestamps 1 -async 1 -bufsize 1000 -f flv ${twitch}`
}

module.exports.ffmpeg1 = ffmpeg1
