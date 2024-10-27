import evaluate, json, os, torch, torchaudio
import numpy as np
from dataclasses import dataclass
from typing import Any, Dict, List, Union
from transformers.trainer_utils import PREFIX_CHECKPOINT_DIR
from transformers import TrainerCallback, TrainingArguments, TrainerState, TrainerControl, WhisperProcessor, Seq2SeqTrainer
from sentence_transformers import SentenceTransformer
from torch.utils.data import Dataset
import torchaudio.transforms as T
import torch.nn.functional as F
from sklearn.metrics.pairwise import cosine_similarity

# Load the SBERT model
model_sbert = SentenceTransformer('uer/sbert-base-chinese-nli')

# load whisper processor
processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="zh", task="transcribe") ### zh
# load WER metric
metric = evaluate.load("wer")

# function to compute sentence embeddings
def compute_sentence_embeddings(text_list):
    with torch.no_grad():
        sentence_embeddings = model_sbert.encode(text_list)
        
    return sentence_embeddings


# Dataset: resample, get log mel, tokenize
class MyDataset(Dataset):
    """
    data = MyDataset("/scratch/users/nus/e1329380/cs5647/crawled/audio", "/scratch/users/nus/e1329380/cs5647/crawled/dataset.json")
    """
    def __init__(self, dataset_root, annotation_path, clean_audio, sampling_rate=16000):
        self.dataset_root = dataset_root
        self.sampling_rate = sampling_rate
        self.annotation_path = annotation_path
        self.clean_audio = clean_audio
        self.all_annotations = json.load(open(self.annotation_path))
        
        # duration
        total_duration = 0
        for i in range(len(self.all_annotations)):
            total_duration += (self.all_annotations[i]['timestamp_end'] - self.all_annotations[i]['timestamp_start'])/16000
        print(f"Total duration of this dataset is {total_duration/60/60} hours")
        
        # Initialize caching of processed audio
        self.audio_cache = {}

    def __len__(self):
        return len(self.all_annotations)

    def __getitem__(self, idx):
        row = self.all_annotations[idx]
        subtitle = row["subtitle"]
        timestamp_start = int(row["timestamp_start"])
        timestamp_end = int(row["timestamp_end"])
        audio_file = os.path.join(self.dataset_root, row["audio_file"]) if not self.clean_audio else os.path.join(self.dataset_root, row["cleaned_audio_file"])
        
        # Load audio
        if audio_file not in self.audio_cache:
            audio_array, sampling_rate = torchaudio.load(audio_file)
            audio_array = torch.mean(audio_array, dim=0).squeeze(0)
            # resample if necessary
            if sampling_rate != self.sampling_rate:
                resampler = T.Resample(sampling_rate, self.sampling_rate, dtype=audio_array.dtype)
                audio_array = resampler(audio_array)
            self.audio_cache[audio_file] = audio_array
        else:
            audio_array = self.audio_cache[audio_file]
            
        audio_segment = audio_array[timestamp_start:timestamp_end].numpy()
        # compute log-Mel input features from input audio array
        input_features = processor.feature_extractor(audio_segment, sampling_rate=self.sampling_rate).input_features[0]
        # encode target text to label ids
        labels = processor.tokenizer(subtitle).input_ids

        return {"input_features": input_features,
                "labels": labels}


class CustomSeq2SeqTrainer(Seq2SeqTrainer):
    def compute_loss(self, model, inputs, return_outputs=False):
        # Forward pass to get predictions
        outputs = model(**inputs)
        logits = outputs.logits

        # Get the CrossEntropy loss (as per the usual flow)
        labels = inputs.get("labels")
        ce_loss = F.cross_entropy(logits.view(-1, logits.size(-1)), labels.view(-1), ignore_index=-100)

        # Decode the predicted and reference sequences for semantic similarity
        pred_ids = torch.argmax(logits, dim=-1)
        pred_str = processor.tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
        label_str = processor.tokenizer.batch_decode(labels, skip_special_tokens=True)

        # Compute semantic similarity score
        pred_embeddings = compute_sentence_embeddings(pred_str)
        ref_embeddings = compute_sentence_embeddings(label_str)
        cosine_sim = cosine_similarity(pred_embeddings, ref_embeddings)
        semantic_loss = (1-np.diag(cosine_sim)).mean() # (1-cosine_sim).mean()

        # Combine CrossEntropy loss and semantic similarity (higher semantic similarity should reduce loss)
        combined_loss = ce_loss + 2 * semantic_loss # Adjust the weight of semantic loss as needed

        return (combined_loss, outputs) if return_outputs else combined_loss


# Evaluation Metrics
def compute_metrics(pred):
    """
    evaluates WER and semantic similarity score
    """
    pred_ids = pred.predictions
    label_ids = pred.label_ids

    # replace -100 with the pad_token_id
    label_ids[label_ids == -100] = processor.tokenizer.pad_token_id

    # we do not want to group tokens when computing the metrics
    pred_str = processor.tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
    label_str = processor.tokenizer.batch_decode(label_ids, skip_special_tokens=True)

    # Compute Word Error Rate (WER)
    wer = 100 * metric.compute(predictions=pred_str, references=label_str)

    # Compute semantic similarity using sentence embeddings
    pred_embeddings = compute_sentence_embeddings(pred_str)
    ref_embeddings = compute_sentence_embeddings(label_str)
    cosine_sim = cosine_similarity(pred_embeddings, ref_embeddings)
    semantic_similarity = torch.tensor(np.diag(cosine_sim).mean()) # torch.tensor(cosine_sim.mean())

    return {"wer": wer, "semantic_similarity": semantic_similarity.item()}


# Data collator
# input_features are already padded, just need to batch them
# labels are unpadded, we need to pad
@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    processor: Any
    decoder_start_token_id: int

    def __call__(self, features: List[Dict[str, Union[List[int], torch.Tensor]]]) -> Dict[str, torch.Tensor]:
        # split inputs and labels since they have to be of different lengths and need different padding methods
        # first treat the audio inputs by simply returning torch tensors
        input_features = [{"input_features": feature["input_features"]} for feature in features]
        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")

        # get the tokenized label sequences
        label_features = [{"input_ids": feature["labels"]} for feature in features]
        # pad the labels to max length
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        # replace padding with -100 to ignore loss correctly
        labels = labels_batch["input_ids"].masked_fill(labels_batch.attention_mask.ne(1), -100)

        # if bos token is appended in previous tokenization step,
        # cut bos token here as it's append later anyways
        if (labels[:, 0] == self.decoder_start_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels

        return batch


# It is also a good idea to write a custom TrainerCallback to save model checkpoints during training:
class SavePeftModelCallback(TrainerCallback):
    def on_save(
        self,
        args: TrainingArguments,
        state: TrainerState,
        control: TrainerControl,
        **kwargs,
    ):
        checkpoint_folder = os.path.join(args.output_dir, f"{PREFIX_CHECKPOINT_DIR}-{state.global_step}")

        peft_model_path = os.path.join(checkpoint_folder, "adapter_model")
        kwargs["model"].save_pretrained(peft_model_path)

        pytorch_model_path = os.path.join(checkpoint_folder, "pytorch_model.bin")
        if os.path.exists(pytorch_model_path):
            os.remove(pytorch_model_path)
        return control