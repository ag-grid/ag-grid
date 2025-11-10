# AG Grid 개발자 온보딩 가이드

AG Grid 팀에 오신 것을 환영합니다! 이 가이드는 AG Grid 코드베이스를 시작하는 데 도움을 드립니다.

## 📚 목차

- [환영합니다](#환영합니다)
- [사전 요구사항](#사전-요구사항)
- [시작하기](#시작하기)
- [프로젝트 구조](#프로젝트-구조)
- [개발 워크플로우](#개발-워크플로우)
- [테스팅](#테스팅)
- [코드 스타일 및 표준](#코드-스타일-및-표준)
- [일반적인 작업](#일반적인-작업)
- [문제 해결](#문제-해결)
- [리소스](#리소스)

## 🎉 환영합니다

AG Grid는 React, Angular, Vue를 지원하는 완전한 기능을 갖춘 고도로 커스터마이징 가능한 JavaScript 데이터 그리드입니다. 이 프로젝트는 커뮤니티 패키지(MIT 라이선스)와 엔터프라이즈 패키지(상용 라이선스), 프레임워크별 래퍼, 그리고 포괄적인 문서를 포함하는 모노레포로 구성되어 있습니다.

### 작업하게 될 내용

- **ag-grid-community**: 핵심 그리드 기능 (MIT 라이선스)
- **ag-grid-enterprise**: 고급 기능 (상용 라이선스)
- **프레임워크 래퍼**: React, Angular, Vue 3 통합
- **문서**: Astro 기반 문서 웹사이트
- **테스팅**: 유닛, E2E, 접근성 테스트를 포함한 포괄적인 테스트 스위트

## ✅ 사전 요구사항

시작하기 전에 다음 항목이 설치되어 있는지 확인하세요:

### 필수 소프트웨어

- **Node.js**: v20.19.4 (필수)
  ```bash
  node --version  # v20.19.4 출력되어야 함
  ```

- **Yarn**: v1.22.21 (필수)
  ```bash
  yarn --version  # 1.22.21 출력되어야 함
  ```

- **Git**: 최신 버전
  ```bash
  git --version
  ```

### 권장 도구

- **VSCode**: 사전 구성된 워크스페이스 설정이 있는 권장 IDE
- **Chrome**: E2E 테스트 실행용

### 필요한 지식

- **TypeScript**: 코드베이스 전체에서 사용되는 주요 언어
- **JavaScript (ES2020+)**: 최신 JavaScript 기능
- **CSS/SCSS**: 테마 및 스타일링용
- **프레임워크 지식** (최소 하나):
  - React 18+ with Hooks
  - Angular 18+
  - Vue 3+ with Composition API

## 🚀 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/ag-grid/ag-grid.git
cd ag-grid
```

### 2. 의존성 설치

```bash
yarn
```

이 명령은 부트스트랩 스크립트를 실행하고 Yarn Workspaces를 사용하여 모노레포 전체의 의존성을 설치합니다.

### 3. 모든 패키지 빌드

```bash
yarn nx run-many -t build
```

올바른 순서로 모든 패키지를 빌드합니다. 초기 빌드는 몇 분 정도 걸릴 수 있습니다.

### 4. 설정 확인

테스트를 실행하여 모든 것이 정상적으로 작동하는지 확인합니다:

```bash
yarn nx run-many -t test
```

### 5. VSCode에서 열기

저장소에는 사전 구성된 VSCode 설정이 포함되어 있습니다:

```bash
code .
```

VSCode는 자동으로 다음을 수행합니다:
- 포매팅에 Prettier 사용
- 저장 시 포맷 활성화
- 워크스페이스 TypeScript 버전 사용
- 사용자 정의 맞춤법 검사 사전 적용

## 📁 프로젝트 구조

### 모노레포 아키텍처

AG Grid는 **Yarn Workspaces + Nx** 모노레포 구조를 사용합니다:

```
ag-grid/
├── packages/                      # 주요 배포 가능 패키지
│   ├── ag-grid-community/        # 핵심 그리드 (MIT 라이선스)
│   ├── ag-grid-enterprise/       # 엔터프라이즈 기능
│   ├── ag-grid-react/            # React 래퍼
│   ├── ag-grid-angular/          # Angular 래퍼
│   └── ag-grid-vue3/             # Vue 3 래퍼
├── community-modules/            # 공유 커뮤니티 자산
│   ├── locale/                   # i18n 번역 (35개 이상의 언어)
│   └── styles/                   # SCSS 테마 및 스타일링
├── documentation/                # 문서 웹사이트
│   └── ag-grid-docs/            # Astro 기반 문서 사이트
├── testing/                      # 테스트 스위트
│   ├── behavioural/             # Vitest 동작 테스트
│   ├── accessibility/           # Axe 접근성 테스트
│   ├── module-size/             # 번들 크기 테스트
│   ├── react-package-tests/     # 프레임워크 패키지 테스트
│   ├── angular-package-tests/
│   └── vue-package-tests/
├── plugins/                      # 사용자 정의 Nx 플러그인
├── scripts/                      # 빌드 및 배포 스크립트
└── external/                     # 외부 공유 라이브러리
    └── ag-shared/               # 공유 유틸리티
```

### 주요 패키지

#### ag-grid-community
35개 이상의 기능 디렉토리를 가진 핵심 그리드 기능:
- `src/agStack/` - 핵심 그리드 스택
- `src/api/` - 공개 API
- `src/columns/` - 컬럼 관리
- `src/components/` - UI 컴포넌트
- `src/filter/` - 필터링 시스템
- `src/clientSideRowModel/` - 기본 행 모델

#### ag-grid-enterprise
모듈식 아키텍처를 가진 고급 기능:
- `src/charts/` - 통합 차트
- `src/rowGrouping/` - 행 그룹핑
- `src/pivot/` - 피봇
- `src/serverSideRowModel/` - 서버 사이드 데이터
- `src/excelExport/` - Excel 내보내기
- 25개 이상의 엔터프라이즈 모듈

#### 프레임워크 래퍼
- **ag-grid-react**: Hooks 기반 React 컴포넌트
- **ag-grid-angular**: Angular CLI 통합
- **ag-grid-vue3**: Vue 3 Composition API

## 🔧 개발 워크플로우

### 패키지 빌드

```bash
# 특정 패키지 빌드
yarn nx build ag-grid-community

# 워치 모드로 빌드 (변경 시 자동 재빌드)
yarn nx build ag-grid-community -c watch

# 영향받은 모든 패키지 빌드
yarn nx affected -t build

# 특정 패키지들 빌드
yarn nx run-many -t build -p ag-grid-community ag-grid-react
```

### 빌드 타겟

각 패키지는 여러 빌드 타겟을 가지고 있습니다:

1. **build:types** - TypeScript 선언 파일 생성
2. **build:package** - ESM 및 CJS 번들 생성
3. **build:umd** - CDN용 UMD 번들 생성
4. **build:styles** - SCSS에서 CSS 컴파일
5. **build:css** - 인라인 CSS-in-JS 생성

### 개발 서버 실행

```bash
# 문서 웹사이트를 로컬에서 실행
yarn nx serve ag-grid-docs

# http://localhost:4321 방문
```

### Nx 작업

Nx는 작업 오케스트레이션 및 캐싱에 사용됩니다:

```bash
# 프로젝트의 특정 타겟 실행
yarn nx <target> <project>

# 여러 프로젝트에 대해 타겟 실행
yarn nx run-many -t <target>

# 영향받은 프로젝트에 대해서만 타겟 실행
yarn nx affected -t <target>

# 프로젝트 그래프 보기
yarn nx graph

# Nx 캐시 삭제
yarn nx reset
```

### Git 워크플로우

#### 브랜치 전략

- **latest**: 주요 개발 브랜치
- **b[version]**: 릴리스 브랜치 (예: b34.3.1)
- **기능 브랜치**: PR을 위한 설명적인 이름 사용

#### 변경 사항 만들기

```bash
# 새 브랜치 생성
git checkout -b feature/your-feature-name

# 변경하고 커밋
git add .
git commit -m "설명이 포함된 커밋 메시지"

# 원격으로 푸시
git push -u origin feature/your-feature-name

# 'latest' 브랜치를 대상으로 PR 생성
```

## 🧪 테스팅

### 테스트 프레임워크 개요

AG Grid는 여러 테스팅 프레임워크를 사용합니다:

- **Jest**: 유닛 테스트 (커뮤니티 및 엔터프라이즈 패키지)
- **Vitest**: 동작 테스트
- **Playwright**: E2E 테스트
- **Axe**: 접근성 테스트

### 테스트 실행

```bash
# 패키지의 유닛 테스트 실행
yarn nx test ag-grid-community

# 워치 모드로 유닛 테스트 실행
yarn nx test ag-grid-community --watch

# 모든 테스트 실행
yarn nx run-many -t test

# 영향받은 테스트만 실행
yarn nx affected -t test

# E2E 테스트 실행
yarn nx test:e2e <test-package>

# 동작 테스트 실행
yarn nx test testing-behavioural

# 접근성 테스트 실행
yarn nx test testing-accessibility
```

### 테스트 작성

#### 유닛 테스트 (Jest)

유닛 테스트는 소스 파일과 함께 위치해야 합니다:

```typescript
// myFeature.ts
export function myFeature(param: string): string {
    return `Hello ${param}`;
}

// myFeature.test.ts
import { myFeature } from './myFeature';

describe('myFeature', () => {
    it('should return greeting', () => {
        expect(myFeature('World')).toBe('Hello World');
    });
});
```

#### E2E 테스트 (Playwright)

`testing/*/src/**/*.spec.ts`에 위치:

```typescript
import { test, expect } from '@playwright/test';

test('grid renders correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.ag-root')).toBeVisible();
});
```

### 테스트 모범 사례

- 코드와 함께 테스트 작성
- 설명적인 테스트 이름 사용
- 엣지 케이스 및 오류 조건 테스트
- 테스트를 빠르고 독립적으로 유지
- 외부 의존성 모킹

## 🎨 코드 스타일 및 표준

### Prettier로 포매팅

설정 (`.prettierrc.json`):
- 라인 너비: 120자
- 들여쓰기: 4칸
- 따옴표: 작은따옴표
- 후행 쉼표: ES5
- 세미콜론: 항상

VSCode에서 저장 시 포맷이 활성화됩니다. 수동 포매팅:

```bash
# 포매팅 확인
yarn nx format:check

# 포매팅 수정
yarn nx format:write
```

### ESLint로 린팅

```bash
# 특정 패키지 린트
yarn nx lint ag-grid-community

# 모든 패키지 린트
yarn nx run-many -t lint

# 문제 자동 수정
yarn nx lint ag-grid-community --fix
```

### TypeScript 가이드라인

- strict 모드 사용 (기본적으로 활성화됨)
- 객체 형태에 대해 type보다 interface 선호
- 공개 API에 명시적 반환 타입 사용
- `any` 피하기 - 타입이 정말 알 수 없는 경우 `unknown` 사용
- 적절한 경우 const assertions 사용

### 코드 구성

- 파일을 집중적이고 단일 목적으로 유지
- import 정리:
  1. 외부 의존성
  2. 내부 ag-grid imports
  3. 상대 imports
- 공개 API에 배럴 export (`index.ts`) 사용
- 테스트를 소스 파일과 함께 배치

### 명명 규칙

- **파일**: camelCase (예: `myComponent.ts`)
- **클래스**: PascalCase (예: `GridApi`)
- **인터페이스**: PascalCase, 필요시 `I` 접두사 (예: `IRowNode`)
- **함수**: camelCase (예: `calculateTotal`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_ROWS`)

## 📝 일반적인 작업

### 새 기능 추가

1. `latest`에서 기능 브랜치 생성
2. 적절한 패키지에 기능 구현
3. 유닛 테스트 추가
4. 필요시 문서 업데이트
5. 테스트 및 린팅 실행
6. PR 생성

### 버그 수정

1. 버그를 재현하는 실패하는 테스트 작성
2. 수정 구현
3. 테스트가 통과하는지 확인
4. 회귀 테스트 확인
5. 버그 설명 및 수정과 함께 PR 생성

### 새 패키지 추가

1. 적절한 위치에 패키지 디렉토리 생성
2. 표준 설정으로 `package.json` 추가
3. 루트 설정을 확장하는 `tsconfig.json` 추가
4. Nx 설정에 빌드 타겟 추가
5. 워크스페이스 참조 업데이트

### 의존성 업데이트

```bash
# 특정 의존성 업데이트
yarn workspace <package-name> add <dependency>@<version>

# 루트 의존성 업데이트
yarn add -W <dependency>@<version>

# 개발 의존성 업데이트
yarn add -D -W <dependency>@<version>
```

### 문서 빌드

```bash
# 문서 사이트 빌드
yarn nx build ag-grid-docs

# 로컬에서 서빙
yarn nx serve ag-grid-docs

# 링크 체커 실행
yarn nx link-checker ag-grid-docs
```

### 릴리스 빌드 생성

```bash
# 프로덕션용 모든 패키지 빌드
yarn nx run-many -t build -c production

# 번들 크기 확인
yarn nx test testing-module-size
```

## 🐛 문제 해결

### 일반적인 문제

#### 빌드 실패

**문제**: TypeScript 컴파일 오류
```bash
# 해결책: 타입을 먼저 재빌드
yarn nx run-many -t build:types
```

**문제**: 빌드 중 메모리 부족
```bash
# 해결책: Node 메모리 증가
export NODE_OPTIONS="--max-old-space-size=8192"
yarn nx run-many -t build
```

#### 테스트 실패

**문제**: 로컬에서는 실패하지만 CI에서는 통과
```bash
# 해결책: Nx 캐시 및 node_modules 삭제
yarn nx reset
rm -rf node_modules
yarn install
```

**문제**: E2E 테스트 타임아웃
```bash
# 해결책: 테스트 설정에서 타임아웃 증가
# 또는 더 많은 시간으로 테스트 실행
yarn nx test:e2e --timeout=60000
```

#### 의존성 문제

**문제**: 패키지 버전 충돌
```bash
# 해결책: 루트 package.json에서 resolutions 사용
# package.json에 추가:
"resolutions": {
  "package-name": "specific-version"
}
# 그런 다음 재설치
yarn install
```

#### IDE 문제

**문제**: VSCode가 TypeScript 경로를 인식하지 못함
```bash
# 해결책: VSCode TypeScript 서버 다시 로드
# 명령 팔레트 (Cmd/Ctrl+Shift+P) -> "TypeScript: Reload Project"
```

### 도움 받기

막혔을 때:

1. `documentation/ag-grid-docs/`의 기존 문서 확인
2. 코드베이스에서 유사한 문제 검색
3. 커뮤니케이션 채널에서 팀원에게 문의
4. [공식 문서](https://www.ag-grid.com/documentation) 참조

## 📚 리소스

### 필수 링크

- **웹사이트**: [ag-grid.com](https://www.ag-grid.com)
- **문서**: [ag-grid.com/documentation](https://www.ag-grid.com/documentation)
- **GitHub**: [github.com/ag-grid/ag-grid](https://github.com/ag-grid/ag-grid)
- **커뮤니티**: [ag-grid.com/community](https://www.ag-grid.com/community)

### 문서

- `README.md` - 프로젝트 개요 및 빠른 시작
- `CONTRIBUTING.md` - 프레임워크별 기여 가이드라인
- `SECURITY.md` - 보안 정책 및 보고
- 각 패키지 디렉토리의 프레임워크별 README

### 코드 품질 도구

- **SonarCloud**: [sonarcloud.io/dashboard?id=ag-grid-community](https://sonarcloud.io/dashboard?id=ag-grid-community)
- **GitHub Actions**: CI/CD 파이프라인은 `.github/workflows/` 확인

### 학습 리소스

#### 그리드 이해하기

1. `packages/ag-grid-community/src/agStack/`에서 시작
2. `packages/ag-grid-community/src/api/`의 공개 API 검토
3. 각 디렉토리에서 특정 기능 탐색

#### 프레임워크 통합

- **React**: `packages/ag-grid-react/src/`
- **Angular**: `packages/ag-grid-angular/projects/ag-grid-angular/src/`
- **Vue**: `packages/ag-grid-vue3/src/`

#### 테스트 예제

- 유닛 테스트: 코드베이스 전체에 `*.test.ts`로
- E2E 테스트: `testing/behavioural/src/`
- 접근성: `testing/accessibility/src/`

### 개발 명령어 치트 시트

```bash
# 설정
yarn                                          # 의존성 설치
yarn nx run-many -t build                     # 모든 패키지 빌드

# 개발
yarn nx build <package> -c watch              # 워치 모드
yarn nx serve ag-grid-docs                    # 문서 로컬 실행

# 테스팅
yarn nx test <package>                        # 유닛 테스트 실행
yarn nx affected -t test                      # 영향받은 것 테스트
yarn nx test:e2e <package>                    # E2E 테스트 실행

# 코드 품질
yarn nx lint <package>                        # 패키지 린트
yarn nx format:check                          # 포매팅 확인
yarn nx format:write                          # 포매팅 수정

# 유틸리티
yarn nx graph                                 # 프로젝트 그래프 보기
yarn nx reset                                 # 캐시 삭제
yarn nx affected:graph                        # 영향받은 그래프 보기
```

### 다음 단계

이제 설정이 완료되었으니 다음 단계를 제안합니다:

1. **코드베이스 탐색**: `packages/ag-grid-community/`에서 시작
2. **예제 실행**: 문서 사이트를 로컬에서 확인
3. **첫 이슈 선택**: "good first issue" 레이블이 있는 이슈 찾기
4. **기여 가이드라인 읽기**: 프레임워크별 CONTRIBUTING.md 검토
5. **커뮤니티 가입**: 다른 개발자들과 연결

환영하며, 즐거운 코딩 되세요!

---

**질문이나 문제가 있으신가요?**

이 온보딩 가이드에 문제가 있거나 개선 제안이 있으시면 팀 리더에게 연락하거나 저장소에 이슈를 열어주세요.
