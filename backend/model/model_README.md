## 1) Crawl Teochew videos
**We downloaded a whole bunch of cropped Teochew videos at:** https://drive.google.com/drive/folders/1D_LhdBszNeJllwSA4Y1OnY2oLTcEvt2G

**We store our dataset in this format:**
```
crawled/
    ├── audio/
    │   ├── audio1.wav
    │   ├── audio2.wav
    │   └── ...
    └── dataset.json
```

**We organise the annotated data into the following format:**
- Audio files: Store each audio clip as a file in a folder.
- Timestamps: Store the start and end times for the audio clips.
- Subtitles: Store the associated subtitles
```
# dataset.json
[
  {
    "audio_file": "audio/audio1.wav",
    "cleaned_audio_file": "audio/cleaned_audio1.wav",
    "timestamp_start": 0.0,
    "timestamp_end": 3.5,
    "subtitle": "如果沒在你帮我搬上去吧"
  },
  {
    "audio_file": "audio/audio2.wav",
    "cleaned_audio_file": "audio/cleaned_audio2.wav",
    "timestamp_start": 3.6,
    "timestamp_end": 6.0,
    "subtitle": "喉我得打电话跟她说 让她别喊了 别等下让别人误会有什么"
  }
]
```

#### Techniques used to clean/crawl for the data:
- VAD: silero_vad (segment audio)
- OCR: PaddleOCR (extract subtitles)
- Levenshtein distance to detect repeated subtitles, grouped together and take mode.
- Noise removal: noisereduce
- Image enhancement: increased contrast

#### Prepare Data
To crawl,
```
# --audio_only, if crawling for audio only (no subtitle)
OMP_NUM_THREADS=1 python crawl.py --data_path "/scratch/users/nus/e1329380/cs5647/downloaded" --crawled_path "/scratch/users/nus/e1329380/cs5647/crawled"
```
To post-process data,
```
python postprocess.py --input_json "/scratch/users/nus/e1329380/cs5647/crawled/dataset.json" --output_json "/scratch/users/nus/e1329380/cs5647/crawled/dataset_processed.json"
```

## 2) Model Training
To split labelled crawled data,
```
python split.py --data_path "/scratch/users/nus/e1329380/cs5647/crawled/dataset_processed.json" --train_path "/scratch/users/nus/e1329380/cs5647/crawled/train.json" --test_path "/scratch/users/nus/e1329380/cs5647/crawled/test.json"
```
#### Finetune Whisper (teacher model)
- Currently, I fixed the training hyperparameters.
- PEFT LoRA is used to fine-tune Whisper-small model.

You can train either from Python:
``` python
from finetune import *
train(audio_path=, annotated_path=, out_path=, wandb=, cleaned_audio=, semantic_loss=)
```
or Command Line:
```
# add --wandb, if logging to wandb, add --cleaned_audio, if training on cleaned audio, add --semantic_loss, if incorporate semantics into training
python finetune.py --audio_path "/scratch/users/nus/e1329380/cs5647/crawled/audio" \
        --annotated_path "/scratch/users/nus/e1329380/cs5647/crawled/dataset.json" \
        --out_path "/scratch/users/nus/e1329380/cs5647/finetuned_linear_semantics_clean" \
        --wandb \
        --cleaned_audio \
        --semantic_loss
```

For prediction,
``` python
from finetune import *
# input audio must be in .wav format
# do_peft=True if loading PEFT model, else False
predict("/scratch/users/nus/e1329380/cs5647/finetuned/checkpoint-440/", "/scratch/users/nus/e1329380/cs5647/testing/Money.wav", do_peft=True)
# outputs the predicted transcription as text
```
#### Self-training (teacher teaches student model)
