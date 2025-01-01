import re
import json
from collections import Counter
import traceback
import nltk
from nltk.corpus import wordnet as wn
import wordninja
from spellchecker import SpellChecker
from sentence_transformers import SentenceTransformer, util
import torch
import multiprocessing as mp
from tqdm import tqdm
import os
from functools import partial
import logging
import sys
from contextlib import contextmanager
import psutil
import time
import gc

def remove_duplicates_preserve_order(lst):
    """
    @description
    리스트 순서 유지하면서 중복제거

    """
    seen = set()
    result = []
    for item in lst:
        if item not in seen:
            result.append(item)
            seen.add(item)
    return result


def filter_prepositions_and_articles(word_list):
    """
    @description
    리스트 내 단어에서 전치사 및 관사 제거
    find_diff_and_compound에서 사용

    """
    prepositions = {
        "in", "on", "at", "by", "with", "within", "about",
        "against", "between", "into", "through", "during",
        "before", "after", "above", "below", "to", "from", "up",
        "down", "for", "over", "under", "again", "further", "off", "near",
    }
    articles = {"a", "an", "the"}

    # 각 구에서 전치사 및 관사 제거
    filtered_phrases = []
    for phrase in word_list:
        words = phrase.split()  # 단어로 분리

        if words and words[0].lower() in prepositions:  # 첫 단어가 전치사면
            words = words[1:]  # 전치사 제거

        filtered_words = [word for word in words if word not in articles]
        filtered_phrases.append(" ".join(filtered_words))

    return filtered_phrases


def find_diff_and_compound(correct, error):
    """
    @description
    correct, error caption을 비교하여 다른 부분 각각 추출(복합명사 살려서)
    correct, error 순으로 반환

    """
    # Step 1: 문장을 단어 리스트로 분리 (공백 및 구두점 처리)
    error_words = re.findall(r"\w+", error.lower())  # 문장1의 단어 목록 (소문자 처리)
    correct_words = re.findall(r"\w+", correct.lower())  # 문장2의 단어 목록 (소문자 처리)

    # Step 2: 겹치는 단어 제거
    # 리스트의 요소 개수를 세기
    counter_error_words = Counter(error_words)
    counter_correct_words = Counter(correct_words)
    # 겹치는 단어 목록
    common_words = counter_error_words & counter_correct_words
    # 공통 단어를 제외한 error_words의 고유 단어들
    unique_error_words = list((counter_error_words - common_words).elements())
    # 공통 단어를 제외한 correct_words의 고유 단어들
    unique_correct_words = list((counter_correct_words - common_words).elements())

    # Step 3: 겹치지 않는 단어들 중에서 문장에서 붙어 있는 단어 찾기
    def find_compound_nouns(words, original_sentence):
        """복합 명사 찾기"""
        compounds = []
        i = 0
        while i < len(words):
            # 복합 명사 조합을 체크
            found_compound = False
            for j in range(len(words), 0, -1):  # len(words)개까지 조합 가능하도록
                if i + j <= len(words):
                    compound_candidate = " ".join(words[i: i + j])
                    if compound_candidate in original_sentence:
                        compounds.append(compound_candidate)
                        i += j  # 조합한 단어 개수만큼 인덱스 증가
                        found_compound = True
                        break
            if not found_compound:  # 복합 명사가 아닐 경우
                compounds.append(words[i])
                i += 1
        return compounds

    # 문장1과 문장2에서 각각 복합 명사 추출
    human_annotation = find_compound_nouns(unique_error_words, error.lower())
    correct_keyword = find_compound_nouns(unique_correct_words, correct.lower())
    filtered_human_annotation = filter_prepositions_and_articles(human_annotation)
    filtered_correct_keyword = filter_prepositions_and_articles(correct_keyword)

    # 최종 차이점 리스트
    return remove_duplicates_preserve_order(filtered_correct_keyword), remove_duplicates_preserve_order(filtered_human_annotation)


# -----------------------------------------------------------------------------------------------
# 딕셔너리 관련
def remove_duplicates(dict_list):
    """
    @description
    딕셔너리 리스트 중복 제거

    """
    seen = set()
    unique_dicts = []
    try:
        for d in dict_list:
            json_str = json.dumps(d, sort_keys=True)  # JSON 문자열로 변환
            if json_str not in seen:
                seen.add(json_str)
                unique_dicts.append(d)
    except:
        pass
    return unique_dicts


