from collections import defaultdict
import argparse, json, Levenshtein

parser = argparse.ArgumentParser(description='Post-process crawled')
parser.add_argument('--input_json', type=str, help='path to dataset.json file')
parser.add_argument('--output_json', type=str, help='path to processed_dataset.json file')
args = parser.parse_args()

def load_dataset(json_path):
    with open(json_path, 'r', encoding='utf8') as f:
        return json.load(f)

def save_dataset(data, json_path):
    with open(json_path, 'w', encoding='utf8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def calculate_similarity(sub1, sub2, threshold=0.5):
    # Calculate Levenshtein distance and normalize
    distance = Levenshtein.distance(sub1, sub2)
    max_len = max(len(sub1), len(sub2))
    return (distance / max_len) < threshold

def merge_subtitles(dataset, similarity_threshold=0.4):
    merged_data = []
    
    # Track merging across adjacent segments
    merged_subtitle = ""
    merged_start = None
    merged_end = None
    
    for i, entry in enumerate(dataset):
        if i == 0:
            # Initialize with the first segment
            audio_file = entry["audio_file"]
            cleaned_audio_file = entry["cleaned_audio_file"]
            merged_start = entry['timestamp_start']
            merged_end = entry['timestamp_end']
            merged_subtitle = entry['subtitle']
        else:
            # Check similarity with the previous subtitle
            current_subtitle = entry['subtitle']
            if calculate_similarity(merged_subtitle, current_subtitle, threshold=similarity_threshold):
                # If similar, extend the end timestamp and merge the subtitles
                merged_end = entry['timestamp_end']
                ###
                # need to find overlap (prefarably at tail and start), then remove overlap, and then merge
                merged_subtitle += " " + current_subtitle
                ###
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
                merged_start = entry['timestamp_start']
                merged_end = entry['timestamp_end']
                merged_subtitle = current_subtitle
    
    # Append the last merged entry
    merged_data.append({
        "audio_file": audio_file,
        "cleaned_audio_file": cleaned_audio_file,
        "timestamp_start": merged_start,
        "timestamp_end": merged_end,
        "subtitle": merged_subtitle.strip()
    })
    
    return merged_data

def process_dataset(json_path, output_path):
    # Load dataset
    dataset = load_dataset(json_path)
    
    # Merge similar subtitles and adjust timestamps
    merged_dataset = merge_subtitles(dataset)
    
    # Save processed dataset
    save_dataset(merged_dataset, output_path)

# Example usage
input_json = args.input_json
output_json = args.output_json

process_dataset(input_json, output_json)
