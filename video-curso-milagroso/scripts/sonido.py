"""Construye la línea de tiempo y la banda sonora a partir de scripts/guion.json.

1. Sintetiza cada diálogo con Piper (voz en español, sin servicios de pago).
2. Procesa la voz: el junior un poco más agudo, Ingenito con efecto robot.
3. Coloca cada beat en el tiempo y escribe src/timeline.json (planos, subtítulos,
   efectos) y src/mouth.json (apertura de boca por fotograma, sacada del audio real).
4. Mezcla voces + música lo-fi (con ducking) + efectos en public/audio.wav,
   que la composición de Remotion reproduce con <Audio>.

Uso: .venv/bin/python -I scripts/sonido.py   (desde la carpeta del proyecto)
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
VOICE = os.path.join(ROOT, "voices/es-carlfm-x-low/es-carlfm-x-low.onnx")
PIPER = os.path.join(ROOT, ".venv/bin/piper")
rng = np.random.default_rng(7)


# ---------- utilidades de audio ----------

def read_wav(path):
    with wave.open(path) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(axis=1)
        return x, w.getframerate()


def env(n, attack=0.005, release=0.06):
    t = np.arange(n) / SR
    return np.clip(t / attack, 0, 1) * np.clip((n / SR - t) / release, 0, 1)


def place(buf, sig, t0):
    i = int(round(t0 * SR))
    if i >= len(buf):
        return
    end = min(len(buf), i + len(sig))
    buf[i:end] += sig[: end - i]


def noise(n):
    return rng.standard_normal(n)


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def trim_silence(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.02 * SR))
    b = min(len(x), idx[-1] + int(0.06 * SR))
    return x[a:b]


# ---------- voces ----------

def synth(text, who, tmp):
    raw = os.path.join(tmp, "raw.wav")
    out = os.path.join(tmp, "proc.wav")
    length = "0.9" if who == "junior" else "1.0"
    subprocess.run([PIPER, "-m", VOICE, "-f", raw, "--length-scale", length], input=text.encode(), check=True, capture_output=True)
    # junior: +7 % de tono sin cambiar duración; Ingenito: -6 % (más grave)
    k = 1.07 if who == "junior" else 0.94
    _, sr = read_wav(raw)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"asetrate={sr * k:.0f},aresample={SR},atempo={1 / k:.4f}", "-ac", "1", out],
        check=True,
    )
    x, _ = read_wav(out)
    x = trim_silence(x)
    if who == "ingenito":
        x = robotize(x)
    return x / max(1e-6, np.abs(x).max()) * 0.9


def robotize(x):
    t = np.arange(len(x)) / SR
    y = x * (0.62 + 0.38 * np.sin(2 * np.pi * 48 * t))  # modulación metálica
    d = int(0.0045 * SR)
    for _ in range(2):  # resonancia tipo lata
        y[d:] += 0.38 * y[:-d]
    y = np.round(y / np.abs(y).max() * 48) / 48  # bit-crush leve
    return y


def mouth_curve(x, fps):
    hop = SR // fps
    n = int(np.ceil(len(x) / hop))
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) if len(x[i * hop:(i + 1) * hop]) else 0 for i in range(n)])
    rms = rms / max(1e-6, np.percentile(rms, 95))
    return np.clip((rms - 0.12) / 0.75, 0, 1)


# ---------- efectos ----------

def whoosh(dur=0.45):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    return lowpass(noise(n), 0.08) * np.sin(np.pi * t) ** 2 * 1.4


def pop(freq=900, dur=0.09):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 1.5 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)


def cash(dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return sum(np.sin(2 * np.pi * f * t) for f in (2093, 2637, 3136)) / 3 * np.exp(-t * 9)


def click(dur=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (noise(n) * 0.5 + np.sin(2 * np.pi * 1800 * t)) * np.exp(-t * 120)


def crickets(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    gate = (np.sin(2 * np.pi * 3.0 * t) > 0.55).astype(float)
    trill = (np.sin(2 * np.pi * 38 * t) > 0).astype(float)
    return np.sin(2 * np.pi * 4600 * t) * gate * trill * env(n, 0.05, 0.1)


def scratch(dur=0.35):
    """Rayón de disco: barrido de tono con ruido."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = 900 * np.exp(-t * 6) + 120
    tone = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return (tone * 0.5 + lowpass(noise(n), 0.4) * 0.8) * env(n, 0.005, 0.08)


