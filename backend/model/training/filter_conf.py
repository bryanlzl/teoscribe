import json

# Path to JSON file
input_file = '/home/cayden/asr-augmentation/data/unlabelled/unlabelled_sem_only_conf2.json'
output_file = '/home/cayden/asr-augmentation/data/unlabelled/unlabelled_sem_only_conf_filter2.json'

# Load data from the file
with open(input_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Filter entries with confidence_score >= 0.0001
filtered_data = [entry for entry in data if entry.get('confidence_score', 0) >= 0.0001]

# Save the filtered data back to a new file
with open(output_file, 'w', encoding='utf-8') as f:
    json.dump(filtered_data, f, ensure_ascii=False, indent=4)

print(f"Filtered data saved to {output_file}")
