# Ollama Setup Guide

## What is Ollama?

Ollama allows you to run open-source Large Language Models (LLMs) locally on your machine - completely free and private!

## Installation

### macOS
```bash
# Option 1: Download from website
# Visit: https://ollama.com/download

# Option 2: Use Homebrew
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Download from: https://ollama.com/download

## Quick Start

1. **Start Ollama service** (if not auto-started)
   ```bash
   ollama serve
   ```

2. **Pull a model** (in a new terminal)
   ```bash
   # Recommended: Llama 3.1 (7B parameters, ~4.7GB)
   ollama pull llama3.1

   # Or try specialized code model:
   ollama pull qwen2.5-coder

   # Or CodeLlama:
   ollama pull codellama
   ```

3. **Test the model**
   ```bash
   ollama run llama3.1
   # Type a message and press Enter
   # Type /bye to exit
   ```

## Recommended Models for Code Generation

| Model | Size | Best For | Command |
|-------|------|----------|---------|
| **llama3.1** | ~4.7GB | General purpose, good balance | `ollama pull llama3.1` |
| **qwen2.5-coder** | ~4.7GB | Code generation (best) | `ollama pull qwen2.5-coder` |
| **codellama** | ~3.8GB | Code-focused tasks | `ollama pull codellama` |
| **mistral** | ~4.1GB | Fast, efficient | `ollama pull mistral` |

## Configure the GUI

Edit `.env` file:
```env
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1
```

## Verify It's Working

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# You should see a list of installed models
```

## Performance Tips

- **RAM**: Models need 8GB+ RAM for best performance
- **GPU**: Ollama automatically uses GPU if available (Metal on Mac, CUDA on Linux)
- **First run**: Model loading takes a few seconds
- **Subsequent runs**: Much faster as model stays in memory

## Troubleshooting

**Ollama not responding?**
```bash
# Kill any existing Ollama processes
pkill ollama

# Restart Ollama
ollama serve
```

**Model not found?**
```bash
# List installed models
ollama list

# Pull the model you need
ollama pull llama3.1
```

**Port already in use?**
```bash
# Change the port in .env
OLLAMA_HOST=http://localhost:11435

# Start Ollama on different port
OLLAMA_HOST=0.0.0.0:11435 ollama serve
```

## Why Use Ollama vs OpenAI?

✅ **Free** - No API costs
✅ **Private** - Runs locally, data never leaves your machine
✅ **No rate limits** - Use as much as you want
✅ **Offline** - Works without internet
✅ **Fast** - Low latency

❌ **Requires good hardware** - Needs 8GB+ RAM
❌ **Initial download** - Models are 4-8GB each
❌ **Slightly less capable** - Not quite GPT-4 level (but close!)

## More Information

- Ollama Website: https://ollama.com/
- Model Library: https://ollama.com/library
- GitHub: https://github.com/ollama/ollama
