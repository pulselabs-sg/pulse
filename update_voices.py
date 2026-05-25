import re

with open('src/lib/dashboard-constants.ts', 'r', encoding='utf-8') as f:
    content = f.read()

voices_match = re.search(r'export const VOICES: Voice\[\] = \[(.*?)\];', content, re.DOTALL)
if not voices_match:
    print('Could not find VOICES array')
    exit(1)

voices_str = voices_match.group(1)
voice_objs = re.findall(r'\{(.*?)\}', voices_str)

new_voices = []
for obj_str in voice_objs:
    id_m = re.search(r"id:\s*'(.*?)'", obj_str)
    name_m = re.search(r"name:\s*'(.*?)'", obj_str)
    gender_m = re.search(r"gender:\s*'(.*?)'", obj_str)
    country_m = re.search(r"country:\s*'(.*?)'", obj_str)
    language_m = re.search(r"language:\s*'(.*?)'", obj_str)
    
    if id_m and name_m and gender_m and country_m and language_m:
        s = f"  {{ id: '{id_m.group(1)}', name: '{name_m.group(1)}', gender: '{gender_m.group(1)}', country: '{country_m.group(1)}', language: '{language_m.group(1)}', gradient: ['#27272a', '#52525b'] as [string, string] }},"
        new_voices.append(s)

new_voices_code = 'const VOICES_PRESET = [\n' + '\n'.join(new_voices) + '\n];'

with open('ipulse-mobile/src/app/audio-engine.tsx', 'r', encoding='utf-8') as f:
    ae_content = f.read()

start_str = "const VOICES_PRESET = ["
end_str = "];\n\nconst TRANSLATION_LANGUAGES"

start_idx = ae_content.find(start_str)
end_idx = ae_content.find(end_str)

if start_idx != -1 and end_idx != -1:
    new_content = ae_content[:start_idx] + new_voices_code + ae_content[end_idx + 2:]
    with open('ipulse-mobile/src/app/audio-engine.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Could not find boundaries")
