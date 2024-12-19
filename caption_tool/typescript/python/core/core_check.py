import json
import os
from multiprocessing import Pool, cpu_count

colors = [
    "red", "orange", "yellow", "lime", "green", "aqua", "blue", "navy"
]

# JSON 파일 이미지 번호 범위 설정
file_range = range(1, 1 + 2186)

# 경로 설정
base_path = "C:\\workplace\\Kilab\\etri\\dataset\\취합\\평가셋\\006_core 데이터 배포 버전" # 평가셋
# base_path = "C:\\workplace\\Kilab\\etri\\dataset\\취합\\학습셋\\006_core 배포 버전" # 학습셋


# 처리 함수
def process_file(i):
    file_path = os.path.join(base_path, f"core_{i}.json")
    
    if not os.path.exists(file_path):
        return None  # 파일이 없으면 None 반환
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        return f"파일 열때 오류: {i}"  # 오류가 발생하면 해당 메시지 반환

    top_level_id = next(iter(data.keys()), None)
    
    if not top_level_id:
        return f"이미지 Id를 찾을 수 없음: {i}"

    human_annotations = data.get(top_level_id, {}).get("relation_centric_regions", {})
    results = []
    
    for annotation in human_annotations:
        text = annotation.get("human_annotation", "").lower()
        
        contains_color = any(color in text for color in colors)
        contain_word = "boxes" in text or "box" in text
        contain_number = "1." in text or "2." in text or "3." in text
        
        if (contain_word and contains_color) or contain_number:
            results.append(f"{i}: '{annotation['human_annotation']}'")

    return results if results else None

if __name__ == "__main__":
    with Pool(cpu_count()) as pool:
        results = pool.map(process_file, file_range)
    
    # 결과 출력
    for result in results:
        if result:
            if isinstance(result, list):
                for line in result:
                    print(line)
            else:
                print(result)
