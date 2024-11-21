import torch
import torchaudio
import torchaudio.transforms as T
from silero_vad import load_silero_vad, get_speech_timestamps
from tqdm import tqdm
import json, os


class AudioExtractor:
    def __init__(self, audio_fn, in_path, resample_rate=16000):
        self.audio_fn = audio_fn
        self.resample_rate = resample_rate

        # Load the existing WAV file
        self.waveform, self.sample_rate = torchaudio.load(f"{in_path}/audio/{self.audio_fn}")
        self.waveform_mono = torch.mean(self.waveform, dim=0).unsqueeze(0)
        
        # Resample the audio if needed
        if self.sample_rate != self.resample_rate:
            resampler = T.Resample(self.sample_rate, self.resample_rate, dtype=self.waveform_mono.dtype)
            self.waveform_resampled = resampler(self.waveform_mono)
        else:
            self.waveform_resampled = self.waveform_mono

    def get_speech_timestamps(self, model):
        """
        Outputs a list of speech timestamps each in the form of dictionary {start: ..., end: ...}.
        """
        raw = get_speech_timestamps(self.waveform_resampled, model)
        # return only segments longer than 2 seconds
        return [x for x in raw if (x['end'] - x['start'])/self.resample_rate >= 1.5]  # Adjust as needed


folder_path = "/home/cayden/asr-augmentation/data/unlabelled/"

print("Starting crawling...")

model = load_silero_vad()
out = []

PATHS = os.listdir("/home/cayden/asr-augmentation/data/unlabelled/audio")
for PATH in tqdm(PATHS):
    print(f"Processing {PATH}")
    if PATH.startswith("cleaned_"):
        segmenting = AudioExtractor(PATH, folder_path)
        timestamps = segmenting.get_speech_timestamps(model)
        audio_fn = segmenting.audio_fn
        
        # loop through each segment
        for i in tqdm(range(len(timestamps))):
            out.append({
                        "audio_file": audio_fn[8:],
                        "cleaned_audio_file": audio_fn,
                        "timestamp_start": timestamps[i]['start'],
                        "timestamp_end": timestamps[i]['end']
                        })
    else:
        print(f"Skipping {PATH}, not cleaned.")

# Write to json
with open(f'{folder_path}/unlabelled.json', 'w', encoding ='utf8') as json_file:
    json.dump(out, json_file, ensure_ascii = False, indent = 4)
