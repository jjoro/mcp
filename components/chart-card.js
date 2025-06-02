// --- Pure Helper Functions ---
const generateRandomArray = (length, max = 100) =>
    Array.from({ length }, () => Math.floor(Math.random() * max) + 1);

const CHART_COLORS = [
    { background: 'rgba(75, 192, 192, 0.7)', border: 'rgba(75, 192, 192, 1)' },  // Main Income Color (Teal/Green)
    { background: 'rgba(255, 99, 132, 0.7)', border: 'rgba(255, 99, 132, 1)' },  // Main Expense Color (Red)
    { background: 'rgba(54, 162, 235, 0.7)', border: 'rgba(54, 162, 235, 1)' }, // Blue
    { background: 'rgba(255, 206, 86, 0.7)', border: 'rgba(255, 206, 86, 1)' },  // Yellow
    { background: 'rgba(153, 102, 255, 0.7)', border: 'rgba(153, 102, 255, 1)' }, // Purple
    { background: 'rgba(255, 159, 64, 0.7)', border: 'rgba(255, 159, 64, 1)' }   // Orange
];
const getDatasetColors = (index, type) => {
        // For 'Income' and 'Expense' type charts, use specific colors
    if (type === 'income') return CHART_COLORS[0]; // Teal/Green for income
    if (type === 'expense') return CHART_COLORS[1]; // Red for expense
    return CHART_COLORS[index % CHART_COLORS.length];
}

// --- Pure Chart Configuration Functions ---
const createDatasetConfig = (label, data, colorObject, chartType) => {
    const isHorizontalBar = chartType === 'horizontalBar'; // Specific check for horizontal bar
    return {
        label,
        data,
        backgroundColor: (chartType === 'line' || chartType === 'radar') ? colorObject.border : colorObject.background,
        borderColor: colorObject.border,
        borderWidth: (chartType === 'line' || chartType === 'radar') ? 2 : 1,
        borderRadius: (chartType === 'bar' && !isHorizontalBar) ? { topLeft: 5, topRight: 5, bottomLeft: 0, bottomRight: 0 } : (isHorizontalBar ? { topRight: 5, bottomRight: 5, topLeft:0, bottomLeft:0 } : undefined),
        barThickness: isHorizontalBar ? 15 : undefined, // Adjust bar thickness for horizontal bars
        tension: (chartType === 'line') ? 0.4 : undefined, // Smoother lines
        fill: (chartType === 'line') ? false : (chartType === 'radar' ? 'origin' : undefined),
        indexAxis: isHorizontalBar ? 'y' : 'x', // Set axis for horizontal bar
    };
};

const createChartOptions = (titleText, xAxisLabelText, yAxisLabelText, chartType) => {
    const isHorizontalBar = chartType === 'horizontalBar';
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: isHorizontalBar ? 'y' : 'x', // Crucial for horizontal bar
        plugins: {
            legend: {
                display: (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea' || isHorizontalBar), // Show legend for circular and horizontal
                position: isHorizontalBar ? 'bottom' : 'top',
                labels: { font: { size: 11 }, color: '#4b5563', boxWidth: 15, padding:15 }
            },
            title: {
                display: !!titleText && !isHorizontalBar, // Hide title if horizontalBar, as it's in card
                text: titleText,
                font: { size: 16, weight: '600' }, /* semibold */
                color: '#374151', /* gray-700 */
                padding: { top: 5, bottom: 15 }
            },
            tooltip: {
                backgroundColor: 'rgba(0,0,0,0.8)',
                titleFont: { size: 13 }, bodyFont: { size: 11 },
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || context.label || '';
                        if (label) { label += ': '; }
                        const value = (chartType === 'pie' || chartType === 'doughnut' || chartType === 'polarArea') ? context.raw : (isHorizontalBar ? context.raw : (chartType === 'radar' ? context.parsed.r : context.parsed.y));
                        label += typeof value === 'number' ? value.toLocaleString() : value; // Format number
                        return label;
                    }
                }
            }
        },
        scales: (chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'polarArea' && chartType !== 'radar') ? {
            x: {
                title: { display: !!xAxisLabelText && !isHorizontalBar, text: xAxisLabelText, font: { size: 12 }, color: '#4b5563' },
                ticks: { color: '#6b7280', font: {size: 10} }, /* gray-500 */
                grid: { display: isHorizontalBar, drawBorder: false, color: '#e5e7eb' }, // Show grid for Y in horizontalBar
                    stacked: chartType === 'bar' || isHorizontalBar // Enable stacking if it's a bar chart
            },
            y: {
                title: { display: !!yAxisLabelText && !isHorizontalBar, text: yAxisLabelText, font: { size: 12 }, color: '#4b5563' },
                ticks: { color: '#6b7280', font: {size: 10} },
                grid: { display: !isHorizontalBar, drawBorder: false, color: '#e5e7eb' }, // Show grid for X in normal charts
                beginAtZero: true,
                stacked: chartType === 'bar' || isHorizontalBar // Enable stacking
            }
        } : undefined,
            ...(chartType === 'radar' && {
            scales: {
                r: {
                    angleLines: { display: true, color: '#d1d5db' }, /* gray-300 */
                    suggestedMin: 0,
                    pointLabels: { font: { size: 11 }, color: '#4b5563' },
                    ticks: { backdropColor: 'transparent', font: {size:9} },
                    grid: { color: '#e5e7eb' } /* gray-200 */
                }
            }
        }),
        animation: { duration: 800, easing: 'easeInOutQuart' }
    };
        // Specific adjustments for horizontalBar
    if (isHorizontalBar) {
        options.scales.x.grid.display = true; // Horizontal lines
        options.scales.y.grid.display = false; // No vertical lines
    }
    return options;
};


