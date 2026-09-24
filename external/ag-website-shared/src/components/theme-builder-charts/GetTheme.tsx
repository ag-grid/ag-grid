import { ImportExportButton } from '@ag-website-shared/components/theme-builder/ImportExportButton';
import styled from '@emotion/styled';
import { useMemo } from 'react';

import { validateChartsThemeCode } from './chartsThemeImport';
import { type ChartsThemeSelection, renderChartsThemeCode } from './chartsThemeOutput';

/**
 * The way in and out of the tool. The shared dialog takes the code to show and
 * the parser to read it back as props, an AG Charts theme being a plain options
 * object rather than a `withParams` chain - the only part that differs.
 */
export const GetThemeButton = ({ selection }: { selection: ChartsThemeSelection }) => {
    const exportCode = useMemo(() => renderChartsThemeCode(selection), [selection]);

    return (
        <ImportExportButton
            allowedPlacements={['right-end']}
            dialogProps={{
                exportCode,
                downloadFileName: 'ag-charts-theme-builder.js',
                validateImport: validateChartsThemeCode,
                importPlaceholder: IMPORT_PLACEHOLDER,
                helpText: <HelpText />,
                // Not the viewport: the builder's root clips its overflow, so the
                // popup's room is the tool's own height, which floating-ui's size
                // middleware measures and publishes.
                maxHeight: 'calc(var(--popup-available-height, 100vh) - 40px)',
            }}
        />
    );
};

const IMPORT_PLACEHOLDER =
    'Paste your theme code here:\n\nexport const myTheme = {\n    params: { ... },\n    palette: { ... },\n};';

/** Charts' own: there is no charts Theme Builder docs page to link to yet. */
const HelpText = () => (
    <Paragraph>
        Pass this theme to the <code>theme</code> option of your chart to apply everything you have chosen here, or
        paste a theme back in to carry on from it.
    </Paragraph>
);

const Paragraph = styled('div')`
    code {
        font-family: var(--text-monospace-font-family);
    }
`;
