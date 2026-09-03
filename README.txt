# ERICA Campus Map V2.1.0 · BILINGUAL MAP

## 업로드할 파일

저장소 루트가 아래 구조가 되도록 기존 파일을 교체하면 됩니다.

```text
index.html
assets/
  erica-map-ko.jpg
  erica-map-en.jpg
README.md
```

## 이번 버전

- 상단 `한국어 / English` 전환
- 언어에 따라 한국어·영문 항공지도 자동 교체
- 제목, 검색창, 확대 안내, 건물 목록, 상태 문구, 검색 결과까지 전체 UI 전환
- 한국어·영문 건물명 모두 검색 가능
- 202 영문명 `Solseonggwan`, 204 영문명 `Ilsinjae` 반영
- 현재 영문 화면의 링크는 기존 한국어 블로그 링크로 연결
- 기존 확대/축소, Ctrl/Cmd+휠, 검색 강조 기능 유지
- 확대 상태에서 마우스 드래그 이동 추가
- 선택 언어는 브라우저에 저장되며 영문 주소는 `?lang=en`으로 공유 가능

## 영문 내부구조도 링크를 나중에 추가하는 법

`index.html`에서 해당 건물을 찾습니다.

```js
{
  "id": "101",
  "urlKo": "https://blog.naver.com/...",
  "urlEn": ""
}
```

영문 게시물이 생기면 `urlEn`만 채우면 됩니다.

```js
"urlEn": "https://english-floor-plan-url.example"
```

현재는 `urlEn`이 비어 있으면 영문 화면에서도 `urlKo`로 이동합니다.

## 건물명 수정

- 한국어: `nameKo`
- 영문: `nameEn`
- 이전 명칭이나 추가 검색어: `aliasesKo`, `aliasesEn`

## 점검 주소

클릭 영역을 보려면 배포 주소 뒤에 `?debug=1`을 붙입니다.
영문 디버그 화면은 `?lang=en&debug=1`로 열 수 있습니다.
