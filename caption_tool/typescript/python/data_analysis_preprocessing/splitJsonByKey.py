import json
import pandas as pd
import os

# 변수 설정

path = "C:\workplace\Kilab\dataset\output_data\combined_data.json" # combined_data.json
# 분할된 JSON 파일을 저장할 디렉토리
# 리액트의 public 폴더 > json 폴더 > splitJson 폴더 생성 후 해당 폴더로 설정
output_dir = 'C:\\workplace\\Kilab\\git\\caption_tool\\typescript\\front\\public\\json\\splitJson'


# ==================================================================================================

def split_json_by_keys(input_file, output_dir):
    # 입력 JSON 파일 로드
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 출력 디렉토리 생성 (존재하지 않는 경우)
    os.makedirs(output_dir, exist_ok=True)
    
    # 각 key에 대해 별도의 JSON 파일 생성
    num = 1
    for key in data:
        # 새로운 JSON 객체 생성
        new_json = {key: data[key]}
        
        # 파일명 생성
        output_file = os.path.join(output_dir, f'split_json_{num}.json')
        num += 1
        
        # JSON 파일 저장
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(new_json, f, ensure_ascii=False, indent=4)
            
    print(f"JSON 파일이 '{output_dir}' 디렉토리에 분할 저장되었습니다.")



if __name__ == "__main__":
    split_json_by_keys(path, output_dir)