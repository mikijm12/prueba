# Traspaso: estado del proyecto y próximos pasos

## Estado
- Motor: Remotion + Three.js (`src/`), audio y tiempos con `scripts/sonido.py <ep>` a partir de `episodios/<ep>/guion.json`.
- Episodios renderizados: ep1 (CursoMilagroso, robot), ep2 (LaConsultita), ep3 (ConElTarrajeo: oficina, obra de día, Don Teo y supervisora).
- Reglas de cámara, tono y estructura: `episodios/REGLAS.md`.
- Banco de 12 guiones (doc compartido): https://claude.ai/code/artifact/ce2bd0c5-bc1b-40c1-8625-f536658dd545
  Aprobados para producir primero: #1 "Mojadito se seca mejor", #7 "La rampa tobogán", #5 "Domino la norma E… Excel".
- Voces actuales: edge-tts (es-PE-AlexNeural / es-PE-CamilaNeural). El usuario las encuentra planas y "serias".

## Siguiente: voces con ElevenLabs
El usuario guardó su clave como **secreto de red** del entorno para `api.elevenlabs.io` (encabezado `xi-api-key`):
el proxy la inyecta solo; la sesión no ve la clave ni hay variable de entorno. Dominio permitido: `api.elevenlabs.io`.
1. Comprobar acceso sin clave en el código: `curl -sS https://api.elevenlabs.io/v1/user/subscription | head -c 400`
   (y `.../v1/voices`). Si da 401, revisar con el usuario el nombre del encabezado del secreto.
2. Agregar en `scripts/sonido.py` un motor `VOCES=eleven` (sin poner la clave en el código; el proxy la agrega) (además de edge y kokoro) que use el modelo más expresivo
   disponible en la cuenta (v3 si existe, con etiquetas de actuación como [laughs], [sarcastic], [shouting]),
   con voz por personaje configurable en `guion.json` → "voces".
3. Enviar al usuario muestras de 3-4 voces latinas por personaje (Ingenito, practicante, Don Teo, supervisora) para que elija.
4. Regenerar el audio del ep3 con las voces elegidas y comparar.
5. Producir los guiones #1, #7 y #5 del banco respetando REGLAS.md (planos generales con todos en cuadro; zoom solo en remates).

## Actualización (voces elegidas)
ElevenLabs ya funciona en la sesión original (secreto de red). Casting aprobado por el usuario (modelo eleven_v3, +12 % de velocidad):
- Ingenito: Thorthugo `WOY6pnQ1WCg0mrOZ54lM`
- Practicante: El Nero `ljWLDJb7OMkYo3VM9z8g`
- Don Teo: Juan Carlos `YExhVa4bZONzeingloMX`
- Supervisora: Emma `tbfu7H6JPPlpF9clW89V`
Las frases generadas se guardan en `voices/cache/` para no volver a gastar créditos.
Ep4 = guion #1 "Mojadito se seca mejor" (`episodios/ep4/guion.json`, composición MojaditoSeSecaMejor).
