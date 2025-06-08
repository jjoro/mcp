/**
 * @file 플랫 데이터용 DaisyUI 메뉴 생성 함수 (함수형 JavaScript)
 * @description 각 경로가 {level_cdN, level_nmN} 속성들을 가진 객체로 정의된 데이터로부터 중첩된 DaisyUI 메뉴 HTML을 생성합니다.
 */

/**
 * 메뉴 아이템 데이터 구조 (중첩된 형태)
 * @typedef {object} MenuItem
 * @property {string} label - 메뉴 아이템에 표시될 텍스트.
 * @property {string} [url] - 메뉴 아이템의 링크 URL (옵셔널).
 * @property {MenuItem[]} [children] - 하위 메뉴 아이템들의 배열 (옵셔널).
 */

/**
 * 플랫 메뉴 아이템의 한 조각(segment) 데이터 구조 (내부 처리용)
 * @typedef {object} FlatMenuSegment
 * @property {string} level_cd - 메뉴 아이템의 레벨 코드.
 * @property {string} level_nm - 메뉴 아이템의 이름.
 * @property {string} [url] - 메뉴 아이템의 링크 URL (옵셔널).
 */

/**
 * 플랫 메뉴 경로 데이터 구조 (transformFlatPathsToNestedMenu 함수의 입력 형태)
 * @typedef {FlatMenuSegment[]} FlatMenuPath
 * 예: [{ level_cd: "1", level_nm: "정산" }, { level_cd: "2", level_nm: "정산2-1", url: "/path" }]
 */

/**
 * 원시 메뉴 데이터 항목 구조 (사용자 입력 형태)
 * @typedef {object} RawMenuDataItem
 * @property {string} [level_cd1] - 첫 번째 레벨 코드.
 * @property {string} level_nm1 - 첫 번째 레벨 이름.
 * @property {string} [level_cd2] - 두 번째 레벨 코드.
 * @property {string} [level_nm2] - 두 번째 레벨 이름.
 * @property {string} [level_cd3] - 세 번째 레벨 코드.
 * @property {string} [level_nm3] - 세 번째 레벨 이름.
 * // ... 최대 레벨까지 level_cdN, level_nmN 형태로 속성이 존재할 수 있습니다.
 * @property {string} [url] - 해당 경로의 최종 목적지 URL (옵셔널).
 */


// --- 데이터 변환 함수들 ---

/**
 * 원시 메뉴 데이터 배열 (각 항목이 level_nmN 형태의 속성을 가짐)을
 * FlatMenuPath[] (각 경로가 FlatMenuSegment 객체들의 배열) 형태로 변환하는 함수입니다.
 * @param {RawMenuDataItem[]} rawDataArray - 원시 메뉴 데이터 객체들의 배열.
 * @returns {FlatMenuPath[]} 변환된 플랫 메뉴 경로들의 배열.
 */
const preprocessRawMenuData = (rawDataArray) => {
  if (!Array.isArray(rawDataArray)) {
    console.error("입력 원시 데이터가 배열이 아닙니다.");
    return [];
  }

  return rawDataArray.map(rawPathObject => {
    const path = [];
    let i = 1;
    // level_nmX 속성이 존재하는 동안 반복하여 경로 세그먼트를 추출합니다.
    while (rawPathObject[`level_nm${i}`]) {
      const segmentUrl = rawPathObject[`url${i}`] || (i === 1 ? rawPathObject.url : undefined);
      path.push({
        // level_cdX가 없으면 순번을 문자열로 사용합니다. (예: "1", "2", ...)
        level_cd: rawPathObject[`level_cd${i}`] || String(i),
        level_nm: rawPathObject[`level_nm${i}`],
        url: segmentUrl // URL 정보 추가
      });
      i++;
    }
    return path;
  }).filter(path => path.length > 0); // 유효하지 않은 (빈) 경로가 생성된 경우 필터링합니다.
};

