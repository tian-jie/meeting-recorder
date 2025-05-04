# File description

- [./http_server.py](./http_server.py) It defines which files to server.
  Files are saved in [./web](./web).
- [non_streaming_server.py](./non_streaming_server.py) WebSocket server for
  non-streaming models.
- [vad-remove-non-speech-segments.py](./vad-remove-non-speech-segments.py) It uses
  [silero-vad](https://github.com/snakers4/silero-vad) to remove non-speech
  segments and concatenate all speech segments into a single one.
- [vad-with-non-streaming-asr.py](./vad-with-non-streaming-asr.py) It shows
  how to use VAD with a non-streaming ASR model for speech recognition from
  a microphone

``` python
python streaming_server.py --rule3-min-utterance-length 1000.0 --port 6006 --max-batch-size 50 --max-wait-ms 5 --nn-pool-size 1 --tokens /app/traindata/tokens.txt --encoder-model /app/traindata/encoder-epoch-99-avg-1.onnx --decoder-model /app/traindata/decoder-epoch-99-avg-1.onnx --joiner-model /app/traindata/joiner-epoch-99-avg-1.onnx --certificate ./web/cert.pem --doc-root ./web
```

./python-api-examples/streaming_server.py   --encoder ./sherpa-onnx-streaming-zipformer-en-2023-06-26/encoder-epoch-99-avg-1-chunk-16-left-128.onnx  --decoder ./sherpa-onnx-streaming-zipformer-en-2023-06-26/decoder-epoch-99-avg-1-chunk-16-left-128.onnx   --joiner ./sherpa-onnx-streaming-zipformer-en-2023-06-26/joiner-epoch-99-avg-1-chunk-16-left-128.onnx   --tokens ./sherpa-onnx-streaming-zipformer-en-2023-06-26/tokens.txt   --port 6006


./python-api-examples/streaming_server.py   --encoder ./sherpa-onnx-streaming-zipformer-en-2023-06-21/encoder-epoch-99-avg-1.onnx  --decoder ./sherpa-onnx-streaming-zipformer-en-2023-06-21/decoder-epoch-99-avg-1.onnx   --joiner ./sherpa-onnx-streaming-zipformer-en-2023-06-21/joiner-epoch-99-avg-1.onnx   --tokens ./sherpa-onnx-streaming-zipformer-en-2023-06-21/tokens.txt   --port 6006