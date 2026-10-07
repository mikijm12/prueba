# Traspaso: estado del proyecto y próximos pasos

## Estado
- Motor: Remotion + Three.js (`src/`), audio y tiempos con `scripts/sonido.py <ep>` a partir de `episodios/<ep>/guion.json`.
- Episodios renderizados: ep1 (CursoMilagroso, robot), ep2 (LaConsultita), ep3 (ConElTarrajeo: oficina, obra de día, Don Teo y supervisora).
- Reglas de cámara, tono y estructura: `episodios/REGLAS.md`.
- Banco de 12 guiones (doc compartido): https://claude.ai/code/artifact/ce2bd0c5-bc1b-40c1-8625-f536658dd545
  Aprobados para producir primero: #1 "Mojadito se seca mejor", #7 "La rampa tobogán", #5 "Domino la norma E… Excel".
- Voces actuales: edge-tts (es-PE-AlexNeural / es-PE-CamilaNeural). El usuario las encuentra planas y "serias".

## Siguiente: voces con ElevenLabs
El usuario agregó en el entorno la variable `ELEVENLABS_API_KEY` y el dominio `api.elevenlabs.io`.
1. Comprobar acceso: `curl -sS -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices | head`.
2. Agregar en `scripts/sonido.py` un motor `VOCES=eleven` (además de edge y kokoro) que use el modelo más expresivo
   disponible en la cuenta (v3 si existe, con etiquetas de actuación como [laughs], [sarcastic], [shouting]),
   con voz por personaje configurable en `guion.json` → "voces".
3. Enviar al usuario muestras de 3-4 voces latinas por personaje (Ingenito, practicante, Don Teo, supervisora) para que elija.
4. Regenerar el audio del ep3 con las voces elegidas y comparar.
5. Producir los guiones #1, #7 y #5 del banco respetando REGLAS.md (planos generales con todos en cuadro; zoom solo en remates).
