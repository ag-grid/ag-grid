import type { Theme } from '@ag-grid-community/theming';
import Code from '@ag-website-shared/components/code/Code';
import styled from '@emotion/styled';
import { useMemo } from 'react';

import { camelCase } from '../../../../../../../community-modules/theming/src/theme-utils';
import { type RenderedThemeInfo, useRenderedThemeInfo } from '../../model/rendered-theme';
import { UIPopupButton } from './UIPopupButton';

export const DownloadThemeButton = () => (
    <ButtonWrapper>
        <UIPopupButton allowedPlacements={['right-end']} dropdownContent={<DownloadThemeDialog />} variant="primary">
            {downloadIcon} Get Theme
        </UIPopupButton>
    </ButtonWrapper>
);

export const installDocsUrl = 'https://www.ag-grid.com/javascript-data-grid/applying-theme-builder-styling-grid/';

const DownloadThemeDialog = () => {
    const theme = useRenderedThemeInfo();
    const codeSample = useMemo(() => renderThemeCodeSample(theme), [theme]);
    const downloadLink = `data:text/css;charset=utf-8,${encodeURIComponent(codeSample)}`;

    return (
        <DownloadThemeWrapper>
            <Header>Apply this theme in your application</Header>
            <Paragraph>
                Copy the code below into your application to use this theme. See the{' '}
                <a href="/react-data-grid/theming-api/" target="_blank">
                    Theming API documentation
                </a>{' '}
                for more information.
            </Paragraph>
            <Selectable>
                <Code code={codeSample} language="js" />
            </Selectable>
            <DownloadLink href={downloadLink} download="ag-grid-theme-builder.css">
                {downloadIcon} Download CSS File
            </DownloadLink>
        </DownloadThemeWrapper>
    );
};

const renderThemeCodeSample = ({ overriddenParams, usedParts }: RenderedThemeInfo): string => {
    const imports = ['themeQuartz'];
    let code = '';
    code += `// to use myTheme in an application, pass it to the theme grid option\n`;
    const paramsJSON = JSON.stringify(overriddenParams, null, 4);
    code += `const myTheme = themeQuartz\n`;
    for (const part of usedParts) {
        const partImport = camelCase(part.id);
        code += `\t.usePart(${partImport})\n`;
        imports.push(partImport);
    }
    code += `\t.overrideParams(${paramsJSON.replaceAll('\n', '\n\t')})\n`;
    code += `;\n`;
    code = `import { ${imports.join(', ')} } from '@ag-grid-community/theming';\n\n${code}`;

    return code;
};

const Header = styled('div')`
    font-size: 1.2em;
    font-weight: 600;
`;

const Selectable = styled('div')`
    user-select: all;

    .code {
        max-height: 500px;
        overflow: auto;
    }
`;

const Paragraph = styled('div')``;

const DownloadThemeWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 700px;
    width: 1060px;
    max-width: calc(100vw - 100px);
`;

const ButtonWrapper = styled('div')`
    width: 100%;
    margin-right: 24px;
`;

const DownloadLink = styled('a')`
    display: flex;
    gap: 10px;
    margin: 0 auto;
`;

const downloadIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M2.5 10c0 1.885 0 2.829.586 3.414C3.671 14 4.615 14 6.5 14h4c1.885 0 2.829 0 3.414-.586.586-.585.586-1.529.586-3.414m-6-8v8.667m0 0 2.667-2.917M8.5 10.667 5.833 7.75"
        />
    </svg>
);
