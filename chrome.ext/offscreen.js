// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var socket;


chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === 'offscreen') {
    console.log('Received message in offscreen:', message);
    switch (message.type) {
      case 'start-recording':
        startRecording(message.data);
        break;
      case 'stop-recording':
        stopRecording();
        break;
      default:
        throw new Error('Unrecognized message:', message.type);
    }
  }
});

let data = [];
let processor;

async function startRecording(streamId) {
  const media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  // Continue to play the captured audio to the user.
  const output = new AudioContext({ sampleRate: 16000 });
  recordSampleRate = output.sampleRate;
  console.log('recordSampleRate: ', recordSampleRate);
  const source = output.createMediaStreamSource(media);
  source.connect(output.destination);

  let firstRecordClipTime = -1;



  // 创建 ScriptProcessorNode 采集 PCM（已弃用，但兼容性强）
  const cacheSize = 65536;

  processor = output.createScriptProcessor(16384, 1, 1);
  source.connect(processor);
  processor.connect(output.destination);


  // //使用 AudioEncoder 来编码为 Opus 或 AAC 等压缩格式。但兼容性需要考虑（目前 Chromium 系浏览器支持较好）。
  // const encoder = new AudioEncoder({
  //   output: handleEncodedAudio,
  //   error: (e) => console.error(e),
  // });
  
  // encoder.configure({
  //   codec: 'opus', // 或 'aac'
  //   sampleRate: 16000,
  //   numberOfChannels: 1,
  // });
  
  // function handleEncodedAudio(chunk) {
  //   // chunk.data 就是压缩后的音频数据
  //   console.log('Type:', chunk.type); // 一般为 "key"
  //   console.log('Timestamp:', chunk.timestamp); // 微秒时间戳
  //   console.log('Duration:', chunk.duration);
  //   console.log('Size:', chunk.byteLength);
  //   console.log('Data:', new Uint8Array(chunk.data));
  


  //   if (firstRecordClipTime == -1) {
  //     console.log('firstRecordClipTime', firstRecordClipTime);
  //     firstRecordClipTime = chunk.timestamp;
  //   }

  //   // // 可上传 int16Data 到服务器 或保存本地
  //   // let samplesWithTime = new Float32Array(chunk.data.length + 1);
  //   // //if(floatData.length < 1024) return;
  //   // samplesWithTime[0] = chunk.timestamp - firstRecordClipTime;
    
  //   // // Copy samples into samplesWithTime
  //   // samplesWithTime.set(floatData, 1);
  //   // // for (var i = 0; i < floatData.length; ++i) {
  //   // //   samplesWithTime[i + 1] = floatData[i];
  //   // // }

  //   // console.log('samples.length: ', floatData.length);
  //   // socket.send(samplesWithTime);
  // }


  processor.onaudioprocess = (e) => {
    data.push(e.data);

    const input = e.inputBuffer.getChannelData(0); // Float32 PCM

    // 拼接音频到缓存
    const newBuffer = new Float32Array(bufferQueue.length + input.length);
    newBuffer.set(bufferQueue);
    newBuffer.set(input, bufferQueue.length);
    bufferQueue = newBuffer;

    // 如果达到1秒长度，送入编码器
    if (bufferQueue.length >= targetFrameSize) {
      const frame = bufferQueue.slice(0, targetFrameSize);

      const int16Samples = floatTo16BitPCM(frame);

      const audioData = new AudioData({
        format: 's16',
        sampleRate: sampleRate,
        numberOfFrames: int16Samples.length,
        numberOfChannels: 1,
        timestamp: performance.now() * 1000, // 微秒级时间戳
        data: int16Samples.buffer
      });

      console.log("🧪 AudioData:", {
        sampleRate: audioData.sampleRate,
        frames: audioData.numberOfFrames,
        format: audioData.format,
        byteLength: audioData.allocationSize({ planeIndex: 0 }),
      });


      if (firstRecordClipTime == -1) {
        console.log('firstRecordClipTime', firstRecordClipTime);
        firstRecordClipTime = e.timeStamp;
      }

      // 可上传 int16Data 到服务器 或保存本地
      let samplesWithTime = new Float32Array(input.length + 1);
      //if(input.length < 1024) return;
      samplesWithTime[0] = e.timeStamp - firstRecordClipTime;

      // Copy samples into samplesWithTime
      samplesWithTime.set(input, 1);
      // for (var i = 0; i < input.length; ++i) {
      //   samplesWithTime[i + 1] = input[i];
      // }

      console.log('samples.length: ', input.length);
      socket.send(samplesWithTime);
    };
  
  };

  let sampleRate = 16000;
  let bufferQueue = new Float32Array(0);
  const targetFrameSize = sampleRate * 4; // 1 秒音频 = 16000 个采样
  


  // // Start recording.
  // recorder = new MediaRecorder(media, { mimeType: 'video/webm' });
  // recorder.ondataavailable = async (e) => {
  //   data.push(e.data);
  //   console.log('e.data: ', e.data.size);

  //   if (firstRecordClipTime == -1) {
  //       console.log('firstRecordClipTime', firstRecordClipTime);
  //       firstRecordClipTime = e.timeStamp;
  //   }

  //   // Convert Blob to ArrayBuffer
  //   const arrayBuffer = await e.data.arrayBuffer();
  //   if(arrayBuffer.byteLength < 1024) return;
  //   // console.log('e.data: ', e.data.size, arrayBuffer);

  //   // // Ensure the ArrayBuffer length is a multiple of 4
  //   // let validByteLength = arrayBuffer.byteLength - (arrayBuffer.byteLength % 4);
  //   // if(validByteLength>16384){
  //   //   validByteLength = 16384;
  //   // }
  //   // const validArrayBuffer = arrayBuffer.slice(0, validByteLength);
  //   // console.log('validByteLength: ', validByteLength, validArrayBuffer);
    
  //   // let samples = new Float32Array(validArrayBuffer);

  //   //samples = downsampleBuffer(samples, expectedSampleRate);

  //   console.log('1111111111111111')
  //   try{
  //     //let samples = await processAudioData(arrayBuffer);
  //     let samples = await _getAudioBuffer(e.data);
  //     console.log('2222222222222222222')
  //     let samplesWithTime = new Float32Array(samples.byteLength/4 + 1);
  //     console.log('333333333333333333')
  //     samplesWithTime[0] = e.timeStamp - firstRecordClipTime;
  //     console.log('444444444444444444')

  //     // Copy samples into samplesWithTime
  //     for (var i = 0; i < samples.length; ++i) {
  //         samplesWithTime[i + 1] = samples[i];
  //     }

  //     console.log('samples.length: ', samples.length);
  //     let buf = new Int16Array(samples.length);
  //     for (var i = 0; i < samples.length; ++i) {
  //         let s = samples[i];
  //         if (s >= 1) s = 1;
  //         else if (s <= -1) s = -1;

  //         samples[i] = s;
  //         buf[i] = s * 32767;
  //     }
    
  //     socket.send(samplesWithTime);
  //     //console.log('data sent to ws: ', samplesWithTime);
  //   }catch(e){
  //     console.error('Error processing audio data:', e);
  //   }
  // }

  // recorder.onstop = async () => {
  //   const blob = new Blob(data, { type: 'audio/mp3' });
  //   window.open(URL.createObjectURL(blob), '_blank');

  //   // Clear state ready for next recording
  //   recorder = undefined;
  //   data = [];
  // };

  await initWebSocket();

  // Record the current state in the URL. This provides a very low-bandwidth
  // way of communicating with the service worker (the service worker can check
  // the URL of the document and see the current recording state). We can't
  // store that directly in the service worker as it may be terminated while
  // recording is in progress. We could write it to storage but that slightly
  // increases the risk of things getting out of sync.
  window.location.hash = 'recording';
}

