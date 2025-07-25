document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const addContributionBtn = document.getElementById('add-contribution');
    const contributionSegmentsContainer = document.getElementById('contribution-segments');
    const contributionTemplate = document.getElementById('contribution-template');
    const summaryContainer = document.getElementById('summary');
    const growthChartCanvas = document.getElementById('growth-chart').getContext('2d');
    const contributionTimingSelect = document.getElementById('contribution-timing');
    let growthChart;

    const renumberContributionSegments = () => {
        const segments = contributionSegmentsContainer.querySelectorAll('.contribution-segment');
        segments.forEach((segment, index) => {
            segment.querySelector('h4').textContent = `Contribution Period ${index + 1}`;
        });
    };

    const addContributionSegment = () => {
        const templateContent = contributionTemplate.content.cloneNode(true);
        const newSegment = templateContent.querySelector('.contribution-segment');
        contributionSegmentsContainer.appendChild(templateContent);

        newSegment.querySelector('.btn-remove').addEventListener('click', () => {
            newSegment.remove();
            renumberContributionSegments();
        });

        renumberContributionSegments();
    };

    const calculateCompoundInterest = (formData) => {
        const { startAmount, contributions, contributionTiming } = formData;
        const yearlyData = [];
        let balance = startAmount;
        let totalContributions = 0;
        let cumulativeYears = 0;

        yearlyData.push({ year: 0, balance: startAmount, totalContributions: 0 });

        contributions.forEach(period => {
            const periodicInterestRate = (period.interestRate / 100) / period.compoundingFrequency;
            const totalMonthsInPeriod = period.duration * 12;

            for (let month = 1; month <= totalMonthsInPeriod; month++) {
                const isContributionMonth = period.amount > 0 && period.frequency > 0 && month % (12 / period.frequency) === 0;
                const isCompoundingMonth = month % (12 / period.compoundingFrequency) === 0;

                if (isContributionMonth && contributionTiming === 'beginning') {
                    balance += period.amount;
                    totalContributions += period.amount;
                }

                if (isCompoundingMonth) {
                    balance += balance * periodicInterestRate;
                }

                if (isContributionMonth && contributionTiming === 'end') {
                    balance += period.amount;
                    totalContributions += period.amount;
                }

                if (month % 12 === 0) {
                    yearlyData.push({ year: cumulativeYears + (month / 12), balance, totalContributions });
                }
            }
            cumulativeYears += period.duration;
        });

        return { yearlyData, finalBalance: balance, totalContributions };
    };

    const updateChart = (data, startAmount) => {
        if (!data || data.length === 0) return;

        const labels = data.map(d => d.year);
        const investmentValues = data.map(d => d.balance.toFixed(2));
        const contributionValues = data.map(d => (d.totalContributions + startAmount).toFixed(2));

        if (growthChart) {
            growthChart.destroy();
        }

        growthChart = new Chart(growthChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Investment Growth',
                    data: investmentValues,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.1
                }, {
                    label: 'Total Contributions',
                    data: contributionValues,
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Years'
                        },
                        ticks: {
                            maxTicksLimit: 20,
                            callback: function(value, index, values) {
                                if (Math.floor(value) === value) {
                                    return value;
                                }
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Balance ($)'
                        }
                    }
                }
            }
        });
    };

    const updateSummary = (finalBalance, totalContributions, startAmount) => {
        const totalInterest = finalBalance - totalContributions - startAmount;
        summaryContainer.innerHTML = `
            <h3>Summary</h3>
            <p>Final Amount: <strong>$${finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
            <p>Total Contributions: <strong>$${totalContributions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
            <p>Total Interest: <strong>$${totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
        `;
    };

    const calculateAndDisplay = () => {
        const startAmount = parseFloat(document.getElementById('start-amount').value) || 0;
        const formData = {
            startAmount: startAmount,
            contributions: Array.from(contributionSegmentsContainer.querySelectorAll('.contribution-segment')).map(segment => ({
                duration: parseFloat(segment.querySelector('.duration').value) || 0,
                amount: parseFloat(segment.querySelector('.contribution-amount').value) || 0,
                frequency: parseInt(segment.querySelector('.contribution-frequency').value),
                interestRate: parseFloat(segment.querySelector('.interest-rate').value) || 0,
                compoundingFrequency: parseInt(segment.querySelector('.compounding-frequency').value)
            })),
            contributionTiming: contributionTimingSelect.value
        };

        const { yearlyData, finalBalance, totalContributions } = calculateCompoundInterest(formData);
        updateChart(yearlyData, startAmount);
        updateSummary(finalBalance, totalContributions, startAmount);
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateAndDisplay();
    });

    addContributionBtn.addEventListener('click', addContributionSegment);

    calculateAndDisplay();
});