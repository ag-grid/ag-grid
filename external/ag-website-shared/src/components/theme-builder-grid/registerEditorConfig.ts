import { setThemeBuilderDocsUrl } from '@ag-website-shared/components/theme-builder-grid/components/general/ThemeImportExportDialog';
import { setFontFamilyOptions } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { setImageValuesDocsUrl } from '@ag-website-shared/components/theme-builder/ImageValueEditor';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

setFontFamilyOptions([
    {
        label: 'System',
        value: [
            '-apple-system',
            'BlinkMacSystemFont',
            'Segoe UI',
            'Roboto',
            'Oxygen-Sans',
            'Ubuntu',
            'Cantarell',
            'Helvetica Neue',
            'sans-serif',
        ],
    },
    {
        label: 'Arial',
        value: ['Arial', 'sans-serif'],
    },
    {
        label: 'Inter',
        value: { googleFont: 'Inter' },
    },
    {
        label: 'IBM Plex Sans',
        value: { googleFont: 'IBM Plex Sans' },
    },
    {
        label: 'IBM Plex Mono',
        value: { googleFont: 'IBM Plex Mono' },
    },
    {
        label: 'Roboto',
        value: { googleFont: 'Roboto' },
    },
    {
        label: 'Inclusive Sans',
        value: { googleFont: 'Inclusive Sans' },
    },
    {
        label: 'Open Sans',
        value: { googleFont: 'Open Sans' },
    },
    {
        label: 'Lato',
        value: { googleFont: 'Lato' },
    },
    {
        label: 'Times New Roman',
        value: 'Times New Roman',
    },
    {
        label: 'Merriweather',
        value: { googleFont: 'Merriweather' },
    },
    {
        label: 'UnifrakturCook',
        value: { googleFont: 'UnifrakturCook' },
    },
    {
        label: 'Pixelify Sans',
        value: { googleFont: 'Pixelify Sans' },
    },
]);

setImageValuesDocsUrl('/react-data-grid/theming-parameters/#image-values');

setThemeBuilderDocsUrl(urlWithBaseUrl('/data-grid/theming-theme-builder/'));
