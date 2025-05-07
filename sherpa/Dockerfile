FROM ubuntu

RUN apt-get update && apt-get upgrade -y 
RUN apt-get install -y python3 pip git curl
RUN ln /usr/bin/python3.12 /usr/bin/python
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash
RUN apt-get install git-lfs
RUN pip install pyOpenSSL websockets numpy sherpa_onnx 
RUN pip install transformers sentencepiece

WORKDIR /
RUN git clone https://github.com/tian-jie/meeting-recorder.git /app \
    && git lfs pull

WORKDIR /app

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
