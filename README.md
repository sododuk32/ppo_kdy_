# Portfolio (static site)

소프트웨어 엔지니어 포트폴리오 정적 사이트. GitHub Pages로 배포됩니다.

- 진입점: `index.html`
- 콘텐츠/렌더: `portfolio-data.js` (데이터) · `portfolio-app.js` (렌더러)
- 이력서: `resume.html`
- 검색 노출 차단: `robots.txt` + `<meta robots noindex>`

> 이 레포는 배포용 스냅샷입니다. 정본 작업은 별도 private 레포에서 관리합니다.

## 배포
`main` 푸시 시 `.github/workflows/pages.yml` 이 자동 배포합니다.
Settings → Pages → Source = **GitHub Actions** 로 1회 설정 필요.
