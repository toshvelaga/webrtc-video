// NOTICE: install ffmpeg first
const { launch, getStream } = require('puppeteer-stream')
const fs = require('fs')
const { exec } = require('child_process')

require('dotenv').config()

// puppeteer stream + FFmpeg example: https://github.com/Flam3rboy/puppeteer-stream/blob/main/examples/ffmpeg.js

const ffmpegConfig = (twitch) => {
  return `ffmpeg -i - -v error -c:v libx264 -preset veryfast -tune zerolatency -c:a aac -f flv ${twitch}`
}

let twitch =
  'rtmp://dfw.contribute.live-video.net/app/' + process.env.TWITCH_STREAM_KEY

async function test() {
  const browser = await launch({
    executablePath:
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  })

  const page = await browser.newPage()
  await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  const stream = await getStream(page, {
    audio: true,
    video: true,
    // frameSize: 1000,
  })
  console.log('recording')
  // this will pipe the stream to ffmpeg and convert the webm to mp4 format
  const ffmpeg = exec(ffmpegConfig(twitch))

  ffmpeg.stderr.on('data', (chunk) => {
    console.log(chunk.toString())
  })

  stream.pipe(ffmpeg.stdin)

  //   setTimeout(async () => {
  //     await stream.destroy()
  //     stream.on('end', () => {
  //       console.log('stream has ended')
  //     })
  //     ffmpeg.stdin.setEncoding('utf8')
  //     ffmpeg.stdin.write('q')
  //     ffmpeg.stdin.end()
  //     ffmpeg.kill()

  //     console.log('finished')
  //   }, 1000 * 40)
}

test()