/**
 * 단일 경로(FlatMenuPath)를 기존 트리 구조(MenuItem[])에 병합하는 재귀 헬퍼 함수입니다.
 * 불변성을 유지하며, 새로운 트리 레벨을 반환합니다.
 * @param {MenuItem[]} currentTreeLevel - 현재 레벨의 메뉴 아이템 배열.
 * @param {FlatMenuPath} path - 처리할 경로의 나머지 부분 (FlatMenuSegment[]).
 * @returns {MenuItem[]} 병합된 새 메뉴 아이템 배열.
 */
const mergePathIntoLevel = (currentTreeLevel, path) => {
  if (!path || path.length === 0) {
    return currentTreeLevel;
  }

  const [currentSegment, ...restOfPath] = path;
  const { level_nm, url } = currentSegment; // url 속성도 추출합니다.

  const existingItemIndex = currentTreeLevel.findIndex(item => item.label === level_nm);

  if (existingItemIndex !== -1) {
    // 이미 해당 레벨에 같은 이름의 아이템이 존재하는 경우
    const itemToUpdate = currentTreeLevel[existingItemIndex];
    // 자식들을 대상으로 재귀적으로 병합을 수행합니다.
    const updatedChildren = mergePathIntoLevel(itemToUpdate.children || [], restOfPath);

    // 기존 아이템을 새로운 정보로 업데이트합니다.
    return [
      ...currentTreeLevel.slice(0, existingItemIndex),
      {
        ...itemToUpdate,
        // 현재 세그먼트에 url이 있으면 덮어쓰고, 없으면 기존 url을 유지합니다.
        url: url || itemToUpdate.url,
        children: updatedChildren.length > 0 ? updatedChildren : undefined
      },
      ...currentTreeLevel.slice(existingItemIndex + 1),
    ];
  } else {
    // 새로운 아이템을 생성하는 경우
    const newChildren = mergePathIntoLevel([], restOfPath);
    const newItem = {
      label: level_nm,
      // url이 존재할 경우에만 속성을 추가합니다.
      ...(url && { url }),
      // 자식 노드가 존재할 경우에만 속성을 추가합니다.
      ...(newChildren.length > 0 && { children: newChildren }),
    };
    return [...currentTreeLevel, newItem];
  }
};


/**
 * 전처리된 플랫 경로 데이터 배열(FlatMenuPath[])을 중첩된 MenuItem 구조로 변환합니다.
 * @param {FlatMenuPath[]} preprocessedPathsData - 전처리된 플랫 메뉴 경로들의 배열.
 * @returns {MenuItem[]} 중첩된 MenuItem 객체들의 배열.
 */
const transformFlatPathsToNestedMenu = (preprocessedPathsData) => {
  if (!Array.isArray(preprocessedPathsData)) {
    console.error("입력 데이터(preprocessedPathsData)가 배열이 아닙니다.");
    return [];
  }
  if (preprocessedPathsData.length === 0) {
    return [];
  }

  // reduce를 사용하여 모든 경로를 하나의 중첩된 메뉴 구조로 병합합니다.
  return preprocessedPathsData.reduce((currentNestedMenu, path) => {
    return mergePathIntoLevel(currentNestedMenu, path);
  }, []);
};


// --- HTML 렌더링 함수들 ---
/**
 * <a> 태그 HTML 문자열을 생성합니다. url이 없으면 '#'를 기본값으로 사용합니다.
 * @param {string} label - 앵커 태그 내부에 표시될 텍스트.
 * @param {string} [url] - 앵커 태그의 href 속성에 들어갈 URL.
 * @returns {string} 생성된 <a> 태그 HTML 문자열.
 */
const createAnchorTagHTML = (label, url) => `<a class="menu-item" href="${url || '#'}">${label}</a>`;

/**
 * 간단한 메뉴 아이템(자식이 없는)의 <li> HTML 문자열을 생성합니다.
 * @param {MenuItem} item - 메뉴 아이템 객체.
 * @returns {string} 생성된 <li><a>...</a></li> HTML 문자열.
 */
const createSimpleMenuItemHTML = (item) => `<li>${createAnchorTagHTML(item.label, item.url)}</li>`;

