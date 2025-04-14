function allPropertiesAreTruthy(entries: Record<string, object>, property: string) {
    return entries.every(([_, data]) => {
        return data[property];
    });
}

export function transformData(data) {
    return Object.values(data).map((frameworkExamples) => {
        const frameworkEntries = Object.entries(frameworkExamples);
        const [_, { pageName, exampleName }] = frameworkEntries[0];
        const isEnterprise = allPropertiesAreTruthy(frameworkEntries, 'isEnterprise');
        const isIntegratedCharts = allPropertiesAreTruthy(frameworkEntries, 'isIntegratedCharts');
        const isLocale = allPropertiesAreTruthy(frameworkEntries, 'isLocale');
        const hasExampleConsoleLog = allPropertiesAreTruthy(frameworkEntries, 'hasExampleConsoleLog');

        return {
            id: `${pageName}-${exampleName}`,
            pageName,
            exampleName,
            isEnterprise,
            isIntegratedCharts,
            isLocale,
            hasExampleConsoleLog,
            frameworkExamples,
        };
    });
}
