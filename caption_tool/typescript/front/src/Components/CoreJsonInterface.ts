export interface Box {
    id: string; // 이미지 번호 + 박스 리스트 순서
    color: string; 
    x: number; // 좌측 상단 꼭지점 x 좌표
    y: number; // 좌측 상단 꼭지점 y 좌표
    height: number; // 박스 높이
    width: number; // 박스 너비
    captions: any[]; // correct caption
    object_ids: number[];
    relationships: any[];
  }
  
  export interface Keyword {
    instance: string; // 키워드
    synset: string[]; // 동의어
    nearest_ancestor: string; // 부모 노드 키워드
    unique_beginner: string; // unique beginner
  }
  
  export interface RelationCentricRegion {
    human_annotation: string;
    region_ids: string[];
  }
  
  export interface VGID {
    regions: any[];
    narratives: string;
    keywords: any;
    unprocessed_keywords: any[];
    relation_centric_regions: RelationCentricRegion[];
  }

  export interface Data {
    [key:string]: VGID;
  }