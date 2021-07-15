import { useRef, useState } from "react";
import { Button, Input } from "antd";
import "./App.css";

const displayMediaOptions = {
  video: {
    cursor: "always",
  },
  audio: false,
  logicalSurface: false,
};

// const gdmOptions = {
//   video: {
//     cursor: "always" // 始终显示鼠标信息
//   },
//   // audio 配置信息是可选的
//   audio: {
//     echoCancellation: true,
//     noiseSuppression: true,
//     sampleRate: 44100
//   }
// }

const App = () => {
  const videoRef = useRef();
  const [isCapturing, setIsCapturing] = useState(false);
  const [recorder, setRecorder] = useState(null);

  const startCapture = () => {
    setIsCapturing(true);
    navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then(
      (stream) => {
        videoRef.current.srcObject = stream;
        createRecorder(stream);
        dumpOptionsInfo();
        
      },
      (err) => {
        console.error("Error: " + err);
      }
    );
  };

  const stopCapture = (evt) => {
    setIsCapturing(false);
    let tracks = videoRef.current.srcObject.getTracks();
    tracks.forEach((track) => track.stop());

    recorder.stop()
    videoRef.current.srcObject = null;
  };

  const createRecorder = (stream) => {
    const tempRecorder = new MediaRecorder(stream)
    tempRecorder.start();
    const chunks = [];
    tempRecorder.onstop = event => {
      let blob = new Blob(chunks, {
        type: 'video/mp4'
      });
      saveMedia(blob);
    }

    tempRecorder.ondataavailable = event => {
      chunks.push(event.data);
    };

    setRecorder(tempRecorder);
    
  }

  const saveMedia = (blob) => {
    let url = window.URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.innerHTML = "test";
    a.download = "test.mp4";
    a.href = url;
    document.body.appendChild(a);
    a.click()
    document.body.removeChild(a);
  }

  const dumpOptionsInfo = () => {
    const videoTrack = videoRef.current.srcObject.getVideoTracks()[0];
    console.info("Track settings:");
    console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
    console.info("Track constraints:");
    console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
  };

  return (
    <div className="App">
      <Button onClick={isCapturing ? stopCapture : startCapture}>
        {isCapturing ? "结束录制" : "开始录制"}
      </Button>
      <video id="video" ref={videoRef} autoPlay></video>
    </div>
  );
};

export default App;
