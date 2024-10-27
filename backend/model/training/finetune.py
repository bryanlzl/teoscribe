from transformers import WhisperForConditionalGeneration, Seq2SeqTrainer, Seq2SeqTrainingArguments, AutomaticSpeechRecognitionPipeline, WhisperTokenizer
from torch.utils.data import random_split
from peft import LoraConfig, PeftConfig, PeftModel, LoraModel, get_peft_model
import random, torch, wandb
import numpy as np

from functions import *

import argparse

torch.manual_seed(2024)
random.seed(2024)
np.random.seed(2024)

def train(audio_path, annotated_path, out_path, do_wandb, clean_audio, semantic_loss):
    if do_wandb:
        # start a new wandb run to track this script
        wandb.init(
            # set the wandb project where this run will be logged
            project="whisper_finetune_teochew",
            # # track hyperparameters and run metadata
            # config={
            # "learning_rate": 0.02,
            # "architecture": "CNN",
            # "dataset": "CIFAR-100",
            # "epochs": 10,
            # }
        )

    # Data preparation (e.g., 80% train, 20% test), randomly split the dataset
    data = MyDataset(audio_path, annotated_path, clean_audio)
    train_size = int(0.8 * len(data))
    test_size = len(data) - train_size
    train_data, test_data = random_split(data, [train_size, test_size])
    print(f"Number of train data: {train_size}\nNumber of val data: {test_size}...")

    # processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="zh", task="transcribe") ### zh

    # Load a Pre-Trained Checkpoint
    model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small", device_map="auto") # load_in_8bit=True
    model.generation_config.language = "zh" ###
    model.generation_config.task = "transcribe"
    model.generation_config.forced_decoder_ids = None
    # In cases where the source audio language is known a-priori, such as multilingual fine-tuning, it is beneficial to set the language explicitly.
    # This negates the scenarios when the incorrect language is predicted, causing the predicted text to diverge from the true language during generation.

    # combine pre-trained model (freezed) w PEFT (trainable)
    config = LoraConfig(r=32, lora_alpha=64, target_modules=["q_proj", "v_proj"], lora_dropout=0.05, bias="none") # r=32
    model = get_peft_model(model, config)
    model.print_trainable_parameters()

    # Data collator
    data_collator = DataCollatorSpeechSeq2SeqWithPadding(
        processor=processor,
        decoder_start_token_id=model.config.decoder_start_token_id,
    )

    # Define the Training Configuration
    # The PeftModel doesn’t have the same signature as the base model, so you’ll need to explicitly set remove_unused_columns=False and label_names=["labels"].
    training_args = Seq2SeqTrainingArguments(
        seed = 2024, ###
        # learning_rate=2e-5, ###
        # optim = "paged_adamw_8bit", ###
        output_dir=out_path,
        per_device_train_batch_size=32, ### 16
        gradient_accumulation_steps=1, ### 2
        lr_scheduler_type="linear", ### linear, cosine
        learning_rate=1e-3, # 1e-3
        # warmup_steps=10, ###
        warmup_ratio=0.01, ###
        num_train_epochs=5, ### 3, 10
        do_eval=True,
        eval_steps=10, ###
        eval_strategy="steps", # epoch
        # max_steps=100, ###
        fp16=True, ### bf16=True
        per_device_eval_batch_size=16, ###
        predict_with_generate=True,
        generation_max_length=128,
        logging_strategy="steps",
        logging_steps=10, ###
        remove_unused_columns=False,
        label_names=["labels"],
        # load_best_model_at_end=True,
        metric_for_best_model="semantic_similarity" if semantic_loss else "wer",
        greater_is_better=True if semantic_loss else False,
        save_strategy = "steps",
        save_steps = 10, ###
        save_total_limit = 4, ###
    )

    # Define trainer
    if semantic_loss:
        trainer = CustomSeq2SeqTrainer(
            args=training_args,
            model=model,
            train_dataset=train_data,
            eval_dataset=test_data,
            data_collator=data_collator,
            compute_metrics=compute_metrics,
            tokenizer=processor.feature_extractor,
            callbacks=[SavePeftModelCallback],
        )

    else:
        trainer = Seq2SeqTrainer(
            args=training_args,
            model=model,
            train_dataset=train_data,
            eval_dataset=test_data,
            data_collator=data_collator,
            compute_metrics=compute_metrics,
            tokenizer=processor.feature_extractor,
            callbacks=[SavePeftModelCallback],
        )
    model.config.use_cache = False  # silence the warnings, reanable for inference
    trainer.train()

def evaluation():
    return

def predict(peft_path, audio_path, do_peft):
    language = "zh"
    task = "transcribe"
    # load model
    if do_peft:
        peft_config = PeftConfig.from_pretrained(peft_path)
        model = WhisperForConditionalGeneration.from_pretrained(peft_config.base_model_name_or_path, device_map="auto")
        model = PeftModel.from_pretrained(model, peft_path)
    else:
        model = WhisperForConditionalGeneration.from_pretrained(peft_path, device_map="auto")
    tokenizer = WhisperTokenizer.from_pretrained("openai/whisper-small", language=language, task=task)
    processor = WhisperProcessor.from_pretrained("openai/whisper-small", language=language, task=task)
    feature_extractor = processor.feature_extractor
    forced_decoder_ids = processor.get_decoder_prompt_ids(language=language, task=task)
    pipeline = AutomaticSpeechRecognitionPipeline(model=model, tokenizer=tokenizer, feature_extractor=feature_extractor)

    # audio to test
    waveform, sampling_rate = torchaudio.load(audio_path)
    waveform = torch.mean(waveform, dim=0)
    if sampling_rate != 16000:
        print("resample")
        resampler = T.Resample(sampling_rate, 16000, dtype=waveform.dtype)
        waveform = resampler(waveform)
    text = pipeline(waveform.numpy(), generate_kwargs={"forced_decoder_ids": forced_decoder_ids}, max_new_tokens=128)["text"]
    
    return text

def predict_api(pipeline, audio_path):
    """
    Used for API calls. Should preload pipeline, to avoid loading pipeline at every single API call.
    """
    # audio to test
    waveform, sampling_rate = torchaudio.load(audio_path)
    waveform = torch.mean(waveform, dim=0)
    if sampling_rate != 16000:
        print("resample")
        resampler = T.Resample(sampling_rate, 16000, dtype=waveform.dtype)
        waveform = resampler(waveform)
    text = pipeline(waveform.numpy(), generate_kwargs={"forced_decoder_ids": forced_decoder_ids}, max_new_tokens=128)["text"]
    
    return text

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Training')
    parser.add_argument('--audio_path', type=str, help='path to folder containing audios')
    parser.add_argument('--annotated_path', type=str, help='path to file containing annotated data')
    parser.add_argument('--out_path', type=str, help='path to where model will be saved')
    parser.add_argument("--wandb", action="store_true", help="whether to use wandb to track")
    parser.add_argument("--cleaned_audio", action="store_true", help="whether to use wandb to track")
    parser.add_argument("--semantic_loss", action="store_true", help="whether to include semantic loss into the training loss")
    args = parser.parse_args()

    train(args.audio_path, args.annotated_path, args.out_path, args.wandb, args.cleaned_audio, args.semantic_loss)
