from collections import defaultdict
from tqdm import tqdm
import argparse, json

parser = argparse.ArgumentParser(description='Post-process crawled')
parser.add_argument('--input_json', type=str, help='path to dataset.json file')
parser.add_argument('--output_json', type=str, help='path to processed_dataset.json file')
args = parser.parse_args()

"""
How can we handle the problem of subtitles eating into the next audio segment?
How can we handle problem of subtitles not ending where audio segment ended?
Should we remove data whose subtitle is one character only?
"""

def load_dataset(json_path):
    with open(json_path, 'r', encoding='utf8') as f:
        return json.load(f)

def save_dataset(data, json_path):
    with open(json_path, 'w', encoding='utf8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def merge_subtitles(dataset):
    """
    Merge successive same subtitles and adjust timestamps.
    """
    merged_data = []

    # Track merging across adjacent segments
    merged_subtitle = ""
    merged_start = None
    merged_end = None

    for i, entry in tqdm(enumerate(dataset)):
        if i == 0:
            # Initialize with the first segment
            audio_file = entry["audio_file"]
            cleaned_audio_file = entry["cleaned_audio_file"]
            merged_start = entry['timestamp_start']
            merged_end = entry['timestamp_end']
            merged_subtitle = entry['subtitle']
        else:
            # Check if same as previous subtitle
            if entry['subtitle'].strip() == merged_subtitle.strip():
                # If same, update the end timestamp
                merged_end = entry['timestamp_end']
            else:
                # Save the merged segment
                merged_data.append({
                    "audio_file": audio_file,
                    "cleaned_audio_file": cleaned_audio_file,
                    "timestamp_start": merged_start,
                    "timestamp_end": merged_end,
                    "subtitle": merged_subtitle.strip()
                })
                # Start a new merge with the current segment
                audio_file = entry["audio_file"]
                cleaned_audio_file = entry["cleaned_audio_file"]
                merged_start = entry['timestamp_start']
                merged_end = entry['timestamp_end']
                merged_subtitle = entry['subtitle']

    # Append the last merged entry
    merged_data.append({
        "audio_file": audio_file,
        "cleaned_audio_file": cleaned_audio_file,
        "timestamp_start": merged_start,
        "timestamp_end": merged_end,
        "subtitle": merged_subtitle.strip()
    })

    return merged_data

def processing(dataset):
    """
    For now only remove data if subtitle is one character only
    """
    processed_dataset = dataset.copy()
    for d in dataset:
        if len(d["subtitle"]) == 1:
            processed_dataset.remove(d)

    return processed_dataset

def process_dataset(json_path, output_path):
    # Load dataset
    dataset = load_dataset(json_path)

    # Process dataset
    processed_dataset = processing(dataset)

    # Merge similar subtitles and adjust timestamps
    processed_dataset = merge_subtitles(processed_dataset)

    # Save processed dataset
    save_dataset(processed_dataset, output_path)

# Example usage
input_json = args.input_json
output_json = args.output_json

process_dataset(input_json, output_json)