async function stopRecording() {
  //recorder.stop();

  // setTimeout(async () => {
  //   console.log(data)
  //   const blob = new Blob(data, { type: 'audio/x-wav' });
  //   const arrayBuffer = await blob.arrayBuffer();
  //   let validByteLength = arrayBuffer.byteLength - (arrayBuffer.byteLength % 4);
  //   const validArrayBuffer = arrayBuffer.slice(0, validByteLength);
  //   console.log('validByteLength: ', validByteLength, validArrayBuffer);
  //   let samples = new Float32Array(validArrayBuffer);
  //   samples = downsampleBuffer(samples, expectedSampleRate);
  //   let samplesWithTime = new Float32Array(samples.length + 1);
  //   samplesWithTime[0] = 0;
  //   for (var i = 0; i < samples.length; ++i) {
  //     samplesWithTime[i + 1] = samples[i];
  //   }
  //   socket.send(samplesWithTime);
  //   console.log('data sent to ws in final: ', samplesWithTime);

  //   setTimeout(() => {

  //   }, 1000);
  // }, 1000);
  processor.disconnect(); 

  await socket.send('Done');
  socket.close();
  
  // Stopping the tracks makes sure the recording icon in the tab is removed.
  //recorder.stream.getTracks().forEach((t) => t.stop());

  // Update current state in URL
  window.location.hash = '';

  // Note: In a real extension, you would want to write the recording to a more
  // permanent location (e.g IndexedDB) and then close the offscreen document,
  // to avoid keeping a document around unnecessarily. Here we avoid that to
  // make sure the browser keeps the Object URL we create (see above) and to
  // keep the sample fairly simple to follow.
}


