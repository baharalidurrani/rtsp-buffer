import FFmpeg from "fluent-ffmpeg";
import WebSocket from "ws";

const bunny =
  "rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov";
const url1 = "rtsp://admin:admin12345@172.16.19.1:554/Streaming/tracks/101";
const url3 = "rtsp://admin:admin12345@172.16.19.1:554/Streaming/tracks/301";
let flag = true;

const wss = new WebSocket.Server({ port: 5000 });
wss.on("connection", (ws) => {
  console.log("Client connected.");
  // ws.on("message", (message) => {
  //   console.log(`Received message => ${message}`);
  // });
  //-f mpegts -codec:v mpeg1video -bf 0 -codec:a mp2 -r 30 -
  flag ? (flag = false) : (flag = true);
  const command = FFmpeg(flag ? url1 : bunny)
    .withNoAudio()
    .format("mpegts")
    .videoCodec("mpeg1video")
    // .outputOptions("-bf 0") // Control B Frames
    .fps(30)
    .on("error", (err: any) => {
      if (!err.message.includes("SIGKILL")) throw err;
      console.log(err.message);
    });
  const stream = command.pipe();
  stream.on("data", (data: any) => {
    ws.send(data);
  });
  ws.on("close", (ws) => {
    // command.ffmpegProc.stdin.write("q");
    command.kill("SIGKILL");
    console.log("Client closed.");
  });
});
