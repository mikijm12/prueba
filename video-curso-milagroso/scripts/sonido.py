"""Construye la línea de tiempo y la banda sonora de un episodio (episodios/<ep>/guion.json).

1. Sintetiza cada diálogo con las voces peruanas de Microsoft (edge-tts, es-PE-AlexNeural);
   con VOCES=kokoro usa en cambio voces neuronales locales (sin red).
2. Procesa la voz: el junior un poco más agudo, Ingenito más grave con un toque metálico suave.
3. Coloca cada beat en el tiempo y escribe src/episodios/<ep>/timeline.json (planos,
   subtítulos, chat, efectos) y mouth.json (apertura de boca por fotograma, del audio real).
4. Mezcla voces + música lo-fi (con ducking) + efectos en public/<ep>/audio.wav,
   que la composición de Remotion reproduce con <Audio>.

Uso: .venv/bin/python -I scripts/sonido.py ep2   (lee episodios/ep2/guion.json)
"""
import json
import os
import subprocess
import tempfile
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 44100
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

# Voces peruanas de Microsoft (las mismas de la skill de videos CIngeniería).
# Cada guion puede ajustarlas en "voces"; estas son las del episodio 1.
EDGE_VOICES = {
    "junior": {"voice": "es-PE-AlexNeural", "rate": "+18%", "pitch": "+6Hz"},
    "ingenito": {"voice": "es-PE-AlexNeural", "rate": "+8%", "pitch": "-14Hz", "robot": True},
}
VOICES = dict(EDGE_VOICES)
# Respaldo local si no hay red: VOCES=kokoro
KOKORO_VOICES = {"junior": ("em_alex", 1.1, 1.04), "ingenito": ("em_santa", 1.0, 0.95)}
_kokoro = None


def synth_edge(text, who, path):
    import asyncio
    import ssl

    import edge_tts
    import edge_tts.communicate as comm

    # el entorno en la nube sale por un proxy con su propio certificado
    ca = os.environ.get("SSL_CERT_FILE") or "/root/.ccr/ca-bundle.crt"
    if os.path.exists(ca):
        comm._SSL_CTX = ssl.create_default_context(cafile=ca)
    cfg = VOICES[who]
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    com = edge_tts.Communicate(text, cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"], proxy=proxy)
    asyncio.run(com.save(path))


def synth_kokoro(text, who, path):
    global _kokoro
    if _kokoro is None:
        from kokoro_onnx import Kokoro

        _kokoro = Kokoro(os.path.join(ROOT, "voices/kokoro/kokoro-v1.0.onnx"), os.path.join(ROOT, "voices/kokoro/voices-v1.0.bin"))
    voice, speed, k = KOKORO_VOICES[who]
    samples, sr = _kokoro.create(text, voice=voice, speed=speed, lang="es")
    pcm = (np.clip(samples, -1, 1) * 32767).astype(np.int16)
    raw = path + ".raw.wav"
    with wave.open(raw, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())
    # ajuste leve de tono sin cambiar la duración
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"asetrate={sr * k:.0f},aresample={sr},atempo={1 / k:.4f}", path],
        check=True,
    )


def synth(text, who, tmp):
    raw = os.path.join(tmp, "voz.mp3" if os.environ.get("VOCES", "edge") == "edge" else "voz.wav")
    if os.environ.get("VOCES", "edge") == "edge":
        synth_edge(text, who, raw)
    else:
        synth_kokoro(text, who, raw)
    out = os.path.join(tmp, "proc.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-ar", str(SR), "-ac", "1", out], check=True)
    x, _ = read_wav(out)
    x = trim_silence(x)
    if VOICES[who].get("robot"):
        x = robotize(x)
    return x / max(1e-6, np.abs(x).max()) * 0.9


def robotize(x):
    """Toque metálico sutil: una resonancia corta mezclada al 30 %, sin distorsión."""
    d = int(0.006 * SR)
    wet = x.copy()
    wet[d:] += 0.5 * x[:-d]
    wet[2 * d:] += 0.25 * x[:-2 * d]
    return 0.7 * x + 0.3 * wet / max(1e-6, np.abs(wet).max()) * np.abs(x).max()


def mouth_curve(x, fps):
    """Apertura de boca (0..1) por fotograma según el volumen."""
    hop = SR // fps
    n = int(np.ceil(len(x) / hop))
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) if len(x[i * hop:(i + 1) * hop]) else 0 for i in range(n)])
    rms = rms / max(1e-6, np.percentile(rms, 95))
    return np.clip((rms - 0.12) / 0.75, 0, 1)


