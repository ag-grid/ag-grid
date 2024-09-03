import { VERSION } from '@ag-grid-community/theming';
import { convertProductionUrlsForStaging } from '@components/theme-builder/model/utils';
import styled from '@emotion/styled';

import { useRenderedTheme } from '../../model/rendered-theme';
import { UIPopupButton } from './UIPopupButton';

export const DownloadThemeButton = () => (
    <ButtonWrapper>
        <UIPopupButton placement="right-end" dropdownContent={<DownloadThemeDialog />} variant="primary">
            {downloadIcon} Download Theme
        </UIPopupButton>
    </ButtonWrapper>
);

export const installDocsUrl = 'https://www.ag-grid.com/javascript-data-grid/applying-theme-builder-styling-grid/';

const fileHeader = `/*
 * This file is a theme downloaded from the AG Grid Theme Builder for AG Grid ${VERSION}.
 *
 * See installation docs at ${installDocsUrl}
 */

`;

const localInstallDocsUrl = convertProductionUrlsForStaging(installDocsUrl);

const DownloadThemeDialog = () => {
    const theme = useRenderedTheme();
    const downloadLink = `data:text/css;charset=utf-8,${encodeURIComponent(convertProductionUrlsForStaging(fileHeader + theme.getCSS()))}`;

    return (
        <DownloadThemeWrapper>
            <Header>Download Theme</Header>
            <Paragraph>
                Download a CSS file to integrate into an application. See{' '}
                <a href={localInstallDocsUrl} target="_blank">
                    Applying Theme Builder Styling to AG Grid
                </a>{' '}
                for instructions on how to use the file.
            </Paragraph>
            <DownloadLink href={downloadLink} download="ag-grid-theme-builder.css">
                {downloadIcon} Download CSS File
            </DownloadLink>
        </DownloadThemeWrapper>
    );
};

const Header = styled('div')`
    font-size: 1.2em;
    font-weight: 600;
`;

const Paragraph = styled('div')``;

const DownloadThemeWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 16px;
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
