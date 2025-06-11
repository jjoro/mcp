document.addEventListener('DOMContentLoaded', () => {
    // 프로그레스 관련 요소 (클래스 기반 선택)
    const infoProgressEl = document.querySelector('.progress'); // 첫 번째 .progress 요소 선택
    const infoTooltipMarkerEl = document.querySelector('.tooltip-marker'); // 첫 번째 .tooltip-marker 요소 선택
    const infoRadialProgressEl = document.querySelector('.radial-progress'); // 첫 번째 .radial-progress 요소 선택
    let currentInfoValue = 0;
    let intervalInfoId;

    // 프로그레스 및 관련 요소 업데이트 함수
    function updateInfoProgress() {
        currentInfoValue += 10;
        if (currentInfoValue > 100) {
            currentInfoValue = 0; // 100을 넘으면 0으로 리셋
        }
        // 프로그레스 바 값 업데이트
        if (infoProgressEl) {
            infoProgressEl.value = currentInfoValue;
        }

        // 툴팁 마커 위치 및 data-tip 업데이트
        if (infoTooltipMarkerEl) {
            infoTooltipMarkerEl.style.left = `${currentInfoValue}%`;
            infoTooltipMarkerEl.setAttribute('data-tip', `${currentInfoValue}%`);
        }

        // 방사형 프로그레스 값 및 텍스트 업데이트
        if (infoRadialProgressEl) {
            infoRadialProgressEl.style.setProperty('--value', currentInfoValue);
            infoRadialProgressEl.textContent = `${currentInfoValue}%`;
        }
    }

    // 프로그레스 관련 요소 시작 함수
    function startInfoProgress() {
        // 이전 인터벌이 있다면 중지
        if (intervalInfoId) {
            clearInterval(intervalInfoId);
        }
        // 요소들이 존재하는지 확인 후 인터벌 시작
        if (infoProgressEl || infoTooltipMarkerEl || infoRadialProgressEl) {
            intervalInfoId = setInterval(updateInfoProgress, 1100); // 1.1초마다 업데이트
        } else {
            console.warn("하나 이상의 프로그레스 관련 요소를 찾을 수 없습니다. 스크립트가 올바르게 실행되지 않을 수 있습니다.");
        }
    }

    // 초기화 버튼 이벤트 리스너
    const resetButton = document.getElementById('resetButton');
    if (resetButton) {
        resetButton.addEventListener('click', () => {
            currentInfoValue = 0;
            if (infoProgressEl) {
                infoProgressEl.value = currentInfoValue;
            }
            if (infoTooltipMarkerEl) {
                infoTooltipMarkerEl.style.left = `${currentInfoValue}%`;
                infoTooltipMarkerEl.setAttribute('data-tip', `${currentInfoValue}%`);
            }
            if (infoRadialProgressEl) {
                infoRadialProgressEl.style.setProperty('--value', currentInfoValue);
                infoRadialProgressEl.textContent = `${currentInfoValue}%`;
            }
            // 진행 중인 인터벌이 있다면 초기화 후 다시 시작
            startInfoProgress();
        });
    }

    // 페이지 로드 시 프로그레스 바 업데이트 시작 및 초기 상태 설정
    if (infoRadialProgressEl) {
        infoRadialProgressEl.style.setProperty('--value', 0);
        infoRadialProgressEl.textContent = `0%`;
    }
    if (infoTooltipMarkerEl) {
        infoTooltipMarkerEl.style.left = `0%`;
        infoTooltipMarkerEl.setAttribute('data-tip', `0%`);
    }
    startInfoProgress();
});