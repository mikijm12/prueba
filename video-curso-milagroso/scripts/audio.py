"""Genera la banda sonora de la prueba (sin servicios externos).

Voces tipo "bip" por sílaba (sincronizadas con src/talk.ts), música lo-fi suave
y efectos. Uso: python3 -I scripts/audio.py src/timeline.json out/audio.wav
"""
import json
import sys
import wave

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def env(n, attack=0.005, release=0.06):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    r = np.clip((n / SR - t) / release, 0, 1)
    return a * r


def place(buf, sig, t0):
    i = int(t0 * SR)
    end = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:end] += sig[: end - i]


def voice_junior(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 0.04 * np.sin(2 * np.pi * 7 * t))
    ph = 2 * np.cumsum(np.pi * f / SR)
    sig = 0.6 * np.sign(np.sin(ph)) * 0.35 + 0.65 * np.sin(ph) + 0.2 * np.sin(2 * ph)
    return sig * env(n, 0.006, 0.04)


def voice_robot(freq, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ph = 2 * np.pi * freq * t
    sig = np.sin(ph + 2.5 * np.sin(2 * np.pi * freq * 2 * t))
    sig = np.round(sig * 6) / 6  # bit-crush para sonar a robot
    return sig * env(n, 0.004, 0.03)


def noise(n):
    return rng.standard_normal(n)


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i, v in enumerate(x):
        acc += a * (v - acc)
        y[i] = acc
    return y


def whoosh(dur=0.45):
    n = int(dur * SR)
    t = np.linspace(0, 1, n)
    x = lowpass(noise(n), 0.08) * np.sin(np.pi * t) ** 2
    return x * 1.4


def pop(freq=900, dur=0.09):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = freq * (1 + 1.5 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)


def cash(dur=0.35):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t) for f in (2093, 2637, 3136)) / 3
    return s * np.exp(-t * 9)


def click(dur=0.05):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return (noise(n) * 0.5 + np.sin(2 * np.pi * 1800 * t)) * np.exp(-t * 120)


def crickets(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    chirp_gate = (np.sin(2 * np.pi * 3.0 * t) > 0.55).astype(float)
    trill = (np.sin(2 * np.pi * 38 * t) > 0).astype(float)
    tone = np.sin(2 * np.pi * 4600 * t)
    return tone * chirp_gate * trill * env(n, 0.05, 0.1)


def lofi(total):
    """Pad de acordes + bombo y hi-hat suaves a 84 bpm."""
    n = int(total * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    chords = [(261.6, 329.6, 392.0, 493.9), (220.0, 261.6, 329.6, 392.0), (174.6, 220.0, 261.6, 329.6), (196.0, 246.9, 293.7, 349.2)]
    beat = 60 / 84
    bar = beat * 4
    for i, ch in enumerate(chords * 3):
        t0 = i * bar
        if t0 >= total:
            break
        m = int(bar * SR)
        tt = np.arange(m) / SR
        s = sum(np.sin(2 * np.pi * f * tt) + 0.3 * np.sin(2 * np.pi * f * 2.003 * tt) for f in ch) / len(ch)
        place(out, s * env(m, 0.3, 0.4) * 0.16, t0)
    k = 0
    while k * beat < total:
        tk = k * beat
        if k % 2 == 0:
            m = int(0.25 * SR)
            tt = np.arange(m) / SR
            kick = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 14)
            place(out, kick * 0.5, tk)
        m = int(0.05 * SR)
        hat = np.diff(noise(m + 1)) * np.exp(-np.arange(m) / SR * 80)
        place(out, hat * 0.05, tk + beat / 2)
        k += 1
    # ruido de vinilo
    out += lowpass(noise(n), 0.3) * 0.006
    return out


def main(timeline_path, out_path):
    tl = json.load(open(timeline_path))
    fps = tl["fps"]
    total = tl["durationInFrames"] / fps
    n = int(total * SR)
    mix = np.zeros(n)

    music = lofi(total)
    # la música se corta en seco con los grillos (silencio incómodo)
    cut = int(tl["sfx"]["crickets"] / fps * SR)
    music[cut:] = 0
    mix += music

    for line in tl["lines"]:
        if line["syllables"] == 0:
            continue
        slot = (line["talkEnd"] - line["from"]) / line["syllables"]
        base = 300 if line["who"] == "junior" else 520
        for i in range(line["syllables"]):
            t0 = (line["from"] + i * slot) / fps
            dur = slot * 0.6 / fps
            jitter = 1 + rng.uniform(-0.12, 0.14)
            # sube de tono al final de la pregunta
            if i == line["syllables"] - 1 and "?" in line["text"]:
                jitter *= 1.25
            gen = voice_junior if line["who"] == "junior" else voice_robot
            place(mix, gen(base * jitter, dur) * 0.33, t0)

    sfx = tl["sfx"]
    place(mix, whoosh() * 0.35, sfx["mockupIn"] / fps - 0.1)
    place(mix, cash() * 0.3, sfx["priceSlash"] / fps)
    for i, c in enumerate(sfx["comments"]):
        place(mix, pop(800 + i * 150) * 0.35, c / fps)
    place(mix, whoosh(0.3) * 0.3, 180 / fps)
    place(mix, pop(1200, 0.12) * 0.4, sfx["runPop"] / fps)
    place(mix, click() * 0.5, sfx["runClick"] / fps)
    place(mix, crickets(total - sfx["crickets"] / fps) * 0.12, sfx["crickets"] / fps)

    mix /= max(1.0, np.abs(mix).max() / 0.89)
    pcm = (mix * 32767).astype(np.int16)
    stereo = np.stack([pcm, pcm], axis=1)
    with wave.open(out_path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
