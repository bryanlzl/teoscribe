# import os, re
from collections import defaultdict
from moviepy.editor import VideoFileClip
import moviepy.editor as mp
import matplotlib.pyplot as plt
from silero_vad import load_silero_vad, read_audio, get_speech_timestamps
import torch
import torchaudio
import torchaudio.transforms as T
from IPython.display import Audio
import numpy as np
from PIL import Image
from paddleocr import PaddleOCR
import Levenshtein

from ppocr.utils.logging import get_logger
import logging
logger = get_logger()
logger.setLevel(logging.ERROR)

# use voice activity detector
model = load_silero_vad()

# Initialize PaddleOCR model
ocr = PaddleOCR(use_angle_cls=False, det = False, lang='ch', use_gpu=True)  # Adjust the language if necessary
# change to better model "rec_model_dir="
# Chinese Traditional	(chinese_cht)
# Chinese & English	(ch)
# English	(en)

# create a class for extracting audio segments
class AudioExtractor:
    """
    Extract audio from a video file.
    Outputs the original audio as a .wav file.

    Audio segments can be extracted based on speech timestamps.
    Can play original audio segments by providing the start and end timestamps from resampled.
    """
    def __init__(self, video_fn, in_path, out_path, resample_rate=16000):
        self.audio_fn = video_fn.split(".mp4")[0]+".wav"
        self.resample_rate = resample_rate

        # convert video to audio using moviepy
        clip = VideoFileClip(f"{in_path}/{video_fn}")
        clip.audio.write_audiofile(f"{out_path}/audio/{self.audio_fn}")

        # resample audio (required for extracting segments)
        self.waveform, self.sample_rate = torchaudio.load(f"{out_path}/audio/{self.audio_fn}")
        self.waveform_mono = torch.mean(self.waveform, dim=0).unsqueeze(0)
        if self.sample_rate != self.resample_rate:
            resampler = T.Resample(self.sample_rate, self.resample_rate, dtype=self.waveform_mono.dtype)
            self.waveform_resampled = resampler(self.waveform_mono)
        else:
            self.waveform_resampled = self.waveform_mono

    def get_speech_timestamps(self, model):
        """
        Outputs a list of speech timestamps ecah in the form of dictionary {start: ..., end: ...}.
        """
        raw = get_speech_timestamps(self.waveform_resampled, model)
        # return only segments longer than 2 seconds
        # (some audio segments very short, like 0 to 1s)
        # perhaps is VAD not gd at very short speeches
        return [x for x in raw if (x['end'] - x['start'])/self.resample_rate > 2]

    def play_audio_segment(self, start, end):
        """
        Play in original audio sampling rate.
        More for self-checking.
        """
        # Step 1: Convert new timestamps to sample indices in the original audio
        original_start_index = int(start * self.sample_rate/self.resample_rate)
        original_end_index = int(end * self.sample_rate/self.resample_rate)

        # Step 2: Extract the corresponding segment from the original audio
        original_audio_segment = self.waveform[:,original_start_index:original_end_index]

        # Step 3: Play the extracted segment
        return Audio(original_audio_segment.numpy(), rate=self.sample_rate)

    def clean_audio(self):
        """
        Do we need to clean the audio like standardise/remove background noises?
        """
        return

# create class for extracting hard-coded subtitle
def play_video_segment(video_segment):
    """
    Play in original video sampling rate.
    More for self-checking.
    """
    return video_segment.ipython_display()

def apply_ocr(image_path, ocr):
    """
    Apply OCR to an image.
    """
    result = ocr.ocr(image_path, cls=False, det=False, rec=True)
    extracted_text = ""

    for line in result:
        for word_info in line:
            word = word_info[0]  # Extract the text
            extracted_text += word + " "

    return extracted_text.strip()

def calculate_similarity_levenshtein(sub1, sub2):
    """
    Calculate similarity based on Levenshtein distance.
    A lower distance means the subtitles are more similar.
    """
    # If either string is empty, return max similarity (1.0) as they're completely different
    if len(sub1) == 0 or len(sub2) == 0:
        return 1.0  # Maximum distance for empty strings
    
    distance = Levenshtein.distance(sub1, sub2)
    max_len = max(len(sub1), len(sub2))
    # Normalize the distance to get a similarity score between 0 and 1.
    # 0 means identical, 1 means completely different.
    return distance / max_len

def is_chinese_char(char):
    # Function to detect if a character is Chinese
    return '\u4e00' <= char <= '\u9fff'

def filter_non_chinese(text):
    # Remove non-Chinese characters
    return ''.join([char for char in text if is_chinese_char(char)])

