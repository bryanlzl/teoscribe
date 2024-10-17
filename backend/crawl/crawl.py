from functions import *
from tqdm import tqdm
import argparse, json, os

parser = argparse.ArgumentParser(description='Crawling')
parser.add_argument('--data_path', type=str, help='path to folder containing cropped videos')
parser.add_argument('--crawled_path', type=str, help='path to folder containing crawled')
args = parser.parse_args()

print("Starting crawling...")
out = []
PATHS = os.listdir(args.data_path)
for PATH in PATHS:
    print(f"Processing {PATH}")
    if PATH.endswith(".mp4"):
        extractsubtitle = SubtitleExtractor(f"{args.data_path}/{PATH}")
        
        # get audio segments
        segmenting = AudioExtractor(PATH, args.data_path, args.crawled_path)
        timestamps = segmenting.get_speech_timestamps(model)
        audio_fn = segmenting.audio_fn
        
        # loop through each segment
        for i in tqdm(range(len(timestamps))):
            video_segment = extractsubtitle.get_video_segment(timestamps[i]['start'], timestamps[i]['end'])
        
            # # extract cropped frames for that video segment
            # paths_to_frames = extractsubtitle.get_frames_of_cropped_subtitle_region(video_segment, i)
            
            # # Apply OCR
            # subtitles = extractsubtitle.extract_subtitles(paths_to_frames, ocr)

            # extract cropped frames for that video segment and apply ocr
            subtitles = extractsubtitle.get_frames_and_extract_subtitle(video_segment)
            grouped_subtitles = extractsubtitle.group_similar_subtitles(subtitles)
            best_subtitle = extractsubtitle.choose_best_subtitle(grouped_subtitles)

            # might be empty
            if best_subtitle:
                out.append({
                    "audio_file": audio_fn,
                    "timestamp_start": timestamps[i]['start'],
                    "timestamp_end": timestamps[i]['end'],
                    "subtitle": best_subtitle
                })

# write crawled data
with open(f'{args.crawled_path}/dataset.json', 'w', encoding ='utf8') as json_file:
    json.dump(out, json_file, ensure_ascii = False, indent = 4)