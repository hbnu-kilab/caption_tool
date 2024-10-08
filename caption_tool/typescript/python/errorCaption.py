import json
import os
import random
import re
from tqdm import tqdm

# 명사 대체 목록 (예시)
noun_replacements = {
    "clock": "stopwatch",
    "tower": "skyscraper",
    "bridge": "tunnel",
    "river": "canal",
    "building": "structure",
    "sky": "atmosphere",
    "tree": "bush",
    "flag": "banner",
    # 더 많은 대체어를 추가할 수 있습니다.
}

def replace_noun(caption):
    words = caption.split()
    replaceable_words = [word for word in words if word.lower() in noun_replacements]

    if replaceable_words:
        word_to_replace = random.choice(replaceable_words)
        replacement = noun_replacements[word_to_replace.lower()]
        return re.sub(r'\b' + re.escape(word_to_replace) + r'\b', replacement, caption, flags=re.IGNORECASE)

    return caption

def process_file(input_filename, output_filename):
    with open(input_filename, 'r') as file:
        data = json.load(file)

    modified_captions = 0
    if isinstance(data.get("new_bounding_boxes"), list):
        for box in data["new_bounding_boxes"]:
            if isinstance(box, dict) and isinstance(box.get("captions"), list):
                for caption_item in box["captions"]:
                    if isinstance(caption_item, dict) and "caption" in caption_item and "errorCaption" in caption_item:
                        original_caption = caption_item["caption"]
                        error_caption = caption_item["errorCaption"][0] if isinstance(caption_item["errorCaption"], list) else caption_item["errorCaption"]

                        # errorCaption이 이미 caption과 다르다면 수정하지 않음
                        if error_caption != original_caption:
                            continue

                        new_error_caption = replace_noun(original_caption)
                        if new_error_caption != original_caption:
                            caption_item["errorCaption"] = [new_error_caption]
                            modified_captions += 1

    with open(output_filename, 'w') as file:
        json.dump(data, file, indent=2)

    return modified_captions

# 입력 및 출력 디렉토리 설정
input_directory = "/Users/kanghyeon/IdeaProjects/caption_tool/caption_tool/typescript/front/public/json/outputJson"  # 원본 파일이 있는 디렉토리
output_directory = "/Users/kanghyeon/IdeaProjects/caption_tool/caption_tool/typescript/front/public/json/modifiedOutputJson"  # 수정된 파일을 저장할 디렉토리

# 출력 디렉토리가 없으면 생성
if not os.path.exists(output_directory):
    os.makedirs(output_directory)

# 입력 디렉토리 내의 모든 output_n.json 파일 처리
json_files = [f for f in os.listdir(input_directory) if f.startswith("output_") and f.endswith(".json")]

print(f"총 {len(json_files)}개의 파일을 처리합니다.")

total_modified_captions = 0
total_captions = 0
for filename in tqdm(json_files, desc="파일 처리 중"):
    input_path = os.path.join(input_directory, filename)
    output_path = os.path.join(output_directory, filename)
    modified_captions = process_file(input_path, output_path)
    total_modified_captions += modified_captions

    # 총 캡션 수 계산
    with open(input_path, 'r') as file:
        data = json.load(file)
        if isinstance(data.get("new_bounding_boxes"), list):
            for box in data["new_bounding_boxes"]:
                if isinstance(box, dict) and isinstance(box.get("captions"), list):
                    total_captions += len(box["captions"])

    tqdm.write(f"{filename}: {modified_captions}개의 캡션 수정됨")

print(f"\n처리 완료. 총 {total_captions}개의 캡션 중 {total_modified_captions}개가 수정되었습니다.")
print(f"수정된 파일은 '{output_directory}' 폴더에 저장되었습니다.")