class SubtitleExtractor:
    """
    Extract hard-coded subtitles from a video file.
    """
    def __init__(self, video_fn, resample_rate=16000):
        self.video_fn = video_fn
        self.video = mp.VideoFileClip(video_fn)
        self.resample_rate = resample_rate

    def get_video_segment(self, start, end):
        """
        Extract a video segment based on start and end timestamps.
        """
        # Step 1: Extract the video segment corresponding to the time range x (start seconds) to y (end seconds)
        video_segment = self.video.subclip(start/self.resample_rate, end/self.resample_rate)
        return video_segment

    def get_frames_and_extract_subtitle(self, video_segment, frame_interval = 0.25):
        """
        One segment only.
        Extract frames containing subtitle at a regular interval.
        For each frame, crop the subtitle region (subtitles usually appear (e.g., the bottom part of the video)).
        Can possibly improve accuracy by focusing only on the subtitle area.

        frame_interval = 1 # (e.g., 1 frame per second)
        frame_interval = 0.5 # (e.g., 2 frames per second)
        frame_interval = 0.25 # (e.g., 4 frames per second)
        """
        subtitles = {}
        for t in np.arange(0, int(video_segment.duration), frame_interval):
            frame = video_segment.get_frame(t)
            # frame = Image.fromarray(frame)
            subtitle_text = apply_ocr(frame, ocr)
            if subtitle_text:
                subtitles[t] = subtitle_text
        return subtitles
    
    # def get_frames_of_cropped_subtitle_region(self, video_segment, i, frame_interval = 0.25):
    #     """
    #     One segment only.
    #     Extract frames containing subtitle at a regular interval.
    #     For each frame, crop the subtitle region (subtitles usually appear (e.g., the bottom part of the video)).
    #     Can possibly improve accuracy by focusing only on the subtitle area.

    #     frame_interval = 1 # (e.g., 1 frame per second)
    #     frame_interval = 0.5 # (e.g., 2 frames per second)
    #     frame_interval = 0.25 # (e.g., 4 frames per second)
    #     """
    #     paths_to_frames = []
    #     for t in np.arange(0, int(video_segment.duration), frame_interval):
    #         frame = video_segment.get_frame(t)
    #         # cropping (already done manually)
    #         frame = Image.fromarray(frame)
    #         # width, height = frame.size
    #         # subtitle_region = (0, int(0.8 * height), width, int(0.92 * height))
    #         # # subtitle_region = (0, int(0.8 * height), width, height)  # bottom 20% of the frame
    #         # cropped_image = frame.crop(subtitle_region)
    #         frame_image_path = f"{self.video_fn.split('.mp4')[0]}_{i}th_segment_cropped_frame_at_{t}_seconds.png"
    #         # cropped_image.save(frame_image_path)
    #         frame.save(frame_image_path)
    #         paths_to_frames.append(frame_image_path)
    #     return paths_to_frames

    # def extract_subtitles(self, cropped_image_paths, ocr):
    #     """
    #     One segement only.
    #     Extract subtitles from cropped frames.
    #     """
    #     subtitles = {}
    #     for p in cropped_image_paths:
    #         subtitle_text = apply_ocr(p, ocr)
    #         if subtitle_text:
    #             subtitles[p] = subtitle_text
    #             # print(f"Subtitle at {p.split('frame_at_')[-1]} seconds: {subtitle_text}")
    #     return subtitles

    def group_similar_subtitles(self, subtitles, similarity_threshold=0.4):
        """
        Group similar subtitles using Levenshtein distance.
        Subtitles with normalized distance below the threshold are grouped together.
        """
        grouped_subtitles = defaultdict(list)

        for path, subtitle in subtitles.items():
            # Clean up subtitle (e.g., remove non-Chinese if needed)
            filtered_subtitle = filter_non_chinese(subtitle)

            found_similar = False
            for key in grouped_subtitles:
                # Calculate Levenshtein distance similarity
                similarity = calculate_similarity_levenshtein(filtered_subtitle, key)
                if similarity < similarity_threshold:  # Group if the distance is small
                    grouped_subtitles[key].append(filtered_subtitle)
                    found_similar = True
                    break

            if not found_similar:
                grouped_subtitles[filtered_subtitle].append(filtered_subtitle)

        return grouped_subtitles

    def choose_best_subtitle(self, grouped_subtitles):
        """
        Currently implemented choose longest for same group. BUT OBVIOUSLY NOT BEST SOLUTION...
        Groups similar subtitles and concatenates different sequences.
        Uses Levenshtein distance to group similar ones.
        - Can consider:
            - Could use chinese LLM that says which text makes more sense (e.g., lower perplexity score)
            - other ways???
            - OCR for English in general more accurate than Chinese... but most videos only have chinese subtitles...
        """
        final_subtitle = ""

        for key, group in grouped_subtitles.items():
            # For each group, choose the longest subtitle as the best one
            longest_subtitle = max(group, key=len)
            final_subtitle += longest_subtitle + " "

        return final_subtitle.strip()