def mouth_shape(x, fps):
    """Forma de boca (-1 redonda "o/u" … +1 ancha "e/i") por fotograma, según el brillo espectral."""
    hop = SR // fps
    n = int(np.ceil(len(x) / hop))
    win = np.hanning(2048)
    freqs = np.fft.rfftfreq(2048, 1 / SR)
    cents = np.zeros(n)
    for i in range(n):
        c = i * hop + hop // 2
        seg = x[max(0, c - 1024):c + 1024]
        if len(seg) < 2048:
            seg = np.pad(seg, (0, 2048 - len(seg)))
        mag = np.abs(np.fft.rfft(seg * win))
        band = (freqs > 200) & (freqs < 5000)
        cents[i] = (mag[band] * freqs[band]).sum() / max(1e-9, mag[band].sum())
    voiced = mouth_curve(x, fps) > 0.1
    if voiced.sum() < 3:
        return np.zeros(n)
    mu, sd = cents[voiced].mean(), cents[voiced].std() + 1e-6
    shape = np.tanh((cents - mu) / sd)
    # suavizado ligero para que no tiemble
    shape = np.convolve(shape, np.ones(3) / 3, mode="same")
    return np.where(voiced, shape, 0)


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


def ping():
    """Notificación de mensaje (dos tonos cortos)."""
    out = np.zeros(int(0.32 * SR))
    for i, f in enumerate((1318.5, 1760.0)):
        m = int(0.14 * SR)
        t = np.arange(m) / SR
        place(out, np.sin(2 * np.pi * f * t) * np.exp(-t * 28), i * 0.11)
    return out