function getDisplayResult() {
  let i = 0;
  let ans = '';
  for (let s in recognition_text) {
      if (recognition_text[s] == '') continue;

      ans += '' + i + ': ' + recognition_text[s] + '\n';
      i += 1;
  }
  return ans;
}

var recognition_text = [];
async function initWebSocket() {
  return new Promise((resolve, reject) => {
      console.log('Creating websocket')
      let protocol = 'ws://';
      // if (window.location.protocol == 'https:') {
      //     protocol = 'wss://'
      // }
      //let server_ip = serverIpInput;
      //let server_port = serverPortInput;
      //let server_ip = 'sherpa.zainot.com';
      let server_host = 'localhost:6006';
      //let server_host = 'home.zainot.com:3080/sherpa';

      let uri = protocol + server_host;
      console.log('uri1: ', uri);
      socket = new WebSocket(uri);
      socket.onopen = function (event) {
          console.log("WebSocket is open now.");
          console.log(event)
          resolve();
      }

      // Connection opened
      socket.addEventListener('open', function (event) {
          console.log('connected');
          resolve();

      });

      // Connection closed
      socket.addEventListener('close', function (event) {
          console.log('disconnected');
      });

      // Listen for messages
      socket.addEventListener('message', function (event) {
          let message = JSON.parse(event.data);
          if (message.segment in recognition_text) {
              recognition_text[message.segment].text = message.text;
              recognition_text[message.segment].translatecn = message.translatecn;

              chrome.runtime.sendMessage({ type: 'trigger-change-update', content: recognition_text[message.segment], isNew: false });
          } else {
              recognition_text.push({ message: message.text, translate: message.translatecn, segment: message.segment, startTime: message.startTime });

              if (message.segment > 0) {
                  var lastSegment = recognition_text[message.segment - 1];
                  lastSegment.endTime = message.startTime;
              }
              chrome.runtime.sendMessage({ type: 'trigger-change-create', content: recognition_text[message.segment], isNew: true });
          }

          console.log(message, recognition_text[message.segment].startTime, 'Received message: ', event.data);
      });

  })
}


function floatTo16BitPCM(float32Array) {
  const output = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}


let expectedSampleRate = 16000;
let recordSampleRate;

// this function is copied from
// https://github.com/awslabs/aws-lex-browser-audio-capture/blob/master/lib/worker.js#L46
function downsampleBuffer(buffer, exportSampleRate) {
  if (exportSampleRate === recordSampleRate) {
      return buffer;
  }
  var sampleRateRatio = recordSampleRate / exportSampleRate;
  var newLength = Math.round(buffer.length / sampleRateRatio);
  var result = new Float32Array(newLength);
  var offsetResult = 0;
  var offsetBuffer = 0;
  while (offsetResult < result.length) {
      var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      var accum = 0, count = 0;
      for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
  }
  return result;
};


// 处理音频数据的函数，将其转换为 WAV 数据段
async function processAudioData(arrayBuffer) {
  // 将 ArrayBuffer 转换为 AudioBuffer
  const decodeAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  const audioBuffer = await decodeAudioContext.decodeAudioData(arrayBuffer);
  console.log('Audio decoded successfully', audioBuffer);
  // 这里的音频数据是 PCM 格式的数据，我们不需要头部
  const wavData = audioBufferToWavSegment(audioBuffer);

  // 这里我们可以做进一步操作，比如上传、保存或处理该 WAV 数据段
  console.log(wavData);  // 在控制台输出这个 WAV 数据段
  return wavData;
}

