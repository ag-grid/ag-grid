import { agGridVersion, agChartsVersion } from 'utils/consts';

export const getHeaderTitle = (title, framework = 'javascript', isCharts = false) =>
    `${isCharts ? 'AG Charts' : 'AG Grid'} (${getFrameworkPart(framework, isCharts)}): ${title}`;

const getFrameworkPart = (framework, isCharts = false) => {
    if (framework === 'react' && !isCharts) {
        return 'React Table';
    }

    return `${getFrameworkName(framework)} ${isCharts ? 'Charts' : 'Grid'}`;
};

export const getFrameworkName = framework => {
    const mappings = {
        javascript: 'JavaScript',
        angular: 'Angular',
        react: 'React',
        vue: 'Vue',
    };

    return mappings[framework];
};

export const getGridVersionMessage = framework => `Download v${agGridVersion.split('.')[0]} of the best ${getFrameworkPart(framework, false)} in the world now.`;
export const getChartsVersionMessage = framework => `Download v${agChartsVersion.split('.')[0]} of our ${getFrameworkPart(framework, true)} now.`;