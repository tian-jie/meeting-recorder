# A simple solution of live translation from English to Chinese in Chrome website.
This is a solution to translate English to Chinese on capture sound in website using Chrome Extensition.

<img width="1313" alt="image" src="https://github.com/user-attachments/assets/d82094df-a7e9-416e-ad35-11f4af31cb15" />

# Technoledge used
Sherpa-onnx
Chrome Extensition

# Operation System supported
- [x] Windows
- [x] Mac OS

# Web Browser supported
- [x] Chrome (119+)
- [x] Edge (Chrome core)

# Get started
There is a backend run on your local machine, and chrome extensiton installed on your local Chrome (Or Latest Edge in Windows).

## Installation
### backend server
- install python 3.9
- install packages needed for python
```
pip install pyOpenSSL websockets numpy sherpa_onnx
pip install transformers sentencepiece
```
- download source code
```
git clone https://github.com/k2-fsa/sherpa-onnx
brew install git-lfs (mac only)
git lfs install
git lfs pull
```
- run server

```
cd meeting-recorder
cd sherpa
python streaming_server.py --rule1-min-trailing-silence 0.8 --rule2-min-trailing-silence 1.2 --rule3-min-utterance-length 10 --use-endpoint 1 --num-threads 8  --port 6006 --tokens ./traindata/tokens.txt --encoder ./traindata/encoder-epoch-99-avg-1.onnx --decoder ./traindata/decoder-epoch-99-avg-1.onnx --joiner ./traindata/joiner-epoch-99-avg-1.onnx --doc-root ./web
```
 wait until following displayed
```
INFO [streaming_server.py:877] {'encoder': './traindata/encoder-epoch-99-avg-1.onnx', 'decoder': './traindata/decoder-epoch-99-avg-1.onnx', 'joiner': './traindata/joiner-epoch-99-avg-1.onnx', 'zipformer2_ctc': None, 'wenet_ctc': None, 'paraformer_encoder': None, 'paraformer_decoder': None, 'tokens': './traindata/tokens.txt', 'sample_rate': 16000, 'feat_dim': 80, 'provider': 'cpu', 'decoding_method': 'greedy_search', 'num_active_paths': 4, 'use_endpoint': 1, 'rule1_min_trailing_silence': 0.8, 'rule2_min_trailing_silence': 1.2, 'rule3_min_utterance_length': 10.0, 'hotwords_file': '', 'hotwords_score': 1.5, 'modeling_unit': 'cjkchar', 'bpe_vocab': '', 'blank_penalty': 0.0, 'port': 6006, 'nn_pool_size': 1, 'max_batch_size': 3, 'max_wait_ms': 10, 'max_message_size': 1048576, 'max_queue_size': 32, 'max_active_connections': 200, 'num_threads': 8, 'certificate': None, 'doc_root': './web'}
INFO [streaming_server.py:668] No certificate provided
INFO [server.py:341] server listening on 0.0.0.0:6006
INFO [server.py:341] server listening on [::]:6006
INFO [streaming_server.py:694] Please visit one of the following addresses:

  http://localhost:6006

Since you are not providing a certificate, you cannot use your microphone from within the browser using public IP addresses. Only localhost can be used.You also cannot use 0.0.0.0 or 127.0.0.1
```

### frone-end
- Open chrome Extensition
chrome://extensions
- enable Developer mode
- Load unpacked
 Navigation to folder "chrome.ext"