// 将 AudioBuffer 转换为 WAV 数据段
function audioBufferToWavSegment(buffer) {
  const channels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bufferLength = buffer.length;

  // 使用 DataView 直接创建 WAV 数据
  const wavData = [];
  const dataView = new DataView(new ArrayBuffer(bufferLength * 2 * channels));

  // 处理 PCM 数据并写入 DataView
  let offset = 0;
  for (let channel = 0; channel < channels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < bufferLength; i++) {
      const sample = channelData[i] * 0x7FFF; // 将浮动的 PCM 数据转换为整数 PCM 数据（16-bit）
      dataView.setInt16(offset, sample, true);
      offset += 2;
    }
  }
  console.log('audioBufferToWavSegment successfully', dataView.buffer);

  // 返回包含音频数据段的数组
  return uint8ArrayToFloat32Array(new Uint8Array(dataView.buffer));
}

function uint8ArrayToFloat32Array(uint8Array) {
  // Create a DataView from the Uint8Array
  const dataView = new DataView(uint8Array.buffer);
  
  // Calculate the number of 32-bit floats (4 bytes each) in the Uint8Array
  const length = uint8Array.length / 4;

  // Create the Float32Array to store the result
  const float32Array = new Float32Array(length);

  // Iterate over the Uint8Array in 4-byte chunks and convert to Float32
  for (let i = 0; i < length; i++) {
    float32Array[i] = dataView.getFloat32(i * 4, true);  // true for little-endian
  }

  return float32Array;
}

async function convertWebMToWavSegmentUsingFFmpeg(arrayBuffer, segmentId=0) {
  // 初始化 FFmpeg 实例
  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: true });

  // 加载 FFmpeg
  await ffmpeg.load();

// 将 ArrayBuffer 转换为 Blob
  const inputFile = new Blob([arrayBuffer], { type: 'audio/webm' });

  // 将音频文件写入 FFmpeg 的虚拟文件系统
  const fileName = `input_${segmentId}.webm`;
  ffmpeg.FS('writeFile', fileName, new Uint8Array(await inputFile.arrayBuffer()));

  // 转换音频格式（WebM 到 WAV），并设置输出为音频片段
  await ffmpeg.run('-i', fileName, '-f', 'wav', `output_${segmentId}.wav`);

  // 获取转换后的文件（WAV）
  const outputData = ffmpeg.FS('readFile', `output_${segmentId}.wav`);

  // // 将转换后的文件数据转换为 Blob
  // const outputBlob = new Blob([outputData.buffer], { type: 'audio/wav' });
  return outputData.buffer;

}

async function convertWebMToWavSegment(webMBlob, segmentId=0) {
  const wavBlob = await getWaveBlob(webMBlob, true);
  console.log('wavBlob: ', wavBlob);
  return await new Promise((resolve, reject) => {
    console.log('1.11111111111111')

    return wavBlob.arrayBuffer().then((arrayBuffer) => {
      console.log('1.222222222222')
      const wavData = new Float32Array(arrayBuffer);
      console.log('wavData: ', wavData.length);
      resolve(wavData);
    });
  });
}



function _writeStringToArray(aString, targetArray, offset) {
  for (let i = 0; i < aString.length; ++i)
      targetArray[offset + i] = aString.charCodeAt(i);
}

function _writeInt16ToArray(aNumber, targetArray, offset) {
  aNumber = Math.floor(aNumber);
  targetArray[offset + 0] = aNumber & 255;          // byte 1
  targetArray[offset + 1] = (aNumber >> 8) & 255;   // byte 2
}

function _writeInt32ToArray(aNumber, targetArray, offset) {
  aNumber = Math.floor(aNumber);
  targetArray[offset + 0] = aNumber & 255;          // byte 1
  targetArray[offset + 1] = (aNumber >> 8) & 255;   // byte 2
  targetArray[offset + 2] = (aNumber >> 16) & 255;  // byte 3
  targetArray[offset + 3] = (aNumber >> 24) & 255;  // byte 4
}

// Return the bits of the float as a 32-bit integer value.  This
// produces the raw bits; no intepretation of the value is done.
function _floatBits(f) {
  const buf = new ArrayBuffer(4);
  (new Float32Array(buf))[0] = f;
  const bits = (new Uint32Array(buf))[0];
  // Return as a signed integer.
  return bits | 0;
}