def typing(dur):
    """Tecleo en el celular: clics cortos irregulares."""
    out = np.zeros(int(dur * SR) + SR // 10)
    t = 0.0
    while t < dur:
        place(out, click(0.025) * rng.uniform(0.4, 0.8), t)
        t += rng.uniform(0.07, 0.16)
    return out


def saw(f, n):
    t = np.arange(n) / SR
    return 2 * ((t * f) % 1) - 1


def drama(dur=1.9):
    """"¡Tan, tan, taaan!" de telenovela: tres golpes de metales graves + timbal."""
    out = np.zeros(int(dur * SR))
    notes = [(146.8, 0.0, 0.22), (138.6, 0.28, 0.22), (110.0, 0.56, 1.3)]
    for f, t0, d in notes:
        n = int(d * SR)
        tone = sum(saw(f * m, n) * (0.5 / m) for m in (1, 1.005, 2.0))
        tone = lowpass(tone, 0.12) * env(n, 0.01, min(0.4, d * 0.6))
        t = np.arange(n) / SR
        timp = np.sin(2 * np.pi * np.cumsum(70 + 40 * np.exp(-t * 20)) / SR) * np.exp(-t * 5)
        place(out, tone * 0.8 + timp * 0.6, t0)
    return out


def hit(dur=1.2):
    """Golpe grave de tensión con cola de ruido."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(45 + 60 * np.exp(-t * 12)) / SR) * np.exp(-t * 3.5)
    return boom + lowpass(noise(n), 0.05) * np.exp(-t * 4) * 0.6


def obra_ambiente(dur):
    """Ambiente de obra lejano: martillazos irregulares y zumbido de mezcladora."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    out = lowpass(noise(n), 0.02) * 0.25 + np.sin(2 * np.pi * 52 * t) * 0.03 * (1 + 0.3 * np.sin(2 * np.pi * 1.3 * t))
    k = 0.3
    while k < dur:
        place(out, click(0.04) * 0.35, k)
        place(out, click(0.04) * 0.25, k + 0.18)
        k += rng.uniform(0.9, 1.8)
    return out


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
        place(out, s * env(m, 0.3, 0.4) * 0.11, i * bar)
        i += 1
    k = 0
    while k * beat < total:
        if k % 2 == 0:
            m = int(0.25 * SR)
            tt = np.arange(m) / SR
            kick = np.sin(2 * np.pi * np.cumsum(55 + 90 * np.exp(-tt * 30)) / SR) * np.exp(-tt * 14)
            place(out, kick * 0.35, k * beat)
        m = int(0.05 * SR)
        hat = np.diff(noise(m + 1)) * np.exp(-np.arange(m) / SR * 80)
        place(out, hat * 0.05, k * beat + beat / 2)
        k += 1
    return out + lowpass(noise(n), 0.3) * 0.006


# ---------- armado ----------

def main(ep):
    global VOICES
    g = json.load(open(os.path.join(ROOT, "episodios", ep, "guion.json")))
    fps = g["fps"]
    gap = g["gap"]
    VOICES = {**EDGE_VOICES, **g.get("voces", {})}

    clips = []
    with tempfile.TemporaryDirectory() as tmp:
        for b in g["beats"]:
            clips.append(synth(b["say"], b["who"], tmp) if b["type"] == "line" else None)

    t = 0.0
    segments, lines, voice_places, chat = [], [], [], []
    sfx = {"comments": [], "pings": [], "typing": [], "sent": []}
    for b, clip in zip(g["beats"], clips):
        start = t
        lead = b.get("lead", 0)
        talk = 0.0
        if b["type"] == "line":
            talk = len(clip) / SR
            dur = lead + talk + b.get("tail", 0) + gap
            voice_places.append((b["who"], clip, start + lead))
            lines.append({
                "who": b["who"], "text": b["text"],
                "from": round((start + lead) * fps), "to": round((start + dur) * fps),
            })
        else:
            dur = b["dur"]
            if "caption" in b:
                lines.append({"who": "caption", "text": b["caption"], "from": round(start * fps), "to": round((start + dur) * fps)})
        f0, f1 = round(start * fps), round((start + dur) * fps)
        skip = ("type", "text", "say", "who", "dur", "tail", "caption", "sfx", "overlayFrom", "lead", "chat", "pings")
        seg = {k: v for k, v in b.items() if k not in skip}
        seg.update({"from": f0, "to": f1})
        if "overlay" in b:
            seg["overlayFrom"] = f0 + round(b.get("overlayFrom", 0) * (f1 - f0))
        segments.append(seg)

        # mensajes de WhatsApp: "at" en segundos desde el inicio del beat
        for m in b.get("chat", []):
            frame = round((start + m.get("at", 0)) * fps)
            msg = {"frame": frame, "from": m["from"], "time": m.get("time", "11:47 p. m.")}
            if "text" in m:
                msg["text"] = m["text"]
            if m.get("photo"):
                msg["photo"] = True
            if m.get("typed"):
                # se escribe mientras el junior lo dice en voz alta
                msg["frame"] = round((start + lead) * fps)
                msg["typedEnd"] = round((start + lead + talk) * fps)
                sfx["typing"].append([msg["frame"], msg["typedEnd"]])
                sfx["sent"].append(msg["typedEnd"] + 4)
            elif m["from"] == "client":
                sfx["pings"].append(frame)
            chat.append(msg)
        for p_at in b.get("pings", []):
            sfx["pings"].append(round((start + p_at) * fps))

        ov = b.get("overlay")
        if ov == "mockup":
            sfx["mockupIn"] = f0
            sfx["priceSlash"] = f0 + 30
            sfx["comments"] = [f0 + 48, f0 + 66, f0 + 84]
        elif ov == "run":
            talk_end = f0 + round(talk * fps)
            sfx["runPop"] = talk_end - 10
            sfx["runClick"] = talk_end + 2
        elif ov == "insta-crop":
            sfx["instaIn"] = seg["overlayFrom"]
        elif ov == "insta-reveal":
            sfx["reveal"] = seg["overlayFrom"]
        elif ov == "manual":
            sfx["manualIn"] = seg["overlayFrom"]
        if b.get("sfx") == "whoosh":
            sfx.setdefault("whoosh", []).append(f0)
        if b.get("sfx") in ("drama", "tension"):
            sfx.setdefault(b["sfx"], []).append(f0)
        if b.get("set") == "obra-dia":
            sfx.setdefault("obraDia", []).append([f0, f1])
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
    speakers = sorted({w for w, _, _ in voice_places} | {"junior", "ingenito"})
    mouth = {}
    for w in speakers:
        mouth[w] = [0.0] * n_frames
        mouth[w + "_shape"] = [0.0] * n_frames
    for who, clip, start in voice_places:
        place(voices, clip * 0.95, start)
        curve = mouth_curve(clip, fps)
        shape = mouth_shape(clip, fps)
        f0 = round(start * fps)
        for i, (v, sh) in enumerate(zip(curve, shape)):
            if f0 + i < n_frames:
                mouth[who][f0 + i] = round(float(v), 3)
                mouth[who + "_shape"][f0 + i] = round(float(sh), 2)

    # música con ducking bajo la voz y corte en los grillos
    music = lofi(total + 0.5)[:n]
    voice_env = lowpass(np.abs(voices), 0.0008)
    voice_env /= max(1e-6, voice_env.max())
    music *= 1 - 0.7 * np.clip(voice_env * 3, 0, 1)
    if "crickets" in sfx:
        a, b = (int(x / fps * SR) for x in sfx["crickets"])
        music[a:b] = 0
    for f_ in sfx.get("drama", []) + sfx.get("tension", []):
        a = int(f_ / fps * SR)
        music[a:a + int(1.6 * SR)] *= np.linspace(0, 1, int(1.6 * SR))[: len(music[a:a + int(1.6 * SR)])] ** 2

    fx = np.zeros(n)
    at = lambda f: f / fps  # noqa: E731
    if "mockupIn" in sfx:
        place(fx, whoosh() * 0.35, at(sfx["mockupIn"]) - 0.1)
        place(fx, cash() * 0.3, at(sfx["priceSlash"]))
        for i, c in enumerate(sfx["comments"]):
            place(fx, pop(800 + i * 150) * 0.35, at(c))
        mock_seg = next(s for s in segments if s.get("overlay") == "mockup")
        place(fx, whoosh(0.3) * 0.3, at(mock_seg["to"] - 6))
    if "runPop" in sfx:
        place(fx, pop(1200, 0.12) * 0.4, at(sfx["runPop"]))
        place(fx, click() * 0.5, at(sfx["runClick"]))
    if "crickets" in sfx:
        a, b = sfx["crickets"]
        place(fx, crickets(at(b - a)) * 0.12, at(a))
    if "instaIn" in sfx:
        place(fx, pop(700, 0.12) * 0.35, at(sfx["instaIn"]))
        place(fx, scratch() * 0.3, at(sfx["reveal"]))
    if "manualIn" in sfx:
        place(fx, whoosh(0.35) * 0.3, at(sfx["manualIn"]) - 0.1)
    for p_ in sfx["pings"]:
        place(fx, ping() * 0.3, at(p_))
    for a, b in sfx["typing"]:
        place(fx, typing(at(b - a)) * 0.25, at(a))
    for s_ in sfx["sent"]:
        place(fx, pop(1500, 0.08) * 0.3, at(s_))
    # entrada del chat
    for s in segments:
        if s.get("overlay") == "chat" and not any(p.get("overlay") == "chat" and p["to"] == s["from"] for p in segments):
            place(fx, whoosh(0.3) * 0.25, at(s["from"]) - 0.05)
    if "endIn" in sfx:
        place(fx, sting() * 0.25, at(sfx["endIn"]))
    for w_ in sfx.get("whoosh", []):
        place(fx, whoosh(0.5) * 0.35, at(w_))
    for d_ in sfx.get("drama", []):
        place(fx, drama() * 0.45, at(d_))
    for h_ in sfx.get("tension", []):
        place(fx, hit() * 0.5, at(h_))
    for a, b in sfx.get("obraDia", []):
        place(fx, obra_ambiente(at(b - a)) * 0.5, at(a))

    mix = voices * 0.9 + music + fx
    mix /= max(1.0, np.abs(mix).max() / 0.89)
    pcm = (mix * 32767).astype(np.int16)
    os.makedirs(os.path.join(ROOT, "public", ep), exist_ok=True)
    with wave.open(os.path.join(ROOT, "public", ep, "audio.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(np.stack([pcm, pcm], axis=1).tobytes())

    timeline = {
        "id": ep, "fps": fps, "durationInFrames": n_frames, "ingenito": g.get("ingenito", "robot"),
        "segments": segments, "lines": lines, "sfx": sfx, "chat": chat,
        "labels": g.get("labels", False), "manual": g.get("manual"),
    }
    out_dir = os.path.join(ROOT, "src", "episodios", ep)
    os.makedirs(out_dir, exist_ok=True)
    json.dump(timeline, open(os.path.join(out_dir, "timeline.json"), "w"), ensure_ascii=False, indent=1)
    json.dump(mouth, open(os.path.join(out_dir, "mouth.json"), "w"))
    print(f"{ep}: duración {total:.2f} s ({n_frames} fotogramas)")
    for s in segments:
        print(f"  {s['from']:4d}-{s['to']:4d}  {s['cam']:9s} {s.get('overlay', '')}")


if __name__ == "__main__":
    import sys

    main(sys.argv[1] if len(sys.argv) > 1 else "ep1")
