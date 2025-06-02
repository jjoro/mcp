// DOM이 완전히 로드된 후 스크립트 실행
document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('myBarChart').getContext('2d');

    // X축 레이블 (1월 ~ 12월)
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    
    // Y축 데이터 (1~100 사이의 임의의 값)
    const generateRandomData = () => Array.from({ length: months.length }, () => Math.floor(Math.random() * 100) + 1);

    const data = {
        labels: months,
        datasets: [
            {
                label: '정산', // 데이터셋 레이블: 정산
                data: generateRandomData(),
                backgroundColor: 'rgba(54, 162, 235, 0.6)', // 파란색 계열
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
                borderRadius: 5, // 막대 모서리 둥글게
            },
            {
                label: '청구', // 데이터셋 레이블: 청구
                data: generateRandomData(),
                backgroundColor: 'rgba(255, 99, 132, 0.6)', // 빨간색 계열
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                borderRadius: 5,
            },
            {
                label: '결제', // 데이터셋 레이블: 결제
                data: generateRandomData(),
                backgroundColor: 'rgba(75, 192, 192, 0.6)', // 초록색 계열
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                borderRadius: 5,
            },
            {
                label: '과금', // 데이터셋 레이블: 과금
                data: generateRandomData(),
                backgroundColor: 'rgba(255, 206, 86, 0.6)', // 노란색 계열
                borderColor: 'rgba(255, 206, 86, 1)',
                borderWidth: 1,
                borderRadius: 5,
            }
        ]
    };

    const config = {
        type: 'bar', // 차트 유형: 막대 그래프
        data: data,
        options: {
            responsive: true, // 반응형 설정
            maintainAspectRatio: false, // 컨테이너 크기에 맞춰 비율 조정 안 함 ( 중요! )
            plugins: {
                legend: {
                    position: 'top', // 범례 위치
                    labels: {
                        font: {
                            size: 12 // 범례 폰트 크기
                        },
                        color: '#333' // 범례 텍스트 색상
                    }
                },
                title: {
                    display: true,
                    text: '2025년 월별 현황', // 차트 제목
                    font: {
                        size: 16
                    },
                    color: '#333'
                },
                tooltip: { // 툴팁 설정
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    titleFont: { size: 14 },
                    bodyFont: { size: 12 },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y + ' 건'; // 단위 추가 (예: 건)
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '월', // X축 제목
                        font: {
                            size: 14
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#333' // X축 눈금 색상
                    },
                    grid: {
                        display: false // X축 그리드 라인 숨김
                    }
                },
                y: {
                    beginAtZero: true, // Y축 0부터 시작
                    max: 100, // Y축 최대값
                    title: {
                        display: true,
                        text: '값 (단위: 건)', // Y축 제목
                        font: {
                            size: 14
                        },
                        color: '#333'
                    },
                    ticks: {
                        color: '#333', // Y축 눈금 색상
                        stepSize: 10 // Y축 눈금 간격
                    },
                    grid: {
                        color: '#e0e0e0' // Y축 그리드 라인 색상
                    }
                }
            },
            animation: { // 애니메이션 효과
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    };

    // 새 차트 인스턴스 생성
    const myBarChart = new Chart(ctx, config);
});