function _writeAudioBufferToArray(
  audioBuffer,
  targetArray,
  offset,
  bitDepth
) {
  let index = 0, channel = 0;
  const length = audioBuffer.length;
  const channels = audioBuffer.numberOfChannels;
  let channelData, sample;

  // Clamping samples onto the 16-bit resolution.
  for (index = 0; index < length; ++index) {
      for (channel = 0; channel < channels; ++channel) {
          channelData = audioBuffer.getChannelData(channel);

          // Branches upon the requested bit depth
          if (bitDepth === 16) {
              sample = channelData[index] * 32768.0;
              if (sample < -32768)
                  sample = -32768;
              else if (sample > 32767)
                  sample = 32767;
              _writeInt16ToArray(sample, targetArray, offset);
              offset += 2;
          } else if (bitDepth === 32) {
              // This assumes we're going to out 32-float, not 32-bit linear.
              sample = _floatBits(channelData[index]);
              _writeInt32ToArray(sample, targetArray, offset);
              offset += 4;
          } else {
              console.log('Invalid bit depth for PCM encoding.');
              return;
          }

      }
  }
}

// Converts the Blob data to AudioBuffer
async function _getAudioBuffer(blobData, contextOptions = undefined) {
  let blob = blobData;

  console.log('1.1.00000000000000000000')
  if (!(blob instanceof Blob)) blob = new Blob([blobData]);
  console.log('1.1.111111111111111111')
  const url = URL.createObjectURL(blob);
  console.log('1.1.222222222222222222')
  const response = await fetch(url);
  console.log('1.1.33333333333333333333')
  const arrayBuffer = await response.arrayBuffer();
  console.log('1.1.44444444444444444444')
  const audioContext = new AudioContext(contextOptions);
  console.log('1.1.5555555555555555555555')
  try{
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  } catch(e){
    console.error('Error decoding audio data:', e);
  }
  console.log('1.1.66666666666666666666')
  return audioBuffer;
}

/**
* 
* @param {Blob | Blob[]} blobData - Blob or Blob[] to be converted to audio/wave Blob
* @param {boolean} as32BitFloat - Convert to 16-bit or 32-bit file, default 16-bit
* @param {AudioContextOptions} contextOptions - optiosn needs to be used for encoding
* @returns 
*/
async function getWaveBlob(
  blobData, as32BitFloat, contextOptions = undefined
) {
  const audioBuffer = await _getAudioBuffer(blobData, contextOptions);

  // // Encoding setup.
  // const frameLength = audioBuffer.length;
  // const numberOfChannels = audioBuffer.numberOfChannels;
  // const sampleRate = audioBuffer.sampleRate;
  // const bitsPerSample = as32BitFloat ? 32 : 16;
  // const bytesPerSample = bitsPerSample / 8;
  // const byteRate = sampleRate * numberOfChannels * bitsPerSample / 8;
  // const blockAlign = numberOfChannels * bitsPerSample / 8;
  // const wavDataByteLength = frameLength * numberOfChannels * bytesPerSample;
  // const headerByteLength = 44;
  // const totalLength = headerByteLength + wavDataByteLength;
  // const waveFileData = new Uint8Array(wavDataByteLength);
  // const subChunk1Size = 16;
  // const subChunk2Size = wavDataByteLength;
  // const chunkSize = 4 + (8 + subChunk1Size) + (8 + subChunk2Size);

  // _writeStringToArray('RIFF', waveFileData, 0);
  // _writeInt32ToArray(chunkSize, waveFileData, 4);
  // _writeStringToArray('WAVE', waveFileData, 8);
  // _writeStringToArray('fmt ', waveFileData, 12);

  // // SubChunk1Size (4)
  // _writeInt32ToArray(subChunk1Size, waveFileData, 16);
  // // AudioFormat (2): 3 means 32-bit float, 1 means integer PCM.
  // _writeInt16ToArray(as32BitFloat ? 3 : 1, waveFileData, 20);
  // // NumChannels (2)
  // _writeInt16ToArray(numberOfChannels, waveFileData, 22);
  // // SampleRate (4)
  // _writeInt32ToArray(sampleRate, waveFileData, 24);
  // // ByteRate (4)
  // _writeInt32ToArray(byteRate, waveFileData, 28);
  // // BlockAlign (2)
  // _writeInt16ToArray(blockAlign, waveFileData, 32);
  // // BitsPerSample (4)
  // _writeInt32ToArray(bitsPerSample, waveFileData, 34);
  // _writeStringToArray('data', waveFileData, 36);
  // // SubChunk2Size (4)
  // _writeInt32ToArray(subChunk2Size, waveFileData, 40);

  // // Write actual audio data starting at offset 44.
  // _writeAudioBufferToArray(audioBuffer, waveFileData, 44, bitsPerSample);



  const waveFileData = new Uint8Array(wavDataByteLength);
  _writeAudioBufferToArray(audioBuffer, waveFileData, 0, bitsPerSample);

  return new Blob([waveFileData], {
      type: 'audio/wave'
  });
}
