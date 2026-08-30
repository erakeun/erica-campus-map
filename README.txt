ERICA 캠퍼스맵 GitHub Pages 테스트본

구성
- index.html
- assets/erica-map.jpg

사용법
1. index.html의 BUILDINGS 배열을 찾는다.
2. 원하는 건물의 url:"" 부분에 블로그 주소를 넣는다.
3. GitHub 저장소에 index.html과 assets 폴더를 그대로 업로드한다.
4. Settings > Pages에서 배포한다.

동작
- URL 있음: 지도 번호와 하단 범례 모두 클릭 가능
- URL 없음: 클릭 이동 안 됨
- 검색: 링크 유무와 관계없이 지도 번호와 하단 범례가 번쩍임
- 검색어: 건물번호, name, aliases
- 새 탭에서 링크 열림

좌표 확인
- 배포 주소 뒤에 ?debug=1 을 붙이면 투명 클릭영역이 보인다.
- 예: https://example.github.io/map/?debug=1

참고
- 제공된 원본 지도 기준으로 202 글로벌문화통상관, 204 언론정보관은 이미지의 기존 표기명을 유지했다.
- 지도 이미지 자체를 이름만 수정하고 크기/비율을 그대로 유지하면 좌표는 대체로 그대로 쓸 수 있다.