def sting(dur=1.6):
    """Acorde final brillante para la tarjeta de cierre."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) * (1 / (i + 1)) for i, f in enumerate((523.3, 659.3, 784.0, 1046.5)))
    return s * np.exp(-t * 2.2) * env(n, 0.01, 0.3)


def lofi(total):
    n = int(total * SR)
    out = np.zeros(n)
    chords = [(261.6, 329.6, 392.0, 493.9), (220.0, 261.6, 329.6, 392.0), (174.6, 220.0, 261.6, 329.6), (196.0, 246.9, 293.7, 349.2)]
    beat = 60 / 84
    bar = beat * 4
    i = 0
    while i * bar < total:
        ch = chords[i % 4]
        m = int(bar * SR)
        tt = np.arange(m) / SR
        s = sum(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.003 * tt) for f in ch) / len(ch)
        place(out, s * env(m, 0.3, 0.4) * 0.16, i * bar)
        i += 1
    k = 0
    while k * beat < total:
        if k % 2 == 0:
            m = int(0.25 * SR)
            tt = np.arange(m) / SR
            kick = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 14)
            place(out, kick * 0.5, k * beat)
        m = int(0.05 * SR)
        hat = np.diff(noise(m + 1)) * np.exp(-np.arange(m) / SR * 80)
        place(out, hat * 0.05, k * beat + beat / 2)
        k += 1
    return out + lowpass(noise(n), 0.3) * 0.006


# ---------- armado ----------

def main():
    g = json.load(open(os.path.join(ROOT, "scripts/guion.json")))
    fps = g["fps"]
    gap = g["gap"]

    clips = []
    with tempfile.TemporaryDirectory() as tmp:
        for b in g["beats"]:
            clips.append(synth(b["say"], b["who"], tmp) if b["type"] == "line" else None)

    t = 0.0
    segments, lines, voice_places = [], [], []
    sfx = {"comments": []}
    for b, clip in zip(g["beats"], clips):
        start = t
        if b["type"] == "line":
            talk = len(clip) / SR
            dur = talk + b.get("tail", 0) + gap
            voice_places.append((b["who"], clip, start))
            lines.append({
                "who": b["who"], "text": b["text"],
                "from": round(start * fps), "to": round((start + dur) * fps),
            })
        else:
            dur = b["dur"]
            if "caption" in b:
                lines.append({"who": "caption", "text": b["caption"], "from": round(start * fps), "to": round((start + dur) * fps)})
        f0, f1 = round(start * fps), round((start + dur) * fps)
        seg = {k: v for k, v in b.items() if k not in ("type", "text", "say", "who", "dur", "tail", "caption", "sfx", "overlayFrom")}
        seg.update({"from": f0, "to": f1})
        if "overlay" in b:
            seg["overlayFrom"] = f0 + round(b.get("overlayFrom", 0) * (f1 - f0))
        segments.append(seg)

        ov = b.get("overlay")
        if ov == "mockup":
            sfx["mockupIn"] = f0
            sfx["priceSlash"] = f0 + 30
            sfx["comments"] = [f0 + 48, f0 + 66, f0 + 84]
        elif ov == "run":
            talk_end = f0 + round(len(clip) / SR * fps)
            sfx["runPop"] = talk_end - 10
            sfx["runClick"] = talk_end + 2
        elif ov == "insta-crop":
            sfx["instaIn"] = seg["overlayFrom"]
        elif ov == "insta-reveal":
            sfx["reveal"] = seg["overlayFrom"]
        if b.get("sfx") == "crickets":
            sfx["crickets"] = [f0, f1]
        if b.get("sfx") == "end":
            sfx["endIn"] = f0
        t += dur

    total = t
    n_frames = int(np.ceil(total * fps))
    n = int(total * SR) + SR // 2

    # voces + curvas de boca
    voices = np.zeros(n)
    mouth = {"junior": [0.0] * n_frames, "ingenito": [0.0] * n_frames}
    for who, clip, start in voice_places:
        place(voices, clip * 0.95, start)
        curve = mouth_curve(clip, fps)
        f0 = round(start * fps)
        for i, v in enumerate(curve):
            if f0 + i < n_frames:
                mouth[who][f0 + i] = round(float(v), 3)

    # música con ducking bajo la voz y corte en los grillos
    music = lofi(total + 0.5)[:n]
    voice_env = lowpass(np.abs(voices), 0.0008)
    voice_env /= max(1e-6, voice_env.max())
    music *= 1 - 0.6 * np.clip(voice_env * 3, 0, 1)
    if "crickets" in sfx:
        a, b = (int(x / fps * SR) for x in sfx["crickets"])
        music[a:b] = 0

    fx = np.zeros(n)
    place(fx, whoosh() * 0.35, sfx["mockupIn"] / fps - 0.1)
    place(fx, cash() * 0.3, sfx["priceSlash"] / fps)
    for i, c in enumerate(sfx["comments"]):
        place(fx, pop(800 + i * 150) * 0.35, c / fps)
    mock_seg = next(s for s in segments if s.get("overlay") == "mockup")
    place(fx, whoosh(0.3) * 0.3, (mock_seg["to"] - 6) / fps)
    place(fx, pop(1200, 0.12) * 0.4, sfx["runPop"] / fps)
    place(fx, click() * 0.5, sfx["runClick"] / fps)
    a, b = sfx["crickets"]
    place(fx, crickets((b - a) / fps) * 0.12, a / fps)
    place(fx, pop(700, 0.12) * 0.35, sfx["instaIn"] / fps)
    place(fx, scratch() * 0.3, sfx["reveal"] / fps)
    place(fx, sting() * 0.25, sfx["endIn"] / fps)

    mix = voices * 0.9 + music + fx
    mix /= max(1.0, np.abs(mix).max() / 0.89)
    pcm = (mix * 32767).astype(np.int16)
    with wave.open(os.path.join(ROOT, "public/audio.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.stack([pcm, pcm], axis=1).tobytes())

    timeline = {"fps": fps, "durationInFrames": n_frames, "segments": segments, "lines": lines, "sfx": sfx}
    json.dump(timeline, open(os.path.join(ROOT, "src/timeline.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(mouth, open(os.path.join(ROOT, "src/mouth.json"), "w"))
    print(f"duración: {total:.2f} s ({n_frames} fotogramas)")
    for s in segments:
        print(f"  {s['from']:4d}-{s['to']:4d}  {s['cam']:9s} {s.get('overlay', '')}")


if __name__ == "__main__":
    main()
