// Source: https://www.ons.gov.uk/businessindustryandtrade/itandinternetindustry/datasets/internetusers
export function getData(): any[] {
    return [
        { area: 'North East', usedInLast3Months: 1871, usedOver3MonthsAgo: 54, neverUsed: 186 },
        { area: 'North West', usedInLast3Months: 5213, usedOver3MonthsAgo: 101, neverUsed: 474 },
        { area: 'Yorkshire and the Humber', usedInLast3Months: 3908, usedOver3MonthsAgo: 66, neverUsed: 375 },
        { area: 'East Midlands', usedInLast3Months: 3442, usedOver3MonthsAgo: 64, neverUsed: 317 },
        { area: 'West Midlands', usedInLast3Months: 4127, usedOver3MonthsAgo: 102, neverUsed: 421 },
        { area: 'East of England', usedInLast3Months: 4553, usedOver3MonthsAgo: 64, neverUsed: 330 },
        { area: 'London', usedInLast3Months: 6578, usedOver3MonthsAgo: 79, neverUsed: 403 },
        { area: 'South East', usedInLast3Months: 6757, usedOver3MonthsAgo: 88, neverUsed: 418 },
        { area: 'South West', usedInLast3Months: 4166, usedOver3MonthsAgo: 74, neverUsed: 267 },
        { area: 'Wales', usedInLast3Months: 2265, usedOver3MonthsAgo: 26, neverUsed: 236 },
        { area: 'Scotland', usedInLast3Months: 3979, usedOver3MonthsAgo: 73, neverUsed: 386 },
        { area: 'Northern Ireland', usedInLast3Months: 1271, usedOver3MonthsAgo: 15, neverUsed: 178 },
    ];
}