/**
 * 부모 메뉴 아이템(자식이 있는)의 <li><details>...</details></li> HTML 문자열을 생성합니다.
 * @param {MenuItem} item - 부모 메뉴 아이템 객체.
 * @param {(items: MenuItem[]) => string} renderRecursiveFn - 하위 메뉴 아이템 배열을 받아 HTML 문자열을 반환하는 재귀 함수.
 * @returns {string} 생성된 <li><details>...</details></li> HTML 문자열.
 */
const createParentMenuItemHTML = (item, renderRecursiveFn) => {
  const childrenHTML = (item.children && item.children.length > 0)
    ? renderRecursiveFn(item.children)
    : '';
  return `
    <li class="menu-item" href="${item.url || '#'}">
      <details>
        <summary>${item.label}</summary>
        <ul>
          ${childrenHTML}
        </ul>
      </details>
    </li>
  `;
};

/**
 * 메뉴 아이템 배열(MenuItem[])을 받아 HTML 문자열로 변환하는 재귀 함수입니다.
 * @param {MenuItem[]} items - 메뉴 아이템 객체들의 배열.
 * @returns {string} 메뉴 아이템들로부터 생성된 HTML 문자열.
 */
const renderMenuItemsRecursive = (items) => {
  if (!Array.isArray(items)) return '';
  return items.map(item => {
    // 자식 노드가 있으면 부모 아이템으로, 없으면 단순 아이템으로 렌더링합니다.
    if (item.children && item.children.length > 0) {
      return createParentMenuItemHTML(item, renderMenuItemsRecursive);
    } else {
      return createSimpleMenuItemHTML(item);
    }
  }).join('');
};

/**
 * 최상위 함수: 중첩된 메뉴 데이터(MenuItem[])와 CSS 클래스를 사용하여 전체 DaisyUI 메뉴 HTML을 생성합니다.
 * @param {MenuItem[]} nestedMenuData - 전체 메뉴 구조를 나타내는 중첩된 MenuItem 객체들의 배열.
 * @param {string} [ulClasses="menu bg-base-100 text-base-content min-h-full w-80 p-4"] - 최상위 <ul> 태그에 적용할 CSS 클래스.
 * @returns {string} 완성된 DaisyUI 메뉴 HTML 문자열.
 */
const generateDaisyUIMenuFromNested = (nestedMenuData, ulClasses = "menu bg-base-100 text-base-content min-h-full w-80 p-4") => {
  if (!Array.isArray(nestedMenuData) || nestedMenuData.length === 0) {
    return `<ul class="${ulClasses}"><li>메뉴 데이터가 비어있습니다.</li></ul>`;
  }
  const menuItemsHTML = renderMenuItemsRecursive(nestedMenuData);
  return `<ul class="${ulClasses}">${menuItemsHTML}</ul>`;
};

/**
 * 최종 사용자용 함수: 원시 메뉴 데이터(RawMenuDataItem[])를 받아 전체 DaisyUI 메뉴 HTML을 생성합니다.
 * 내부적으로 전처리, 중첩 변환, HTML 렌더링 과정을 모두 수행합니다.
 * @param {RawMenuDataItem[]} rawMenuData - 사용자 입력 형식의 메뉴 데이터 배열.
 * @param {string} [ulClasses] - 최상위 <ul> 태그에 적용할 CSS 클래스 (옵셔널).
 * @returns {string} 완성된 DaisyUI 메뉴 HTML 문자열.
 */
const createDaisyUIMenuFromRawData = (rawMenuData, ulClasses) => {
    const preprocessedPaths = preprocessRawMenuData(rawMenuData);
    console.log(preprocessedPaths);
    const nestedMenu = transformFlatPathsToNestedMenu(preprocessedPaths);
    console.log(nestedMenu);
    return generateDaisyUIMenuFromNested(nestedMenu, ulClasses);
};


