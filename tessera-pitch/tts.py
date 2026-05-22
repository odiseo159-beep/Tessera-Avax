"""Direct TTS via kokoro-onnx. Bypasses hyperframes CLI's Python-detection
that picked a Python without our pip install."""
import sys
import urllib.request
import os
from pathlib import Path

CACHE = Path.home() / ".cache" / "hyperframes" / "tts"
CACHE.mkdir(parents=True, exist_ok=True)
MODEL = CACHE / "kokoro-v1.0.onnx"
VOICES = CACHE / "voices-v1.0.bin"
MODEL_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx"
VOICES_URL = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin"

def fetch(url, dest):
    if dest.exists() and dest.stat().st_size > 1024 * 1024:
        print(f"  cached: {dest.name} ({dest.stat().st_size // 1024 // 1024} MB)")
        return
    print(f"  downloading {dest.name} …")
    urllib.request.urlretrieve(url, dest)
    print(f"  done: {dest.stat().st_size // 1024 // 1024} MB")

print("Setting up Kokoro TTS …")
fetch(MODEL_URL, MODEL)
fetch(VOICES_URL, VOICES)

from kokoro_onnx import Kokoro
import soundfile as sf

text = Path("narration.txt").read_text(encoding="utf-8").strip()
voice = sys.argv[1] if len(sys.argv) > 1 else "ef_dora"
out = sys.argv[2] if len(sys.argv) > 2 else "narration.wav"

print(f"Synthesizing -> {out} (voice={voice}, {len(text)} chars) ...")
k = Kokoro(str(MODEL), str(VOICES))
# Auto-detect lang from voice prefix: e=es, a=en-us, b=en-gb, etc.
lang_map = {"a": "en-us", "b": "en-gb", "e": "es", "f": "fr-fr", "h": "hi", "i": "it", "j": "ja", "p": "pt-br", "z": "cmn"}
lang = lang_map.get(voice[0], "en-us")
samples, sr = k.create(text, voice=voice, speed=1.0, lang=lang)
sf.write(out, samples, sr)
print(f"Wrote {out}: {len(samples) / sr:.1f}s, {sr} Hz")