def merge_dicts(*dicts):
    """
    @description
    딕셔너리 키값 기준으로 value 합치기
    """
    merged_dict = {}
    for dictionary in dicts:
        for key, value in dictionary.items():
            if key in merged_dict:
                merged_dict[key].extend(value)
            else:
                merged_dict[key] = value
    return merged_dict

# -----------------------------------------------------------------------------------------------
# 키워드 관련

# 상위 계층 구하기
def get_hypernyms_for_search(synset, level=0, relation="hypernyms"):
    """
    @description
    워드넷 synset 형태의 str 정보 넣어 상위계층 구하기,
    ex) 'dog.n.01'

    계층이 여러개로 나뉠 때가 있음 => sense 01 우선
    """
    hierarchy = [(synset, level)]

    if relation == "hypernyms":
        if synset.hypernyms() != []:
            for hypernym in synset.hypernyms():
                hierarchy.extend(
                    get_hypernyms_for_search(hypernym, level + 1, relation)
                )
    return hierarchy


def split_hypernyms_hierarchy_by_level_one(word):
    """
    @description
    계층 1을 기준으로 리스트 분할
    """

    hierarchy = get_hypernyms_for_search(word)
    split_list = []
    current_sublist = []

    for item in hierarchy:
        synset, level = item

        # level이 1일 때마다 새 sublist를 시작
        if level == 0:
            pass
        elif level == 1:
            if current_sublist:  # 현재 서브리스트가 비어있지 않으면 추가
                split_list.append(current_sublist)
            current_sublist = [item]  # 현재 item을 새로운 서브리스트로 시작
        else:
            current_sublist.append(item)  # level이 1이 아닐 경우 현재 서브리스트에 추가

    # 마지막 서브리스트 추가
    if current_sublist:
        split_list.append(current_sublist)

    return split_list


def get_supersense_nearest_ancestor_synonyms(word):
    """
    @description
    synsets name을 넣어서 supersense, nearest_ancestor, synonyms 반환하는 함수
    """
    # synset 형태로 만들기
    synset = wn.synset(word)

    # 동의어 synset 리스트 구하기
    # lemmas = 워드넷 기반 특정 단어의 유의어 가져오는 함수
    synonyms = [lemma.name().replace("_", " ") for lemma in synset.lemmas()]

    # 상위어 가져오기
    nearest_ancestor = ""  # 가장 가까운 상위노드
    supersense = ""  # 정의

    # 상위 노드가 존재한다면
    hypernym_hierarchy = split_hypernyms_hierarchy_by_level_one(synset)
    if hypernym_hierarchy != []:
        nearest_ancestor = max(hypernym_hierarchy, key=len)[0][0]
        nearest_ancestor = re.findall(r"'([^']*)'", str(nearest_ancestor))[0]

    supersense = synset.lexname()

    return supersense, nearest_ancestor, synonyms