// --- 사용 예시 ---
// 사용자 제공 예시 메뉴 데이터
const myMenuData = [
  {
    level_cd1: "1", level_nm1: "정산",
    level_cd2: "2", level_nm2: "정산2-1",
    level_cd3: "3", level_nm3: "정산3-1",
  },
  {
    level_cd1: "1", level_nm1: "청구",
    level_cd2: "2", level_nm2: "청구2-1",
    level_cd3: "3", level_nm3: "청구3-1",
  },
  {
    level_cd1: "1", level_nm1: "결제",
    level_cd2: "2", level_nm2: "결제2-1",
    level_cd3: "3", level_nm3: "결제3-1",
  },
  {
    level_cd1: "1", level_nm1: "과금",
    level_cd2: "2", level_nm2: "과금2-1",
    level_cd3: "3", level_nm3: "과금3-1",
  },
  // 추가적인 예시 데이터 (다양한 구조 확인용)
  {
    level_cd1: "1", level_nm1: "정산", // 기존 '정산'과 병합됨
    level_cd2: "2", level_nm2: "정산2-1", // 기존 '정산2-1'과 병합됨
    level_cd3: "3", level_nm3: "정산3-1-서브1", // '정산3-1'의 하위 메뉴로 추가
  },
  {
    level_cd1: "1", level_nm1: "정산",
    level_cd2: "2", level_nm2: "정산2-2",
  },
  {
    level_cd1: "2", level_nm1: "사용자 관리",
    level_cd2: "2-1", level_nm2: "사용자 목록",
  },
  {
    level_cd1: "2", level_nm1: "사용자 관리",
    level_cd2: "2-2", level_nm2: "권한 설정",
    level_cd3: "2-2-1", level_nm3: "역할별 권한",
    level_cd4: "2-2-1-1", level_nm4: "읽기", // 4레벨 메뉴
  },
  {
    level_cd1: "1", level_nm1: "단일메뉴",
  },
  // URL 정보가 포함된 데이터
  { level_cd1: "1", level_nm1: "정산", url: '/html/settlement.html' },
  { level_cd1: "1", level_nm1: "청구", url: '/html/billing.html' },
  { level_cd1: "1", level_nm1: "결제", url: '/html/payment.html' },
  { level_cd1: "1", level_nm1: "과금", url: '/html/charging.html' },
];

// 최종 함수를 사용하여 메뉴 HTML 생성
const generatedMenuHTML = createDaisyUIMenuFromRawData(myMenuData);


// 생성된 HTML을 DOM에 삽입 (HTML 파일에 <div id="menu-container"></div> 가 있다고 가정)
document.addEventListener('DOMContentLoaded', () => {
  const menuContainer = document.getElementById('menu-container');
  if (menuContainer) {
    menuContainer.insertAdjacentHTML('beforeend', generatedMenuHTML);
  } else {
    console.warn("메뉴를 삽입할 컨테이너(id='menu-container')를 찾을 수 없습니다. body의 시작 부분에 임시로 메뉴를 추가합니다.");
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = generatedMenuHTML;
    if (document.body) {
        document.body.insertBefore(tempDiv, document.body.firstChild);
    } else {
        document.documentElement.insertBefore(tempDiv, document.documentElement.firstChild);
    }
  }
});

/*
// HTML 예시:
<!DOCTYPE html>
<html lang="ko" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DaisyUI 메뉴 예제</title>
  <link href="https://cdn.jsdelivr.net/npm/daisyui@latest/dist/full.css" rel="stylesheet" type="text/css" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; padding: 20px; background-color: #f0f2f5; }
    #menu-container { box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
  </style>
</head>
<body>
  <h1 class="text-2xl font-bold mb-4">생성된 DaisyUI 메뉴</h1>
  <div class="flex">
     <div id="menu-container" class="mr-4">
       <!-- 메뉴가 여기에 삽입됩니다. -->
     </div>
     <div class="p-4 bg-white rounded-lg shadow-md flex-grow">
       <p class="text-gray-700">메뉴 외 컨텐츠 영역</p>
     </div>
  </div>
  <script src="./your-script-file.js"></script>
</body>
</html>
*/
