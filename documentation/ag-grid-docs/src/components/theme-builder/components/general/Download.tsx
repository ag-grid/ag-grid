import { gridVersionTieWarning, installDocsUrl } from '@ag-grid-community/theming';
import { Alert } from '@ag-website-shared/components/alert/Alert';
import styled from '@emotion/styled';

import { useRenderedTheme } from '../../model/rendered-theme';
import { UIPopupButton } from './UIPopupButton';

export const DownloadThemeButton = () => (
    <UIPopupButton dropdownContent={<DownloadThemeDialog />} variant="primary">
        {downloadIcon}
    </UIPopupButton>
);

const DownloadThemeDialog = () => {
    const theme = useRenderedTheme();
    const downloadLink = `data:text/css;charset=utf-8,${encodeURIComponent(theme.css)}`;

    return (
        <DownloadThemeWrapper>
            <Header>Download Theme</Header>
            <Paragraph>
                Download a CSS file to integrate into an application. See the{' '}
                <a href={installDocsUrl} target="_blank">
                    integration documentation
                </a>{' '}
                for instructions on how to use the file.
            </Paragraph>
            <StyledAlert type="info">
                <b>Note</b>: {gridVersionTieWarning}
            </StyledAlert>
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

const StyledAlert = styled(Alert)`
    margin: 5px 0;
`;

const DownloadThemeWrapper = styled('div')`
    display: flex;
    flex-direction: column;
    gap: 16px;
    width: 400px;
`;

const DownloadLink = styled('a')`
    display: flex;
    gap: 10px;
    margin: 0 auto;
`;

const downloadIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" fill="none">
        <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 15V1m0 14L2 9m6 6 6-6m1 10H1"
        />
    </svg>
);
