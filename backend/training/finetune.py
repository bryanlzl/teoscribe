from transformers import WhisperProcessor, WhisperForConditionalGeneration, Seq2SeqTrainingArguments, Seq2SeqTrainer, Seq2SeqTrainingArguments
from peft import LoraConfig, PeftModel, LoraModel, LoraConfig, get_peft_model
import wandb

# start a new wandb run to track this script
wandb.init(
    # set the wandb project where this run will be logged
    project="test_whisper_finetune",
    # # track hyperparameters and run metadata
    # config={
    # "learning_rate": 0.02,
    # "architecture": "CNN",
    # "dataset": "CIFAR-100",
    # "epochs": 10,
    # }
)

# Data preparation
###

processor = WhisperProcessor.from_pretrained("openai/whisper-small", language="zh", task="transcribe") ### zh

# Load a Pre-Trained Checkpoint
model = WhisperForConditionalGeneration.from_pretrained("openai/whisper-small", device_map="auto") # load_in_8bit=True
model.generation_config.language = "zh" ###
model.generation_config.task = "transcribe"
model.generation_config.forced_decoder_ids = None
# In cases where the source audio language is known a-priori, such as multilingual fine-tuning, it is beneficial to set the language explicitly.
# This negates the scenarios when the incorrect language is predicted, causing the predicted text to diverge from the true language during generation.

# combine pre-trained model (freezed) w PEFT (trainable)
config = LoraConfig(r=32, lora_alpha=64, target_modules=["q_proj", "v_proj"], lora_dropout=0.05, bias="none")
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
    output_dir="finetuned", ###
    per_device_train_batch_size=16, ###
    gradient_accumulation_steps=1,
    learning_rate=1e-3,
    # warmup_steps=10, ###
    warmup_ratio=0.01, ###
    num_train_epochs=3,
    do_eval=True,
    eval_steps=10, ###
    eval_strategy="steps", # epoch
    max_steps=60, ###
    fp16=True, ### bf16=True
    per_device_eval_batch_size=16, ###
    predict_with_generate=True,
    generation_max_length=128,
    logging_strategy="steps",
    logging_steps=10, ###
    remove_unused_columns=False,
    label_names=["labels"],
    load_best_model_at_end=True,
    metric_for_best_model="wer",
    greater_is_better=False,
    save_strategy = "steps",
    save_steps = 30, ###
    save_total_limit = 2, ###
)

# Define trainer
trainer = Seq2SeqTrainer(
    args=training_args,
    model=model,
    train_dataset=common_voice["train"],
    eval_dataset=common_voice["test"],
    data_collator=data_collator,
    compute_metrics=compute_metrics,
    tokenizer=processor.feature_extractor,
    callbacks=[SavePeftModelCallback],
)
model.config.use_cache = False  # silence the warnings, reanable for inference
trainer.train()