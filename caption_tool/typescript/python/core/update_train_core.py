import json
import pandas as pd
import os
from multiprocessing import Pool, cpu_count
from filelock import FileLock
import traceback

annotators = [
    ["[9628~9848]강유진", 9628, 221],
    ["[10733~10953]박현수", 10733, 221],
    ["[9186~9406]송채린", 9186, 221],
    ["[8744~8964]이경림", 8744, 221],
    ["[9849~10069]임미란", 9849, 221],
    ["[11175~11395]정준영", 11175, 221],
    ["[10954~11174]하태광", 10954, 221],
    ["[9407~9627]정재혁", 9407, 221],
    ["[10291~10511]이수인", 10291, 221],
]

def clean_human_annotation(human_annotation: str):
    striped_human_annotation = human_annotation.strip()
    if striped_human_annotation[:2] in {"1.", "2.", "3."}:
        return striped_human_annotation[2:].strip()
    return striped_human_annotation    

def process_file(args):
    annotator, i = args
    annotator_name, start_idx, _ = annotator
    file_path = f'C:\\workplace\\Kilab\\etri\\dataset\\취합\\학습셋\\005_core 작업자 최종 검수 버전\\{annotator_name}\\core_{i}.json'
    keyword_dict_path = "train_keyword_dict.json"
    
    if not os.path.exists(file_path):
        return f"파일 없음: {i}"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        new_data = {}
        VGID = list(data.keys())[0]
        
        # 파일 잠금을 적용하여 keyword_dict.json 파일을 안전하게 읽고 쓰기
        lock = FileLock(keyword_dict_path + ".lock")
        with lock:
            # 기존 JSON 파일을 읽어옵니다
            if not os.path.exists(keyword_dict_path):
                keyword_dict = {}
                with open(keyword_dict_path, 'w', encoding='utf-8') as json_file:
                    json.dump(keyword_dict, json_file, ensure_ascii=False, indent=4)

            with open(keyword_dict_path, 'r', encoding='utf-8') as json_file:
                keyword_dict = json.load(json_file)

            keywords = [synset for synset in list(data[VGID]["keywords"].keys())]
            new_keywords = [kw for kw in keywords if kw not in [synset for synset in list(keyword_dict.keys())]]
            
            if new_keywords:
                for new_keyword in new_keywords:
                    keyword_dict[new_keyword] = data[VGID]["keywords"][new_keyword]["synset"]

            if keywords:
                for keyword in keywords:
                    # 조건에 맞는 synset 값이 있는지 확인
                    id_key_existed = keyword in list(keyword_dict.keys())
                    if id_key_existed:  # 값이 존재하는 경우
                        ori_synonyms = keyword_dict[keyword]
                        if isinstance(ori_synonyms, list) and id_key_existed:
                            new_synonyms = list(set(ori_synonyms + data[VGID]["keywords"][keyword]["synset"]))
                            # JSON 파일 내 해당 항목 업데이트
                            keyword_dict[keyword] = new_synonyms
                        else:
                            new_synonyms = list(set(data[VGID]["keywords"][keyword]["synset"]))
                            keyword_dict[keyword] = new_synonyms
                    else:
                        # 조건에 맞는 값이 없으면 새로 할당
                        new_synonyms = list(set(data[VGID]["keywords"][keyword]["synset"]))
                        keyword_dict[keyword] = new_synonyms

            # 변경된 keyword_dict를 다시 저장
            with open(keyword_dict_path, 'w', encoding='utf-8') as json_file:
                json.dump(keyword_dict, json_file, ensure_ascii=False, indent=4)

        # 새 JSON 파일로 저장
        new_data[VGID] = {
            "regions": data[VGID]["regions"],
            "narratives": data[VGID]["narratives"],
            "keywords": {},
            "relation_centric_regions": [
                {
                    "human_annotation": clean_human_annotation(human_annotation["human_annotation"]),
                    "region_ids": human_annotation["box_ids"],
                }
                for human_annotation in data[VGID]["relation_centric_regions"]["human_annotations"]
            ],
        }
        for kw in keywords:
            new_data[VGID]["keywords"][kw] = {
                "synonyms": data[VGID]["keywords"][kw]["synset"],
                "nearest_ancestor": data[VGID]["keywords"][kw]["nearest_ancestor"],
                "supersense": data[VGID]["keywords"][kw]["supersense"],
                "counterfactual": data[VGID]["keywords"][kw]["counterfactual"]
            }

        # 새 JSON 파일로 저장
        new_file_path = f'C:\\workplace\\Kilab\\etri\\dataset\\취합\\학습셋\\006_core 배포 버전\\core_{i}.json'
        with open(new_file_path, 'w', encoding='utf-8') as make_file:
            json.dump(new_data, make_file, ensure_ascii=False, indent='\t')

        return f"처리 완료: {i}"
    except Exception as e:
        return f"파일 열때 오류: {i}, 오류: {e, traceback.format_exc()}"




if __name__ == "__main__":
    # 작업자와 파일 범위를 병렬로 처리할 입력 생성
    tasks = [
        (annotator, i)
        for annotator in annotators
        for i in range(annotator[1], annotator[1] + annotator[2])
    ]
    
    # 병렬 처리
    with Pool(cpu_count()) as pool:
        results = pool.map(process_file, tasks)
    
    # 결과 출력
    for result in results:
        print(result)
