// 현재 페이지는 info 스타일
// --- 샘플 데이터 ---
const sampleData = [
    { id: 1, name: "MacBook Pro 17\"", brand: "Apple", color: "Silver", category: "Laptop", price: 2999, image: "https://placehold.co/48x48/E0E0E0/B0B0B0?text=Pro+17" },
    { id: 2, name: "Microsoft Surface Pro", brand: "Microsoft", color: "White", category: "Laptop PC", price: 1999, image: "https://placehold.co/48x48/F0F0F0/A0A0A0?text=Pro" },
    { id: 3, name: "Magic Mouse 2", brand: "Apple", color: "Black", category: "Accessories", price: 99, image: "https://placehold.co/48x48/333333/CCCCCC?text=Acc" },
    { id: 4, name: "Apple Watch Series 7", brand: "Apple", color: "Silver", category: "Accessories", price: 179, image: "https://placehold.co/48x48/E0E0E0/B0B0B0?text=Watch" },
    { id: 5, name: "iPad Air", brand: "Apple", color: "Gold", category: "Tablet", price: 699, image: "https://placehold.co/48x48/FFD700/333333?text=iPad" },
    { id: 6, name: "Apple iMac 27\"", brand: "Apple", color: "Silver", category: "PC Desktop", price: 3999, image: "https://placehold.co/48x48/E0E0E0/B0B0B0?text=iMac" },
    { id: 7, name: "Samsung Galaxy Book", brand: "Samsung", color: "Mystic Silver", category: "Laptop", price: 1499, image: "https://placehold.co/48x48/C0C0C0/333333?text=Galaxy" },
    { id: 8, name: "Dell XPS 15", brand: "Dell", color: "Platinum Silver", category: "Laptop", price: 2199, image: "https://placehold.co/48x48/B0C4DE/000000?text=XPS" },
    { id: 9, name: "Logitech MX Master 3", brand: "Logitech", color: "Graphite", category: "Accessories", price: 99, image: "https://placehold.co/48x48/808080/FFFFFF?text=MX" },
    { id: 10, name: "Sony WH-1000XM4", brand: "Sony", color: "Black", category: "Headphones", price: 348, image: "https://placehold.co/48x48/000000/FFFFFF?text=Sony" },
];

let currentData = [...sampleData];
let currentPage = 1;
const itemsPerPage = 5; // 한 페이지에 보여줄 아이템 수

const tableBody = document.querySelector('#dataTable tbody');
const searchInput = document.getElementById('searchInput');
const selectAllCheckbox = document.getElementById('selectAllCheckbox');
const paginationContainer = document.getElementById('paginationContainer');
const prevPageButton = document.getElementById('prevPage');
const nextPageButton = document.getElementById('nextPage');
const showingFrom = document.getElementById('showingFrom');
const showingTo = document.getElementById('showingTo');
const totalEntries = document.getElementById('totalEntries');

// --- 테이블 렌더링 함수 ---
function renderTable(dataToRender) {
    tableBody.innerHTML = ''; // 기존 내용 초기화
    if (dataToRender.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No items found.</td></tr>';
        return;
    }

    dataToRender.forEach(item => {
        const row = `
        <tr>
            <td class="p-4"><label><input type="checkbox" class="checkbox checkbox-sm row-checkbox" data-id="${item.id}" /></label></td>
            <td class="p-4">
                <div class="flex items-center space-x-3">
                    <div class="avatar">
                        <div class="mask mask-squircle w-12 h-12">
                            <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null;this.src='https://placehold.co/48x48/CCCCCC/999999?text=Error';" />
                        </div>
                    </div>
                    <div>
                        <div class="font-bold">${item.name}</div>
                        <div class="text-sm opacity-50">${item.brand}</div>
                    </div>
                </div>
            </td>
            <td class="p-4">${item.color}</td>
            <td class="p-4"><span class="badge badge-ghost badge-sm">${item.category}</span></td>
            <td class="p-4 text-right">$${item.price.toLocaleString()}</td>
            <td class="p-4 text-center"><button class="btn btn-ghost btn-xs">Edit</button></td>
        </tr>
    `;
        tableBody.insertAdjacentHTML('beforeend', row);
    });
    updateSelectionState();
}

// --- 페이지네이션 렌더링 함수 ---
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    paginationContainer.innerHTML = ''; // 기존 페이지네이션 버튼 초기화

    // 이전 페이지 버튼
    const prevBtn = document.createElement('button');
    prevBtn.className = 'join-item btn btn-sm btn-outline';
    prevBtn.innerHTML = '«';
    prevBtn.id = 'prevPage';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayPage(currentPage);
        }
    });
    paginationContainer.appendChild(prevBtn);

    // 페이지 번호 버튼
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = 'join-item btn btn-sm';
        pageButton.textContent = i;
        pageButton.dataset.page = i;
        if (i === currentPage) {
            pageButton.classList.add('btn-info');
        } else {
            pageButton.classList.add('btn-outline');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayPage(currentPage);
        });
        paginationContainer.appendChild(pageButton);
    }

    // 다음 페이지 버튼
    const nextBtn = document.createElement('button');
    nextBtn.className = 'join-item btn btn-sm btn-outline';
    nextBtn.innerHTML = '»';
    nextBtn.id = 'nextPage';
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayPage(currentPage);
        }
    });
    paginationContainer.appendChild(nextBtn);
    updatePaginationInfo(totalItems);
}

// --- 페이지 정보 업데이트 함수 ---
function updatePaginationInfo(totalItems) {
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    showingFrom.textContent = startItem;
    showingTo.textContent = endItem;
    totalEntries.textContent = totalItems;
}

// --- 특정 페이지 표시 함수 ---
function displayPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = currentData.slice(start, end);
    renderTable(paginatedData);
    renderPagination(currentData.length); // 전체 데이터 기준으로 페이지네이션 다시 그림
}

// --- 검색 기능 ---
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    currentData = sampleData.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.brand.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm) ||
        item.color.toLowerCase().includes(searchTerm)
    );
    currentPage = 1; // 검색 시 첫 페이지로
    displayPage(currentPage);
});

// --- 전체 선택/해제 기능 ---
selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = tableBody.querySelectorAll('.row-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = e.target.checked;
    });
});

// --- 개별 체크박스 상태에 따른 전체 선택 체크박스 상태 업데이트 ---
function updateSelectionState() {
    const checkboxes = tableBody.querySelectorAll('.row-checkbox');
    const allChecked = checkboxes.length > 0 && Array.from(checkboxes).every(cb => cb.checked);
    const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

    selectAllCheckbox.checked = allChecked;
    // 부분 선택 시 indeterminate 상태 (선택 사항)
    // selectAllCheckbox.indeterminate = anyChecked && !allChecked;

    // 개별 체크박스 이벤트 리스너 (동적 생성된 요소에 대한 이벤트 위임)
    checkboxes.forEach(checkbox => {
        checkbox.removeEventListener('change', handleRowCheckboxChange); // 기존 리스너 제거
        checkbox.addEventListener('change', handleRowCheckboxChange); // 새 리스너 추가
    });
}

function handleRowCheckboxChange() {
    updateSelectionState();
}


// --- 초기 로드 ---
displayPage(currentPage);