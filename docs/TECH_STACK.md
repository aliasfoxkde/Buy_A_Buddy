All models are ONNX runtime, mixed precision but generally q4f16 quantized.

TTS: Kokoro TTS ~110MB
STT: Whisper Tiny ~58MB
LLM: Falcon-H1-Tiny-90M ~110MB
Embedding Model: all-MiniLM-L6-v2 ~30MB
- This model is for RAG/DAG and knowledge management, storage, and retrieval, etc.

Total EST: 308MB (for full AI Stack)

Notes: Fallback to built in browser Web TTS API.

Resources:
https://huggingface.co/spaces/tiiuae/tiny-h1-blogpost
https://huggingface.co/onnx-community/Falcon-H1-Tiny-90M-Instruct-ONNX