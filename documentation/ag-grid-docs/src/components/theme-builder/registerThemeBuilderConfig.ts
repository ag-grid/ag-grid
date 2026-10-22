import { setFontFamilyOptions } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { setImageValuesDocsUrl } from '@ag-website-shared/components/theme-builder/ImageValueEditor';
import { setThemeBuilderDocsUrl } from '@ag-website-shared/components/theme-builder/ThemeImportExportDialog';
import { setThemeCodeConfig } from '@ag-website-shared/components/theme-builder/themeImport';
import { setNonAdvancedParams } from '@ag-website-shared/theming/ParamModel';
import { FeatureModel, setFeatureModels } from '@ag-website-shared/theming/PartModel';
import { setBaseTheme } from '@ag-website-shared/theming/base-theme';
import { setRenderedFeatures } from '@ag-website-shared/theming/rendered-theme';
import { setProductVersion } from '@ag-website-shared/theming/store';
import { agGridVersion } from '@constants';
import { urlWithBaseUrl } from '@utils/urlWithBaseUrl';

import {
    colorSchemeDark,
    colorSchemeDarkBlue,
    colorSchemeDarkWarm,
    colorSchemeLight,
    colorSchemeLightCold,
    colorSchemeLightWarm,
    colorSchemeVariable,
    iconSetAlpine,
    iconSetMaterial,
    iconSetQuartzBold,
    iconSetQuartzLight,
    iconSetQuartzRegular,
    inputStyleBordered,
    inputStyleUnderlined,
    tabStyleAlpine,
    tabStyleMaterial,
    tabStyleQuartz,
    tabStyleRolodex,
    themeQuartz,
} from 'ag-grid-community';

import { GRID_FONT_FAMILY_OPTIONS } from './fonts';

setBaseTheme(themeQuartz);

setThemeCodeConfig({ themeVariable: 'themeQuartz', importSource: 'ag-grid-community' });

setFeatureModels(() => [
    new FeatureModel('colorScheme', {
        lightCold: colorSchemeLightCold,
        light: colorSchemeLight,
        lightWarm: colorSchemeLightWarm,
        darkBlue: colorSchemeDarkBlue,
        dark: colorSchemeDark,
        darkWarm: colorSchemeDarkWarm,
        variable: colorSchemeVariable,
    }),
    new FeatureModel('iconSet', {
        alpine: iconSetAlpine,
        material: iconSetMaterial,
        quartzLight: iconSetQuartzLight,
        quartzRegular: iconSetQuartzRegular,
        quartzBold: iconSetQuartzBold,
    }),
    new FeatureModel(
        'tabStyle',
        {
            quartz: tabStyleQuartz,
            alpine: tabStyleAlpine,
            material: tabStyleMaterial,
            rolodex: tabStyleRolodex,
        },
        'The appearance of tabs in chart settings and legacy column menu'
    ),
    new FeatureModel(
        'inputStyle',
        {
            bordered: inputStyleBordered,
            underlined: inputStyleUnderlined,
        },
        'The appearance of text input fields'
    ),
]);

// The other features are applied to the preview grid by the host, not the theme.
setRenderedFeatures(['iconSet']);

setNonAdvancedParams([
    'fontFamily',
    'fontSize',
    'backgroundColor',
    'foregroundColor',
    'accentColor',
    'borderColor',
    'wrapperBorder',
    'rowBorder',
    'columnBorder',
    'headerRowBorder',
    'spacing',
    'wrapperBorderRadius',
    'borderRadius',
    'headerBackgroundColor',
    'headerTextColor',
    'headerFontFamily',
    'headerFontSize',
    'headerFontWeight',
    'headerVerticalPaddingScale',
    'cellTextColor',
    'dataBackgroundColor',
    'oddRowBackgroundColor',
    'rowVerticalPaddingScale',
    'cellHorizontalPaddingScale',
    'iconSize',
]);

setFontFamilyOptions(GRID_FONT_FAMILY_OPTIONS);

setImageValuesDocsUrl('/react-data-grid/theming-parameters/#image-values');

setThemeBuilderDocsUrl(urlWithBaseUrl('/data-grid/theming-theme-builder/'));

setProductVersion(agGridVersion);