const createChartConfiguration = (type, labels, datasets, options) => ({
    type: type === 'horizontalBar' ? 'bar' : type, // Chart.js uses 'bar' type for horizontal bars with indexAxis: 'y'
    data: { labels, datasets },
    options
});

// --- DOM Interaction and Chart Lifecycle ---
const renderNewChart = (canvasId, config, chartInstanceRef) => {
    if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
    }
    const ctx = document.getElementById(canvasId)?.getContext('2d');
    if (ctx) {
        chartInstanceRef.current = new Chart(ctx, config);
    } else {
        console.error(`Canvas with id '${canvasId}' not found.`);
        displayErrorMessage(`차트 캔버스를 찾을 수 없습니다: ${canvasId}`);
    }
};

const updateCardDisplay = (data) => {
    // data object: { chartTitle, profit, profitRate, income, expense, period, reportLinkText }
    document.getElementById('chartCardTitle').textContent = data.chartTitle || '데이터 분석'; // Main title for chart area
    document.getElementById('profitValueDisplay').textContent = data.profit ? `$${data.profit.toLocaleString()}` : '$0';
    const profitRateEl = document.getElementById('profitRateDisplay');
    profitRateEl.innerHTML = `<i class="fas fa-arrow-up"></i> Profit rate ${data.profitRate || 0}%`;
    document.getElementById('incomeValueDisplay').textContent = data.income ? `$${data.income.toLocaleString()}` : '$0';
    document.getElementById('expenseValueDisplay').textContent = data.expense ? `-$${data.expense.toLocaleString()}` : '-$0';
    document.getElementById('periodDisplay').textContent = data.period || 'Last 6 months';
    // document.getElementById('reportLink').textContent = data.reportLinkText || 'REVENUE REPORT'; // If link text is dynamic
};

const displayErrorMessage = (message) => {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
};
const clearErrorMessage = () => {
    document.getElementById('errorMessage').style.display = 'none';
};
const setLoadingState = (isLoading) => {
    document.getElementById('loadingIndicator').style.display = isLoading ? 'flex' : 'none';
};

// --- Gemini API Interaction ---
const GEMINI_CHART_SCHEMA = {
    type: "OBJECT",
    properties: {
        "chartType": {
            "type": "STRING",
            "description": "Chart type. Examples: 'bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'horizontalBar'. Default 'bar'. For horizontal bar, use 'horizontalBar'.",
            "enum": ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea', 'horizontalBar']
        },
        "chartTitle": { "type": "STRING", "description": "Chart title. Example: '분기별 판매량'." },
        "xAxisLabel": { "type": "STRING", "description": "X-axis label. Optional. Example: '월'." },
        "yAxisLabel": { "type": "STRING", "description": "Y-axis label. Optional. Example: '판매량 (개)'." },
        "labels": { "type": "ARRAY", "items": { "type": "STRING" }, "description": "Data labels (e.g., ['1월', '2월']). Required." },
        "datasets": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "label": { "type": "STRING", "description": "Dataset name (e.g., '제품 A'). Required." },
                    "data": { "type": "ARRAY", "items": { "type": "NUMBER" }, "description": "Numerical data. Must match 'labels' length. Required." }
                },
                "required": ["label", "data"]
            },
            "description": "Array of dataset objects. Required."
        },
        // Added fields for the new card design
        "profit": {"type": "NUMBER", "description": "Overall profit value. Example: 5405. Optional."},
        "profitRate": {"type": "NUMBER", "description": "Profit rate in percentage. Example: 23.5. Optional."},
        "income": {"type": "NUMBER", "description": "Total income value. Example: 23635. Optional."},
        "expense": {"type": "NUMBER", "description": "Total expense value. Example: 18230. Optional."},
        "periodDescription": {"type": "STRING", "description": "Text for the period display, e.g., 'Last 6 months'. Optional."}
    },
    "required": ["chartType", "chartTitle", "labels", "datasets"]
};

