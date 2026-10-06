#!/usr/bin/env bash
# Crea el entorno de voces: edge-tts (voces peruanas) y Kokoro como respaldo local sin red
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p voices/kokoro
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -f "voices/kokoro/$f" ] || curl -sSL -o "voices/kokoro/$f" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done
if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv
fi
.venv/bin/pip install -q edge-tts kokoro-onnx numpy
