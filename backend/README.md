## 1) Crawl Teochew videos
**We store our data at:** https://drive.google.com/drive/folders/1D_LhdBszNeJllwSA4Y1OnY2oLTcEvt2G (Mount to access???)
```
crawled/
    ├── audio/
    │   ├── audio1.wav
    │   ├── audio2.wav
    │   └── ...
    └── dataset.json
```

**We organise the data into the following format:**
- Audio files: Store each audio clip as a file in a folder.
- Timestamps: Store the start and end times for the audio clips.
- Subtitles: Store the associated subtitles
```
# dataset.json
[
  {
    "audio_file": "audio/audio1.wav",
    "timestamp_start": 0.0,
    "timestamp_end": 3.5,
    "subtitle": "如果沒在你帮我搬上去吧"
  },
  {
    "audio_file": "audio/audio2.wav",
    "timestamp_start": 3.6,
    "timestamp_end": 6.0,
    "subtitle": "喉我得打电话跟她说 让她别喊了 别等下让别人误会有什么"
  }
]
```

#### Techniques used to clean/crawl for the data:
- VAD: silero_vad
- OCR: PaddleOCR
- Levenshtein distance
- Noise removal: 

#### Prepare Data
``` 2>&1 | tee crawl.log
python crawl.py --data_path "/scratch/users/nus/e1329380/cs5647/downloaded" --crawled_path "/scratch/users/nus/e1329380/cs5647/crawled"
```

## 2) Model Training
#### Finetune Whisper
#### Self-training