def return_true_if_keyword_not_found(correct, errors, data, keywords):
    """
    @description
    워드넷과 게놈 정보에서 키워드 검색이 가능한 경우 => 키워드 정보에 추가 및 False 반환
    검색이 불가한 경우 True 반환

    **he, she 등은 사람에게 주로 쓰이나 사람이 아닌 것들을 지칭하는 경우도 있으므로 unprocessed 키워드로 처리**
    """
    if correct.strip().lower() in ["he", "she", "her", "his", "him"]:
        return True

    clean_word = correct.strip().replace(" ", "_")
    genome_objects = []
    key_genome_objects = []

    # genome 데이터에서 객체 정보 추출
    for obj in data[list(data.keys())[0]]["objects"]:
        genome_objects.append(obj["names"][0])
        if obj["synsets"] != []:
            key_genome_objects.append(obj["synsets"][0])
        else:
            key_genome_objects.append("")
        if obj["attributes"] != []:
            for attribute in obj["attributes"]:
                genome_objects.append(f"{attribute} {obj['names'][0]}")
                if obj["synsets"] != []:
                    key_genome_objects.append(obj["synsets"][0])
                else:
                    key_genome_objects.append("")

    # genome에서 먼저 검색
    try:
        correct = correct.lower().strip()
        idx = genome_objects.index(correct)
        synsets = [wn.synset(key_genome_objects[idx])]
    except:
        # 워드넷에서 명사 synset 검색
        synsets = wn.synsets(clean_word, pos=wn.NOUN)  # 명사 synset만 가져오기
        if synsets == []:
            # 띄어쓰기 교정 시도
            spell = SpellChecker()
            if "_" in clean_word:
                unsplit_word = clean_word.replace("_", " ")

                if synsets == [] and isinstance(unsplit_word, (str, bytes)):
                    synsets = wn.synsets(unsplit_word, pos=wn.NOUN)
                    split_words = wordninja.split(unsplit_word)
                    corrected_words = []
                    for word in split_words:
                        if spell.correction(word) is not None:
                            corrected_words.append(spell.correction(word))
                        else:
                            corrected_words.append(word)
                    clean_word = '_'.join(corrected_words)
                    synsets = wn.synsets(clean_word, pos=wn.NOUN)
            else:
                if len(clean_word) > 1:
                    split_words = wordninja.split(clean_word)
                    corrected_words = []
                    for word in split_words:
                        if spell.correction(word) is not None:
                            corrected_words.append(spell.correction(word))
                        else:
                            corrected_words.append(word)
                    clean_word = '_'.join(corrected_words)
                    synsets = wn.synsets(clean_word, pos=wn.NOUN)

    # 검색 결과 처리, 검색이 되는 경우
    if len(synsets) == 1:
        # 단일 synset 처리
        synsets_name = synsets[0].name()
        supersense, nearest_ancestor, synonyms = get_supersense_nearest_ancestor_synonyms(synsets_name)
        counterfactual = [
            {"human_annotation": error, "candidate": []} for error in errors
        ]

        result = {
            "synset": synonyms,
            "nearest_ancestor": nearest_ancestor,
            "supersense": supersense,
            "counterfactual": counterfactual,
        }

        if synsets_name not in keywords:
            keywords[synsets_name] = result
        else:
            if correct not in keywords[synsets_name]["synset"]:
                keywords[synsets_name]["synset"].append(correct)
            keywords[synsets_name]["counterfactual"] = remove_duplicates(
                keywords[synsets_name]["counterfactual"] + counterfactual
            )

        return False
    # 검색 결과가 여러개일 때
    elif len(synsets) > 1:
        # 검색 된 결과 리스트로 뽑기
        # 여러 synset 중 genome에 있는 것 우선 선택
        synsets_names = [synset.name() for synset in synsets]
        # genome 데이터 상에 있는 오브젝트 리스트로 뽑기
        genome_synsets = list(
            set(
                [
                    obj["synsets"][0]
                    for obj in data[list(data.keys())[0]]["objects"]
                    if obj["synsets"] != []
                ]
            )
        )
        # 겹치는게 있는지 확인
        candidate_synsets_names = [
            synsets_name
            for synsets_name in synsets_names
            if synsets_name in genome_synsets
        ]

        if len(candidate_synsets_names) > 1:
            synsets_name = candidate_synsets_names[0]
        else:
            synsets_name = synsets_names[0]

        # 선택된 synset 처리
        supersense, nearest_ancestor, synonyms = get_supersense_nearest_ancestor_synonyms(synsets_name)
        counterfactual = [
            {"human_annotation": error, "candidate": []} for error in errors
        ]

        result = {
            "synset": synonyms,
            "nearest_ancestor": nearest_ancestor,
            "supersense": supersense,
            "counterfactual": counterfactual,
        }

        if synsets_name not in keywords:
            keywords[synsets_name] = result
        else:
            if correct not in keywords[synsets_name]["synset"]:
                keywords[synsets_name]["synset"].append(correct)
            keywords[synsets_name]["counterfactual"] = remove_duplicates(
                keywords[synsets_name]["counterfactual"] + counterfactual
            )

        return False

    return True


# -----------------------------------------------------------------------------------------------
# 전역 변수 선언
model = None

