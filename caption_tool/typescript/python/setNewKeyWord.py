# - 각 단어의 1번 sense를 대표단어로 설정
#     - 근거: cat의 경우, sense 1의 synset에 true_cat이라는 단어가 포함
# - 특정 키와 다른 키가 서로의 synset 안에 있으면 뒤에 나오는 키를 삭제

# ===========================================================================================================================================

# 갤럭시북 프로1 기준 실행시간: 17m~18m
import json
# pip install textBlob 
from textblob import Word # 복수형을 단수형으로 바꾸기 위함 
# python.exe -m pip install --upgrade pip (업그레이드 먼저 해주기)
# pip install nltk
import nltk
from nltk.corpus import words
from nltk.corpus import wordnet

# NLTK words 데이터셋 다운로드
nltk.download('words')
nltk.download('wordnet')

# words 데이터셋에서 단어 가져오기
word_list = words.words()

# ===========================================================================================================================================

# 's'로 끝나는 명사 필터링
def is_noun(word):
    synsets = wordnet.synsets(word)
    if not synsets:
        return False
    # Check if the first synset is a noun
    return synsets[0].pos() == 'n'

# json 읽는 함수
def read_file(file_num):
    # split JSON 파일 경로
    file_path = f'C:\\workplace\\Kilab\\git\\caption_tool\\typescript\\front\\public\\json\\splitJson\\split_json_{file_num}.json'
    # JSON 파일 읽기
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)

    if data is not None:
        key = list(data.keys())[0]
        return data[key]
    
    return None

# (웹에 떠있는) 키워드 셋 만드는 함수
def set_keywords(data): # read_file로 읽어온 json 파일 삽입
    keywords = [] # 키워드 리스트
    try:
        keywords = list(data['new_objects'].keys()) # 탐지된 오브젝트를 키워드로 가져오기
        for box in data['new_same_regions']: # 바운딩 박스의 entity를 키워드로 가져오기
            keywords = keywords + list(box['entity'].keys())
        
        s_ending_nouns = [word for word in word_list if word.endswith('s') and is_noun(word)] # "S" 로 끝나는 단어사전 만들기
        singularized = [] # 단수형 단어 담아둘 리스트(임시)
        # 복수형을 단수형으로 변환
        for keyword in keywords:
            if keyword not in s_ending_nouns: # "S" 로 끝나는 단어가 아니라면
                singularized.append(Word(keyword).singularize())
            else: # S로 끝나는 단어라면
                singularized.append(keyword)
                
        keywords = singularized # 키워드 리스트를 단수형만 있는 리스트값으로 대체
    except:
        pass
    finally:
        keywords = list(set(keywords)) # 중복 제거
        return keywords

# unique beginner 리스트
# 동의어 집합때문에 41개로 늘어남
unq_beg = ["act", "action", "activity", "food", "possession", "animal", "fauna", "location", "place", "process" ,
"artifact", "motive", "quantity", "amount", "attribute", "property", "group", "collection", "relation", "body", 
"corpus", "natural", "object", 'shape', "cognition", "knowledge", "natural", "phenomenon", "state", "condition", "communication", 
"person", "human_being", "substance", "event", "happening", "plant", "flora", "time", "feeling", "emotion"]

# 동의어 집합 구하기
def get_synonyms(word):
    synonyms = []

    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.append(lemma.name())

    # 중복 제거를 위해 집합으로 변환 후 리스트로 다시 변환
    synonyms = list(set(synonyms))
    return synonyms

def get_hierarchy_for_search(synset, level=0): # search_hierarchy에 삽입될 함수
    hierarchy = [(synset, level)] # 계층 구조 설정
    for hypernym in synset.hypernyms(): # for 상위어 in 상위어 리스트
        hierarchy.extend(get_hierarchy_for_search(hypernym, level + 1)) # 데이터 추가
    return hierarchy

def search_hierarchy(word): # 계층 검색을 위함
    synsets = wordnet.synsets(word) # 해당 단어가 워드넷에 등록이 되어있는지 확인
    
    if not synsets: # 등록 되지 않았다면
        # print(f"No synsets found for {word}")
        return [] # 빈 리스트 return
    
     
    hypernym_hierarchies = [get_hierarchy_for_search(synset) for synset in synsets] # 계층 가져오기
    
    # 가장 depth가 깊은 계층 선정
    # longest_sublist = max(hypernym_hierarchies, key=len) # 가장 긴 하위 리스트 찾기
    # hypernym_hierarchies[:] = longest_sublist # 원본 리스트를 가장 긴 하위 리스트로 대체
    
    first_sublist = hypernym_hierarchies[0] # 첫번째 하위 리스트 찾기
    hypernym_hierarchies[:] = first_sublist # 원본 리스트를 첫번째 하위 리스트로 대체
    
    # hypernym_hierarchy = [synset.name() for synset, level in hypernym_hierarchies]
    hypernym_hierarchy = []
    
    for synset, level in hypernym_hierarchies:
        if (level == 1):
            hypernym_hierarchy.append(synset.name())
        elif (synset.name().split(".")[0] in unq_beg):
            hypernym_hierarchy.append(synset.name())
            if len(hypernym_hierarchy) == 1: # unique beginner가 nearest ancestor라면
                hypernym_hierarchy.append(synset.name())
            break
    
    return hypernym_hierarchy

# json 형태로 만들기
def keywords_to_json(file_num):
    keywords = set_keywords(read_file(file_num))
    result = [
        {
            keyword: {
                "synset" : get_synonyms(keyword),
                "nearest_ancestor": search_hierarchy(keyword)[0] if len(search_hierarchy(keyword)) > 0 else "", # nearest_ancestor를 키값으로 함
                "unique_beginner": search_hierarchy(keyword)[1] if len(search_hierarchy(keyword)) > 1 else "" # unique_beginner를 키값으로 함
            }
        }
        for keyword in keywords
    ]
    
    final_result = []
    seen_keys = set()
    seen_criteria = set()
    
    try: # 1063번에선 이상이 생김ㅠㅠ
        for d in result:
            key_value = list(d.keys())[0]
            criterion_values = set(d[key_value]['synset'])
            
            if key_value not in seen_criteria and not criterion_values & seen_keys:
                final_result.append(d)
                seen_keys.add(key_value)
                seen_criteria.update(criterion_values)
    
        return final_result
    except:
        return result

# 추가 + 저장하기 위한 add_to_json 함수 만들기
# add_to_json에 내장될 파일 읽어오는 함수
def read_json(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            data = json.load(file)
    except FileNotFoundError:
        data = {}  # 파일이 없으면 빈 리스트로 초기화
    return data

# 파일 작성하는 함수
def write_json(file_path, data):
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, ensure_ascii=False, indent=4)

# 통합 함수
def add_to_json(file_num, new_data):
    # 기존 데이터 읽기
    # split JSON 파일 경로
    file_path = f'C:\\workplace\\Kilab\\git\\caption_tool\\typescript\\front\\public\\json\\splitJson\\split_json_{file_num}.json'
    data = read_json(file_path)
    
    # 새로운 데이터 추가
    data["new_keywords"] = new_data
    print(file_num)
    # 수정된 데이터 저장
    write_json(file_path, data)

if __name__ == "__main__":
    [add_to_json(i,  keywords_to_json(i)) for i in range(1, 2187)] # 전체 실행