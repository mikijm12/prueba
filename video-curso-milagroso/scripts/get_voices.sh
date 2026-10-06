#!/usr/bin/env bash
# Descarga la voz en español de Piper (GitHub releases) y crea un entorno con piper-tts
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p voices
if [ ! -f voices/es-carlfm-x-low/es-carlfm-x-low.onnx ]; then
  curl -sSL https://github.com/rhasspy/piper/releases/download/v0.0.2/voice-es-carlfm-x-low.tar.gz | tar xz -C voices --one-top-level=es-carlfm-x-low
fi
if [ ! -x .venv/bin/piper ]; then
  python3 -m venv .venv
  .venv/bin/pip install -q piper-tts numpy
fi
