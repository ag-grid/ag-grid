import styled from '@emotion/styled';

import { ThemeImportExportDialog } from './ThemeImportExportDialog';
import { UIPopupButton } from './UIPopupButton';

const hasImportHash = () => typeof window !== 'undefined' && window.location.hash === '#import';

export const GetThemeButton = () => (
    <ButtonWrapper>
        <UIPopupButton
            allowedPlacements={['right-end']}
            dropdownContent={(close) => (
                <ThemeImportExportDialog close={close} initialTab={hasImportHash() ? 'Import' : 'Export'} />
            )}
            variant="primary"
            initialOpen={hasImportHash()}
            onClose={() => {
                if (hasImportHash()) {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            }}
        >
            {downloadIcon} Import / Export
        </UIPopupButton>
    </ButtonWrapper>
);

const ButtonWrapper = styled('div')`
    width: 100%;
    margin-right: 24px;
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