def init_worker():
    """멀티프로세싱 워커 초기화 함수: SentenceTransformer 모델 로드"""
    global model
    device = torch.device("cpu")  # GPU 대신 CPU 사용
    model = SentenceTransformer("paraphrase-MiniLM-L6-v2", device=device)
    logging.info(f"Model loaded in worker {mp.current_process().name}")


def get_similar_sentences(cap):
    """
    @description
    리스트 내 문장간 유사도 확인하여 0.8 이상 유사한 문장들을 반환하는 함수
    **맨 마지막 문장을 기준으로 함**
    """
    global model
    if model is None:
        logging.warning("Model not initialized in get_similar_sentences.")
        return []

    # 더 작은 배치로 처리
    batch_size = 32
    embeddings = []
    for i in range(0, len(cap), batch_size):
        batch = cap[i:i + batch_size]
        batch_embeddings = model.encode(batch, convert_to_tensor=True, device=model.device)
        embeddings.append(batch_embeddings)

    # 전체 임베딩 합치기
    embeddings = torch.cat(embeddings)

    # 코사인 유사도 계산 (여러 문장 간)
    similarity_matrix = util.pytorch_cos_sim(embeddings, embeddings)
    last_row = [
        float(similarity.item()) for similarity in similarity_matrix[-1]
    ]  # 마지막 행을 리스트로 변환
    result = [
        cap[idx] for idx, similarity in enumerate(last_row) if float(similarity) > 0.80
    ]
    result = list(set(result))

    return result

# -----------------------------------------------------------------------------------------------

