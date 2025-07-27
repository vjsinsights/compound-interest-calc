export function calculateCompoundInterest(formData) {
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
}

