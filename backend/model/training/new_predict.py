from torchaudio.transforms import Resample
import torch
import torchaudio
import os
import json
from torch.utils.data import Dataset
from transformers import WhisperForConditionalGeneration, WhisperTokenizer, WhisperProcessor, AutomaticSpeechRecognitionPipeline
from tqdm import tqdm
from torch.nn.functional import softmax
import numpy as np
import random

class UnlabelledDataset(Dataset):
    def __init__(self, dataset_root, annotation_path, clean_audio, sampling_rate=16000):
        self.dataset_root = dataset_root
        self.sampling_rate = sampling_rate
        self.annotation_path = annotation_path
        self.clean_audio = clean_audio
        self.all_annotations = json.load(open(self.annotation_path))
        
        # Calculate total duration
        total_duration = sum((entry['timestamp_end'] - entry['timestamp_start']) / 16000 for entry in self.all_annotations)
        print(f"Total duration of this dataset is {total_duration / 3600:.2f} hours")
        
        # Initialize caching of processed audio
        self.audio_cache = {}

    def __len__(self):
        return len(self.all_annotations)

    def __getitem__(self, idx):
        row = self.all_annotations[idx]
        timestamp_start = int(row["timestamp_start"])
        timestamp_end = int(row["timestamp_end"])
        
        # Determine audio path based on whether to use clean audio
        audio_file = os.path.join(self.dataset_root, row["audio_file"]) if not self.clean_audio else os.path.join(self.dataset_root, row["cleaned_audio_file"])
        
        # Load audio
        if audio_file not in self.audio_cache:
            audio_array, sampling_rate = torchaudio.load(audio_file)
            audio_array = torch.mean(audio_array, dim=0).squeeze(0)
            # resample if necessary
            if sampling_rate != self.sampling_rate:
                resampler = Resample(sampling_rate, self.sampling_rate, dtype=audio_array.dtype)
                audio_array = resampler(audio_array)
            self.audio_cache[audio_file] = audio_array
        else:
            audio_array = self.audio_cache[audio_file]
            
        audio_segment = audio_array[timestamp_start:timestamp_end].numpy()
        
        return row, audio_segment

###################################################################################

# Define paths
train_json_path = '/home/cayden/asr-augmentation/data/all/train_teacher.json'
test_json_path = '/home/cayden/asr-augmentation/data/labelled/test.json'
#test_json_path = '/home/cayden/asr-augmentation/data/unlabelled/logit_test.json'
output_json_path = '/home/cayden/asr-augmentation/data/unlabelled/test_joint_conf_sem_only_stu_pred.json' #CHANGE
combined_json_path = '/home/cayden/asr-augmentation/data/unlabelled/train_stu.json' #CHANGE
peft_path = "/home/cayden/asr-augmentation/yeeying/JOINT_CONF_sem_only_stu/checkpoint-1570/"
audio_path = '/home/cayden/asr-augmentation/data/labelled/audio/'
do_peft = True

# Initialize model and tokenizer
language = "zh"
task = "transcribe"
if do_peft:
    model = WhisperForConditionalGeneration.from_pretrained(peft_path, device_map="auto")
else:
    model = WhisperForConditionalGeneration.from_pretrained(peft_path, device_map="auto")
tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small", language=language, task=task)
processor = WhisperProcessor.from_pretrained("openai/whisper-small", language=language, task=task)
pipeline = AutomaticSpeechRecognitionPipeline(model=model, tokenizer=tokenizer, feature_extractor=processor.feature_extractor)

# Predictions
pred_data = UnlabelledDataset(audio_path, test_json_path, clean_audio=False)
predictions = []
for entry, audio_segment in tqdm(pred_data, desc="Predicting"):

    # Prepare input features for the model
    inputs = processor(audio_segment, sampling_rate=pred_data.sampling_rate, return_tensors="pt", padding=True)
    inputs = {key: val.to(model.device) for key, val in inputs.items()}

    # Generate prediction with scores
    generated_outputs = model.generate(
        inputs["input_features"],
        forced_decoder_ids=processor.get_decoder_prompt_ids(language=language, task=task),
        max_new_tokens=128,
        output_scores=True,
        return_dict_in_generate=True
    )

    # Decode the predicted tokens
    decoded_text = tokenizer.decode(generated_outputs.sequences[0], skip_special_tokens=True)
    
    # Calculate token probabilities
    scores = generated_outputs.scores  # List of logits for each step
    token_probs = [softmax(score, dim=-1) for score in scores]
    
    # Compute confidence as the average maximum probability of tokens
    confidence_scores = [float(torch.max(prob).item()) for prob in token_probs]
    average_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
    total_confidence = np.array(confidence_scores).prod() if confidence_scores else 0.0

    # Append prediction with confidence
    predictions.append({
        'audio_file': entry['audio_file'],
        'cleaned_audio_file': entry['cleaned_audio_file'],
        'timestamp_start': entry['timestamp_start'],
        'timestamp_end': entry['timestamp_end'],
        'subtitle': decoded_text,
        'joint_confidence_score': total_confidence, 
        'average_confidence_score': average_confidence
    })
    
    
# Save predictions
with open(output_json_path, 'w', encoding="utf-8") as output_file:
    json.dump(predictions, output_file, ensure_ascii=False, indent=4)

print(f"Saved predictions to {output_json_path}")

# Load train.json
with open(train_json_path, 'r', encoding="utf-8") as train_file:
    train_data = json.load(train_file)

# Combine the train data with the predictions
combined_data = train_data + predictions
random.shuffle(combined_data)

# Save new training file for student model
with open(combined_json_path, 'w', encoding="utf-8") as output_file:
    json.dump(combined_data, output_file, ensure_ascii=False, indent=4)

print(f"Combined data saved to {combined_json_path}")