def generate_core_data(file_num, output_dir, core_dir):
    """
    @description
    주어진 경로에서 JSON 파일을 불러와 core 데이터 추출하는 함수

    """

    # 박스 색상 리스트
    li_color = [
        "red", "orange", "yellow", "lime", "green", "aqua", "blue", "navy",
        "fuchsia", "white", "tomato", "black", "peru", "pink", "salmon", "wheat",
        "violet", "khaki", "purple", "plum", "firebrick", "tan", "coral", "brown",
        "gray", "hotpink", "gold", "teal",
    ]

    try:
        # 로깅: 함수 시작 및 인자 확인
        logging.info(f"Starting generate_core_data for file {file_num}")
        logging.info(f"Output directory: {output_dir}")
        logging.info(f"Core directory: {core_dir}")

        # 파일 가져오기
        file_path = os.path.join(output_dir, f"output_{file_num}.json")
        if not os.path.exists(file_path):
            logging.error(f"File not found: {file_path}")
            return file_num  # 실패로 처리

        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
        logging.info(f"File {file_num} loaded successfully.")
        # -----------------------------------------------------------------------------------------------
        # 가져온 데이터에서 추출할 것들
        # 기본 데이터 추출
        genome_image_num = list(data.keys())[0]
        new_all_regions = data[genome_image_num]["new_all_regions"]

        # narratives 추출
        try:
            narratives = data["new_localizednarratives"]
        except KeyError:
            narratives = " ".join([localizednarrative['caption'] for localizednarrative in
                                   data[genome_image_num]['image_data']['localizednarratives']])
        # -----------------------------------------------------------------------------------------------
        # 박스 정보 정렬 (캡션 수 기준 내림차순)
        sorted_boxes = sorted(
            data["new_bounding_boxes"],
            key=lambda x: len(x["captions"]),
            reverse=True
        )
        # 전체 박스 개수
        logging.info(f"Number of boxes in file {file_num}: {len(sorted_boxes)}")
        # -----------------------------------------------------------------------------------------------

        # 키워드 처리를 위한 페어리스트
        # 작업자들이 만든 키워드 페어 (correct-error-correct_caption) 정보 리스트
        correct_error_keyword_pairs = []  # 작업자 생성 키워드 페어
        # genome  caption에서 추출할 수 있는 키워드 페어 (entity_name-synset_name-caption) 정보 리스트
        genome_keyword_pairs = []  # genome 캡션 키워드 페어

        # -----------------------------------------------------------------------------------------------
        # 박스별 구조 변경
        new_boxes = []

        for idx, box in enumerate(sorted_boxes):
            # object_list에 빈 리스트 추가

            # 새로운 형태의 region 딕셔너리
            new_box = {
                "id": f"{str(genome_image_num)}_{str(idx)}",  # 박스별 고유 아이디
                "color": li_color[idx % len(li_color)],  # 박스 순서별 색
                "x": box["x"],
                "y": box["y"],
                "width": box["width"],
                "height": box["height"],
                "captions": [],  # 캡션
                "object_ids": [],  # 캡션별 물체
                "relationships": []  # 캡션 내 관계
            }

            # 캡션, 캡션 별 물체, 캡션 내 관계
            if box["captions"]: # 박스에 캡션이 있다면
                for captions in box["captions"]:
                    # 캡션 가져오기
                    caption = captions.get("caption", "")

                    # 에러 캡션 추출 (없을 경우 빈 문자열)
                    counterfactual_caption = captions.get("errorCaption", [""])[0]

                    # new_box에 넣어주기
                    new_box["captions"].append({
                        "caption": caption,
                        "counterfactual_caption": counterfactual_caption,
                    })

                    # 캡션별 error-correct 키워드쌍 가져오기
                    filtered_correct_keyword, filtered_human_annotation = find_diff_and_compound(
                        caption, counterfactual_caption
                    )

                    # 에러 키워드가 있는 경우 페어 정보 저장
                    if filtered_human_annotation:
                        correct_error_keyword_pairs.append({
                            "correct": list(set(filtered_correct_keyword)),
                            "error": list(set(filtered_human_annotation)),
                            "caption": caption.lower().strip()
                        })

                    # 캡션 매칭을 통해 relationship과 object id 가져오기
                    # genome에 있는 region 정보 불러오기
                    for region in new_all_regions:
                        # 만약 caption정보가 genome에 있다면
                        if region["phrase"].lower().strip() == caption.lower().strip():
                            # 관계성 존재 시 정보에 추가
                            try:
                                if region["relationships"]:
                                    new_box["relationships"].extend(region["relationships"])
                            except KeyError:
                                pass

                            # object ID 추가
                            new_box["object_ids"].extend([obj["object_id"] for obj in region.get("objects", [])])

                            # genome 키워드 페어 추출
                            try:
                                if region["synsets"]:
                                    for synsets in region["synsets"]:
                                        genome_keyword_pairs.append({
                                            "entity_name": synsets.get("entity_name", ""),
                                            "synset_name": synsets.get("synset_name", synsets),
                                            "caption": caption.lower().strip()
                                        })
                            except KeyError:
                                pass

            # 딕셔너리 중복 제거
            new_box["captions"] = remove_duplicates(new_box["captions"])
            new_box["object_ids"] = list(set(new_box["object_ids"]))
            new_box["relationships"] = remove_duplicates(new_box["relationships"])

            # new_boxes에 추가
            new_boxes.append(new_box)

        # -----------------------------------------------------------------------------------------------
        # keywords 구조 변경
        keywords = {}

        # 키워드 페어 중복 제거
        correct_error_keyword_pairs = remove_duplicates(correct_error_keyword_pairs)
        genome_keyword_pairs = remove_duplicates(genome_keyword_pairs)

        # -----------------------------------------------------------------------------------------------
        # 1단계
        # genome 정보로 kewords 골격 만들기(counterfactual 정보 제외)
        for keyword_pair in genome_keyword_pairs:
            synset_name = keyword_pair['synset_name']
            entity_name = keyword_pair['entity_name']

            # keyword_pair 사용하여 genome 정보 추가
            # keyword_pair 내부의 키가 존재하지 않는다면
            if synset_name not in keywords:
                # error 제외 관련 값 가져오기
                supersense, nearest_ancestor, synonyms = get_supersense_nearest_ancestor_synonyms(synset_name)

                # 값 추가
                # synonyms 추가
                if entity_name:
                    synonyms.append(entity_name)

                # 새로운 키워드 정보 생성(nearest_ancestor 추가, supersense 추가, counterfactual 정보 딕셔너리를 담을 빈 리스트 추가)
                keywords[synset_name] = {
                    "synset": list(set(synonyms)),
                    "nearest_ancestor": nearest_ancestor,
                    "supersense": supersense,
                    "counterfactual": []
                }
            elif entity_name:
                # 기존 키워드에 entity_name 추가
                keywords[synset_name]["synset"].append(entity_name)
                keywords[synset_name]["synset"] = list(set(keywords[synset_name]["synset"]))

        # -----------------------------------------------------------------------------------------------
        # 2단계
        # counterfactual 채우기 + genome에 의존적 또는 독립적인 caption의 키워드에 대한 처리(coco/narrative/annotator 생성)
        '''
        @ genome에 의존적 또는 독립적인 caption의 키워드에 대한 처리 단계
        1. sbert의 코사인 유사도 검증을 통해 genome caption과의 유사성 확인, 80이상 유사도를 보이면 거의 같은 문장으로 간주하여 리스트업
        2-1. 유사한 genome caption이 포함한 워드넷 정보들 내에서 correct keyword 정보를 찾을 수 있는 경우 
            => 해당 워드넷 synset을 키로 하여 synset에 correct keyword를,  counterfactual humanannotor에 errorkeyword 정보를 넣음
        2-2. 만일 유사한 genome caption이 포함한 워드넷 정보들 내에서 correct keyword 정보를 찾을 수 없는 경우
            => 1) 전체 genome captions이 포함한 워드넷 정보들 내에서 찾을 수 있는지 확인 
                    => 찾으면 해당 워드넷 synset을 키로 하여 synset에 correct keyword를,  counterfactual humanannotor에 errorkeyword 정보를 넣음
            => 2) 못찾았다면 nltk를 사용하여 wordnet3.0에 검색
                    => 검색 내역 중 genome에 포함된 워드넷 정보가 있다면 그걸 가져오고, 없다면 sense 1를 가져옴
                    => 검색이 안된다면 uprocessed_kewords 목록에 추가
        correct-error 셋이 다대다일 경우에도 uprocessed_kewords 목록에 추가
        '''
        # caption이 genome에 있는 것과 매핑안되는 경우 + 길이이슈 모으는 리스트
        rest_correct_error_keyword_pairs = []
        for correct_error_keyword_pair in correct_error_keyword_pairs:
            corrects = correct_error_keyword_pair['correct']
            errors = correct_error_keyword_pair['error']
            caption = correct_error_keyword_pair['caption']

            # genome caption과의 유사도 검사
            genome_caption = [item["caption"] for item in genome_keyword_pairs]
            genome_caption.append(caption)
            # 캡션 간 sbert cosine 유사도가 80 이상인 것만 모음ㅎㅎ
            sim_captions = get_similar_sentences(genome_caption)

            # 유사한 캡션들의 키워드 정보 추출
            result_keys = [p for p in genome_keyword_pairs if p['caption'] in sim_captions]
            if result_keys:
                result_keys = remove_duplicates(result_keys)

            # 성공적인 케이스
            # caption이 genome에 있는 것과 잘 매핑될 때
            if result_keys and corrects:
                for correct in corrects:
                    for result_key in result_keys:
                        if result_key['entity_name'] == correct or result_key['entity_name'] in correct:
                            synset_name = result_key['synset_name']

                            # 길이가 맞는 경우
                            if len(errors) == len(corrects):
                                try:
                                    idx = corrects.index(correct)
                                    keywords[synset_name]['counterfactual'].append({
                                        "human_annotation": errors[idx],
                                        "candidate": []
                                    })
                                except IndexError:
                                    logging.warning(f"IndexError for file {file_num} with correct '{correct}' and errors {errors}")
                            # correct가 1개, error가 여러 개
                            elif len(corrects) == 1 and len(errors) > 1: # correct caption 한 개 error 두 개
                                for error in errors:
                                    keywords[synset_name]['counterfactual'].append({
                                        "human_annotation": error,
                                        "candidate": []
                                    })
                            # error가 1개, correct가 여러 개
                            elif len(errors) == 1 and len(corrects) > 1: # error 한 개 correct 여러개
                                keywords[synset_name]['counterfactual'].append({
                                    "human_annotation": errors[0],
                                    "candidate": []
                                })
                            else: # correct caption이랑 error caption 길이가 안맞을 때
                                rest_correct_error_keyword_pairs.append(correct_error_keyword_pair)

                            # 중복 제거 및 correct 추가
                            keywords[synset_name]['counterfactual'] = remove_duplicates(
                                keywords[synset_name]['counterfactual']
                            )
                            if correct not in keywords[synset_name]['synset']:
                                keywords[synset_name]['synset'].append(correct)
                                keywords[synset_name]['synset'] = list(set(
                                    keywords[synset_name]['synset']
                                ))
                            break
            else:
                rest_correct_error_keyword_pairs.append(correct_error_keyword_pair)

        # 실패 케이스 처리
        unprocessed_keywords = []
        for correct_error_keyword_pair in rest_correct_error_keyword_pairs:
            corrects = correct_error_keyword_pair['correct']
            errors = correct_error_keyword_pair['error']

            if corrects:
                for correct in corrects:
                    # 특정 correct 에 매핑되는 error가 있는지 확인 해야한다앗...
                    processing = False

                    # 기존 synset에서 검색
                    for key in keywords:
                        # 실패 케이스의 correct가 성공 케이스들의 synset에 존재
                        clean_synset = [
                            word.replace('_', '').replace('.', '').replace(' ', '')
                            for word in keywords[key]['synset']
                        ]
                        clean_synset.extend(keywords[key]['synset'])

                        if correct.lower().replace('.', '').replace(',', '') in clean_synset:
                            for error in errors:
                                if not any(
                                        cf['human_annotation'] == error
                                        for cf in keywords[key]['counterfactual']
                                ):
                                    keywords[key]['counterfactual'].append({
                                        'human_annotation': error,
                                        'candidate': []
                                    })
                            processing = True
                            break

                    # 워드넷에서 새로 검색
                    if not processing:
                        not_found = return_true_if_keyword_not_found(correct, errors, data, keywords)
                        if not_found:
                            unprocessed_keywords.append(correct_error_keyword_pair)
            else:
                unprocessed_keywords.append(correct_error_keyword_pair)

        # 최종 결과 생성
        result = {
            genome_image_num: {
                "image_url": data[genome_image_num]["image_data"]["url"],
                "regions": new_boxes,
                "narratives": narratives,
                "keywords": keywords,
                "unprocessed_keywords": remove_duplicates(unprocessed_keywords),
                "relation_centric_regions": {
                    "gpt_generate": "",
                    "human_annotations": []
                }
            }
        }

        # 결과 저장
        core_file_path = os.path.join(core_dir, f"core_{file_num}.json")
        with open(core_file_path, "w", encoding="utf-8") as json_file:
            json.dump(result, json_file, indent=4, ensure_ascii=False)

        # 메모리 사용량 기록
        process = psutil.Process(os.getpid())
        logging.info(f"Memory usage after processing file {file_num}: {process.memory_info().rss / 1024 / 1024:.2f} MB")

        return None  # 성공 시 None 반환

    except Exception as e:
        logging.error(f"Error processing file {file_num}: {e}")
        traceback_str = ''.join(traceback.format_tb(e.__traceback__))
        logging.error(f"Traceback for file {file_num}:\n{traceback_str}")
        return file_num  # 실패 시 파일 번호 반환


