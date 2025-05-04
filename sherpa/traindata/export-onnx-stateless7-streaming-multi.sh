#!/usr/bin/env bash

export CUDA_VISIBLE_DEVICES=

if [ ! -d ./icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04 ]; then
  GIT_LFS_SKIP_SMUDGE=1 git clone https://huggingface.co/marcoyang/icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04
  pushd icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04/exp
  git lfs pull --include "pretrained.pt"
  ln -s pretrained.pt epoch-99.pt
  cd ../data/lang_bpe_500
  git lfs pull --include "bpe.model"
  popd
fi

./pruned_transducer_stateless7_streaming_multi/export-onnx.py \
  --exp-dir ./icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04/exp \
  --tokens ./icefall-libri-giga-pruned-transducer-stateless7-streaming-2023-04-04/data/lang_bpe_500/tokens.txt \
  --epoch 99 \
  --avg 1 \
  --use-averaged-model 0 \
  \
  --decode-chunk-len 32 \
  --num-encoder-layers "2,4,3,2,4" \
  --feedforward-dims "1024,1024,2048,2048,1024" \
  --nhead "8,8,8,8,8" \
  --encoder-dims "384,384,384,384,384" \
  --attention-dims "192,192,192,192,192" \
  --encoder-unmasked-dims "256,256,256,256,256" \
  --zipformer-downsampling-factors "1,2,4,8,2" \
  --cnn-module-kernels "31,31,31,31,31" \
  --decoder-dim 512 \
  --joiner-dim 512
