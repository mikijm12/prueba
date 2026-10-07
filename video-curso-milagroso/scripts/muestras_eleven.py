"""Muestras de voces ElevenLabs (v3) por personaje, para elegir el casting.

La clave la agrega el proxy del entorno (secreto de red), por eso no aparece aquí.
Uso: python3 -I scripts/muestras_eleven.py out/muestras
"""
import json
import os
import subprocess
import sys
import urllib.request

OUT = sys.argv[1]
MODEL = "eleven_v3"

CASTING = {
    "ingenito": {
        "line": "[sarcastic] ¿Y de paso le echamos agua bendita, maestro? [laughs] Porque esa losa va a necesitar milagro.",
        "voices": [("Jehison (peruano)", "eklUXgdI2kEgVcRbATIu"), ("Alejandro (animado)", "YKUjKbMlejgvkOZlnnvt"), ("Antonio (latino canchero)", "htFfPSZGJwjBv1CL0aMD")],
    },
    "practicante": {
        "line": "[nervous] Sí, claro... la E... la E de... [gulps] ¿Excel? [awkward laugh] Y Word también, intermedio.",
        "voices": [("Ezio (peruano joven)", "DCO8S7iTrXbD63RcYnFe"), ("Juan (joven amigable)", "VvYiNBPylZtUh8Bf6u8l"), ("JC (joven enérgico)", "4XUsiqPDK4UACIM2BILe")],
    },
    "teo": {
        "line": "[relaxed] Tranquilo, inge. [chuckles] Mojadito se seca mejor, como el cebiche. Toda la vida lo hemos hecho así, pe.",
        "voices": [("El Faraón (mayor)", "8mBRP99B2Ng2QwsJMFQl"), ("Juan Carlos (señor relajado)", "YExhVa4bZONzeingloMX"), ("Gerardo (canchero)", "NDcVpQJv7Naa7ZKrqtEk")],
    },
    "supervisora": {
        "line": "[serious] Buenos días. [pause] ¿Y el cuaderno de obra? [annoyed] No me diga que se lo comió el perro.",
        "voices": [("Elena (peruana)", "dyTONAae6PhdRb3hMKPM"), ("Karla (peruana joven)", "saqk76H0L3GCnuHtLDw6"), ("Valeria (profesional)", "c1TlpfzIeILTa8AyEP1e")],
    },
}


def tts(text, voice_id, path):
    body = json.dumps({"text": text, "model_id": MODEL, "voice_settings": {"stability": 0.5}}).encode()
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        data=body,
        headers={"Content-Type": "application/json", "Accept": "audio/mpeg"},
    )
    with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as f:
        f.write(r.read())


def beep(path):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "sine=frequency=880:duration=0.25", "-af", "volume=0.25",
                    "-ar", "44100", "-ac", "1", path], check=True)


os.makedirs(OUT, exist_ok=True)
beep(os.path.join(OUT, "_beep.mp3"))
for who, cfg in CASTING.items():
    parts = []
    for i, (name, vid) in enumerate(cfg["voices"], 1):
        p = os.path.join(OUT, f"{who}_{i}.mp3")
        tts(cfg["line"], vid, p)
        parts += [os.path.join(OUT, "_beep.mp3"), p]
        print(who, i, name)
    lst = os.path.join(OUT, f"{who}.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{os.path.abspath(x)}'\n" for x in parts)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-ar", "44100", "-ac", "1",
                    "-c:a", "libmp3lame", "-b:a", "128k", os.path.join(OUT, f"muestras_{who}.mp3")], check=True)