@contextmanager
def suppress_output():
    """모든 stdout과 stderr 출력을 억제하는 컨텍스트 매니저"""
    with open(os.devnull, 'w') as devnull:
        old_stdout = sys.stdout
        old_stderr = sys.stderr
        sys.stdout = devnull
        sys.stderr = devnull
        try:
            yield
        finally:
            sys.stdout = old_stdout
            sys.stderr = old_stderr


def setup_nltk():
    """NLTK 데이터 다운로드 (모든 출력 억제)"""
    with suppress_output():
        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('wordnet', quiet=True)

        try:
            nltk.data.find('corpora/omw-1.4')
        except LookupError:
            nltk.download('omw-1.4', quiet=True)


def setup_logging():
    """로깅 설정"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler('processing.log', encoding='utf-8'),  # 파일에 로그 저장
            logging.StreamHandler(sys.stdout)  # 콘솔에도 출력
        ]
    )


def get_nonexist_files(core_dir, start_num, end_num):
    """존재하지 않는 파일 번호 리스트 생성"""
    file_names = set(os.listdir(core_dir))
    nonexist_files = []
    for i in range(start_num, end_num + 1):
        if f'core_{i}.json' not in file_names:
            nonexist_files.append(i)
    return nonexist_files


def process_file(file_num, output_dir, core_dir):
    """
    @description
    개별 파일 처리 함수

    """
    try:
        result = generate_core_data(file_num, output_dir, core_dir)

        # 메모리 정리
        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        return result  # 성공 시 None 반환
    except Exception as e:
        logging.error(f"Error processing file {file_num}: {str(e)}")
        return file_num  # 실패 시 파일 번호 반환


def run_multiprocessing(nonexist_files, output_dir, core_dir, num_processes=None):
    """
    @description
    멀티프로세싱으로 파일 처리를 실행하는 함수

    """
    if num_processes is None:
        num_processes = max(1, min(mp.cpu_count() - 1, 4))

    batch_size = 32  # 배치 크기 조정
    all_error_files = []
    timeout_files = []  # 타임아웃된 파일들 추적

    # Pool을 한 번만 생성하고 재사용
    with mp.Pool(processes=num_processes, initializer=init_worker) as pool:
        for i in range(0, len(nonexist_files), batch_size):
            batch = nonexist_files[i:i + batch_size]

            process_func = partial(process_file, output_dir=output_dir, core_dir=core_dir)

            with tqdm(total=len(batch),
                      desc=f"Processing batch {i//batch_size + 1}/{(len(nonexist_files)-1)//batch_size + 1}",
                      unit="file") as pbar:

                # imap을 사용하여 순서 보장
                for file_num, result in zip(batch, pool.imap(process_func, batch)):
                    if result is not None:
                        logging.error(f"Failed to process file: {result}")
                        all_error_files.append(result)
                    pbar.update(1)

                # 메모리 정리 after each batch
                gc.collect()

    return all_error_files


if __name__ == '__main__':
    # 로깅 설정
    setup_logging()

    # NLTK 초기화를 가장 먼저 수행
    setup_nltk()

    # NumPy 버전 체크
    try:
        import numpy as np
        if np.__version__.startswith('2'):
            print("\nNumPy 2.x가 감지되었습니다. 다음 명령어로 다운그레이드하세요:")
            print("pip install numpy==1.24.3\n")
            sys.exit(1)
    except ImportError:
        pass

    # 메모리 사용량 모니터링 추가
    process = psutil.Process(os.getpid())

    # 처리 전 메모리 사용량 출력
    logging.info(f"Initial memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")

    # 경로 설정
    output_dir = "/Users/kanghyeon/IdeaProjects/caption_tool/caption_tool/typescript/front/public/json/outputJson/"
    core_dir = "/Users/kanghyeon/IdeaProjects/caption_tool/caption_tool/typescript/front/public/json/coreData/"

    # 처리할 파일 목록 가져오기
    nonexist_files = get_nonexist_files(core_dir, 8965, 9185)  # 숫자는 필요에 맞게 수정
    logging.info(f"Total files to process: {len(nonexist_files)}")

    if not nonexist_files:
        logging.info("No files to process")
        sys.exit(0)

    # 멀티프로세싱 실행
    #num_processes = max(1, min(mp.cpu_count() - 1, 4))  # 최대 4개로 제한
    num_processes = 4
    error_files = run_multiprocessing(nonexist_files, output_dir, core_dir, num_processes)

    # 처리 후 메모리 사용량 출력
    logging.info(f"Final memory usage: {process.memory_info().rss / 1024 / 1024:.2f} MB")

    # 결과 출력
    logging.info("\nProcessing complete!")
    if error_files:
        logging.error(f"Failed files: {error_files}")
        logging.error(f"Total errors: {len(error_files)}")

        # 실패한 파일 목록 저장
        with open('failed_files.json', 'w', encoding='utf-8') as f:
            json.dump({'failed_files': error_files}, f, ensure_ascii=False, indent=4)
        logging.info("Failed files list saved to 'failed_files.json'")
    else:
        logging.info("All files processed successfully!")
