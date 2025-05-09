FROM ubuntu

RUN apt-get update && apt-get upgrade -y 
RUN apt-get install -y python3 pip
RUN ln /usr/bin/python3.12 /usr/bin/python
RUN pip install pyOpenSSL websockets numpy sherpa_onnx --break-system-packages
RUN pip install transformers sentencepiece torch --break-system-packages

WORKDIR /app
COPY . .

EXPOSE 6006

ENTRYPOINT python streaming_server.py \
             --rule1-min-trailing-silence 0.8 \
             --rule2-min-trailing-silence 1.2 \
             --rule3-min-utterance-length 10 \
             --use-endpoint 1 --num-threads 8 \
             --port 6006 --max-batch-size 50 --max-wait-ms 5 \
             --nn-pool-size 1 --tokens ./traindata/tokens.txt \
             --encoder ./traindata/encoder-epoch-99-avg-1.onnx \
             --decoder ./traindata/decoder-epoch-99-avg-1.onnx \
             --joiner ./traindata/joiner-epoch-99-avg-1.onnx \
             --doc-root ./web



# python streaming_server.py --rule1-min-trailing-silence 0.8 --rule2-min-trailing-silence 1.2 --rule3-min-utterance-length 10 --use-endpoint 1 --num-threads 8  --port 6006 --tokens ./traindata/tokens.txt --encoder ./traindata/encoder-epoch-99-avg-1.onnx --decoder ./traindata/decoder-epoch-99-avg-1.onnx --joiner ./traindata/joiner-epoch-99-avg-1.onnx --doc-root ./web