const fetchChartDataFromGemini = async (promptText) => {
    const apiKey = "";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const fullPrompt = `
You are a helpful assistant that generates chart data specifications in JSON.
Based on the user's request, provide a JSON object that conforms to the provided schema.
User's request: "${promptText}"
For 'horizontalBar' chartType, ensure datasets are appropriate (e.g., income vs expense per category).
The 'labels' array represents categories or time points along the y-axis for 'horizontalBar'.
The 'data' array in each dataset corresponds to these labels for the x-axis values.
If the user asks for a chart like "수익과 지출을 월별로 보여주는 가로 막대 차트", the labels should be months, and datasets should be '수익' and '지출'.

Strictly adhere to the following JSON schema for your response:
${JSON.stringify(GEMINI_CHART_SCHEMA, null, 2)}
`;
    const payload = {
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: GEMINI_CHART_SCHEMA }
    };
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Gemini API request failed: ${response.status}. ${errorBody}`);
        }
        const result = await response.json();
        if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
            const parsedJson = JSON.parse(result.candidates[0].content.parts[0].text);
            // Validation
            if (!parsedJson.chartType || !parsedJson.labels || !parsedJson.datasets || !parsedJson.chartTitle) {
                    throw new Error("Gemini response missing required fields (chartType, labels, datasets, chartTitle).");
            }
            parsedJson.datasets.forEach((ds, i) => {
                if (!ds.data || !ds.label) throw new Error(`Dataset ${i} missing 'data' or 'label'.`);
                if (ds.data.length !== parsedJson.labels.length) throw new Error(`Data length mismatch for dataset '${ds.label}'.`);
            });
            return parsedJson;
        }
        throw new Error("Unexpected Gemini API response structure.");
    } catch (error) {
        console.error('Error with Gemini API:', error);
        displayErrorMessage(`Gemini API 오류: ${error.message}`);
        return null;
    }
};

// --- Application Setup and Event Handlers ---
const chartInstanceRef = { current: null };

const initializeDefaultChart = () => {
    const defaultMonths = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const defaultIncomeData = generateRandomArray(defaultMonths.length, 2500);
    const defaultExpenseData = generateRandomArray(defaultMonths.length, 2000);

    const datasets = [
        createDatasetConfig('Income', defaultIncomeData, getDatasetColors(0, 'income'), 'horizontalBar'),
        createDatasetConfig('Expense', defaultExpenseData, getDatasetColors(1, 'expense'), 'horizontalBar')
    ];
    const options = createChartOptions(
        null, // Title handled by card
        'Value ($)', // X-axis for horizontalBar
        'Month',     // Y-axis for horizontalBar
        'horizontalBar'
    );
    const config = createChartConfiguration('horizontalBar', defaultMonths, datasets, options);
    renderNewChart('dynamicChart', config, chartInstanceRef);
    
    const totalIncome = defaultIncomeData.reduce((sum, val) => sum + val, 0);
    const totalExpense = defaultExpenseData.reduce((sum, val) => sum + val, 0);
    const profit = totalIncome - totalExpense;
    const profitRate = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0;

    updateCardDisplay({
        chartTitle: '월별 수익 및 지출 현황 (기본)',
        profit: profit,
        profitRate: profitRate,
        income: totalIncome,
        expense: totalExpense,
        period: 'Last 6 months (기본)'
    });
};

const handleGenerateChart = async () => {
    const promptInput = document.getElementById('promptInput');
    const promptText = promptInput.value.trim();
    if (!promptText) {
        displayErrorMessage("프롬프트를 입력해주세요.");
        return;
    }
    clearErrorMessage();
    setLoadingState(true);

    const chartData = await fetchChartDataFromGemini(promptText);
    if (chartData) {
        try {
            const { chartType, chartTitle, xAxisLabel, yAxisLabel, labels, datasets: geminiDatasets,
                    profit, profitRate, income, expense, periodDescription } = chartData;

            const chartJSDatasets = geminiDatasets.map((ds, index) => {
                let colorType = null;
                if (ds.label.toLowerCase().includes('income') || ds.label.toLowerCase().includes('수익')) colorType = 'income';
                if (ds.label.toLowerCase().includes('expense') || ds.label.toLowerCase().includes('지출')) colorType = 'expense';
                return createDatasetConfig(ds.label, ds.data, getDatasetColors(index, colorType), chartType);
            });

            const options = createChartOptions(chartTitle, xAxisLabel, yAxisLabel, chartType);
            const config = createChartConfiguration(chartType, labels, chartJSDatasets, options);
            
            renderNewChart('dynamicChart', config, chartInstanceRef);
            updateCardDisplay({
                chartTitle: chartTitle, // This is now the title above the chart area
                profit: profit,
                profitRate: profitRate,
                income: income,
                expense: expense,
                period: periodDescription
            });
            promptInput.value = "";
        } catch (error) {
                console.error("Error processing chart data from Gemini:", error);
                displayErrorMessage(`차트 데이터 처리 중 오류 발생: ${error.message}`);
        }
    }
    setLoadingState(false);
};

document.addEventListener('DOMContentLoaded', () => {
    initializeDefaultChart();
    document.getElementById('generateChartBtn')?.addEventListener('click', handleGenerateChart);
});