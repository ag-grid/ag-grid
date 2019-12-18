
![alt text](./github-banner.png "Logo Title Text 1")

[![CDNJS](https://img.shields.io/cdnjs/v/ag-grid-community.svg)](https://cdnjs.com/libraries/ag-grid-community)
[![npm](https://img.shields.io/npm/dm/ag-grid-community.svg)](https://www.npmjs.com/package/ag-grid-community)
[![npm](https://img.shields.io/npm/dt/ag-grid-community.svg)](https://www.npmjs.com/package/ag-grid-community)

ag-Grid
------

ag-Grid는 모든 기능을 갖추고 사용자 지정이 매우 용이한 자바스크립트 데이터 grid입니다.
[뛰어난 성능](https://www.ag-grid.com/example.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github#/performance/1)을 제공하고 3rd party 의존성이 없으며 [모든 주요한 자바스크립트 프레임워크와 부드럽게 통합](https://www.ag-grid.com/javascript-grid-getting-started?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)됩니다. 여러개의 필더들과 그루핑이 어떻게 우리의 그리드에 보여지고 할 수 있는지 확인해보세요:

![alt text](./github-grid-demo.jpg "Logo Title Text 1")


기능들
--------------

모든 grid에서 기대하는 표준 기능들 뿐만 아니라:

* 컬럼 상호작용 (사이즈 변경, 재정렬, 그리고 열 고정)
* 페이지 매기기
* 정렬
* 행 선택

ag-Grid를 돋보이게 하는 기능들:

* 그루핑 / 통합*
* 사용자 정의 필터링
* 내부 셀 편집
* Records Lazy Loading *
* Server-Side Records Operations *
* Live Stream Updates
* 계층에 따른 데이터 지원 & Tree View *
* 사용자 정의 외관
* 사용자 정의 셀 콘텐츠
* 엑셀 같은 Pivoting *
* 상태 지속성
* 키보드 네비게이션
* CSV로 데이터 추출
* Excel로 데이터 추출 *
* 행 재정렬
* 복사 / 붙여넣기 
* 열 너비 변경
* 행 고정
* 전체 너비 행

\* 별표(*)로 표시된 기능들은 [산업용 버젼](https://www.ag-grid.com/license-pricing.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)에서만 사용 가능합니다.

기능들의 완전한 목록을 확인하려면 [개발자 문서](https://www.ag-grid.com/documentation-main/documentation.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)를 확인하시거나 데모와 튜토리얼을 확인하려면 [우리의 공식 문서](https://www.ag-grid.com/features-overview?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)를 방문하세요.

프레임워크별 솔루션을 찾으시나요?
--------------
* [AngularJS로 시작하기](https://www.ag-grid.com/angular-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Angular로 시작하기](https://www.ag-grid.com/angular-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [React로 시작하기](https://www.ag-grid.com/react-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [Vue로 시작하기](https://www.ag-grid.com/vue-getting-started?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)
* [WebComponents로 시작하기](https://www.ag-grid.com/best-web-component-data-grid?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)

사용 개요
--------------

#### 설치하기

    $ npm i --save ag-grid

### HTML에 placeholder 추가

    <div id="myGrid" style="height: 150px;width: 600px" class="ag-theme-balham"></div>


#### grid와 styles 포함하기

    import {Grid} from "ag-grid/main";

    import "ag-grid/dist/styles/ag-grid.css";
    import "ag-grid/dist/styles/ag-theme-balham.css";

### 배열 설정하기

    const gridOptions = {
    	columnDefs: [
    		{headerName: 'Make', field: 'make'},
    		{headerName: 'Model', field: 'model'},
    		{headerName: 'Price', field: 'price'}
    	],
    	rowData: [
    		{make: 'Toyota', model: 'Celica', price: 35000},
    		{make: 'Ford', model: 'Mondeo', price: 32000},
    		{make: 'Porsche', model: 'Boxter', price: 72000}
    	]
    };

### 그리드 초기화

    let eGridDiv = document.querySelector('#myGrid');
    new Grid(eGridDiv, this.gridOptions);

어떻게 여러분들의 프로젝트에 grid를 통합하는지 정보가 더 필요하시다면 [타입스크립트 - 웹팩2로 빌드하기](https://www.ag-grid.com/ag-grid-typescript-webpack-2?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)를 보세요.

이슈 보고
----------
만약에 버그를 발견했다면, 이 레포지토리 `issues` 구역에 올려주세요. 만약 산업용 버젼을 사용하고 있다면 전용 티케팅 시스템에 올려주세요. 지원에 관한 더 많은 정보는 [dedicated page](https://www.ag-grid.com/support.php?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)를 확인하세요.


질문하기
-------------

`ag-grid` 태그를 사용하여 [스택오버플로우](https://stackoverflow.com/questions/tagged/ag-grid)에서 유사한 문제를 확인하세요. 만약 관련한 질문이 없다면, 스택오버플로우에 새로운 메시지를 포스트하세요. 깃허브 이슈에 질문을 올리지 마세요.

기여하기
------------
ag-Grid는 런던의 공동 개발자 팀에 의해 개발되었습니다. 만약 팀에 속하길 원한다면 우리의 [jobs listing](https://www.ag-grid.com/ag-grid-jobs-board?utm_source=ag-grid-readme&utm_medium=repository&utm_campaign=github)을 확인하거나 당신의 애플리케이션을 info@ag-grid.com으로 보내주세요.

라이센스
------------------
이 프로젝트는 MIT 라이센스로 허가되었습니다. 더 많은 정보는 [라이센스 파일](./LICENSE.txt)을 확인하세요.
