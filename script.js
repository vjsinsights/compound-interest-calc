document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('calculator-form');
    const addContributionBtn = document.getElementById('add-contribution');
    const contributionSegmentsContainer = document.getElementById('contribution-segments');
    const contributionTemplate = document.getElementById('contribution-template');
    const summaryContainer = document.getElementById('summary');
    const growthChartCanvas = document.getElementById('growth-chart').getContext('2d');
    let growthChart;
    let segmentCounter = 1;

    const addContributionSegment = () => {
        segmentCounter++;
        const templateContent = contributionTemplate.content.cloneNode(true);
        const newSegment = templateContent.querySelector('.contribution-segment');
        newSegment.querySelector('h4').textContent = `Contribution Period ${segmentCounter}`;
        contributionSegmentsContainer.appendChild(templateContent);
        
        const removeBtn = newSegment.querySelector('.btn-remove');
        removeBtn.addEventListener('click', () => {
            newSegment.remove();
            // No need to decrement segmentCounter as it just needs to be unique
        });
    };

    const calculateCompoundInterest = (formData) => {
        const { startAmount, contributions } = formData;
        const yearlyData = [];
        let balance = startAmount;
        let totalContributions = 0;
        let cumulativeYears = 0;

        yearlyData.push({ year: 0, balance: startAmount });

        contributions.forEach(period => {
            const periodicInterestRate = (period.interestRate / 100) / period.compoundingFrequency;
            
            for (let year = 1; year <= period.duration; year++) {
                for (let month = 1; month <= 12; month++) {
                    // Apply interest at the end of each compounding period
                    if (month > 0 && month % (12 / period.compoundingFrequency) === 0) {
                        const interest = balance * periodicInterestRate;
                        balance += interest;
                    }

                    // Add contributions
                    if (period.amount > 0 && month > 0 && month % (12 / period.frequency) === 0) {
                        const contribution = period.amount;
                        balance += contribution;
                        totalContributions += contribution;
                    }
                }
                yearlyData.push({ year: cumulativeYears + year, balance });
            }
            cumulativeYears += period.duration;
        });

        return { yearlyData, finalBalance: balance, totalContributions };
    };

    const updateChart = (data) => {
        if (!data || data.length === 0) return;

        const labels = data.map(d => d.year);
        const values = data.map(d => d.balance.toFixed(2));

        if (growthChart) {
            growthChart.destroy();
        }

        growthChart = new Chart(growthChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Investment Growth',
                    data: values,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
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
                                // Show integer labels only
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

    const updateSummary = (finalBalance, totalContributions) => {
        summaryContainer.innerHTML = `
            <h3>Summary</h3>
            <p>Final Amount: <strong>${finalBalance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
            <p>Total Contributions: <strong>${totalContributions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</strong></p>
        `;
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = {
            startAmount: parseFloat(document.getElementById('start-amount').value),
            contributions: Array.from(contributionSegmentsContainer.querySelectorAll('.contribution-segment')).map(segment => ({
                duration: parseInt(segment.querySelector('.duration').value),
                amount: parseFloat(segment.querySelector('.contribution-amount').value),
                frequency: parseInt(segment.querySelector('.contribution-frequency').value),
                interestRate: parseFloat(segment.querySelector('.interest-rate').value),
                compoundingFrequency: parseInt(segment.querySelector('.compounding-frequency').value)
            }))
        };

        const { yearlyData, finalBalance, totalContributions } = calculateCompoundInterest(formData);
        updateChart(yearlyData);
        updateSummary(finalBalance, totalContributions);
    });

    addContributionBtn.addEventListener('click', addContributionSegment);
});
