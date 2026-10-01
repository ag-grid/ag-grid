import { setFontFamilyOptions } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { setThemeCodeConfig } from '@ag-website-shared/components/theme-builder/themeImport';
import { setNonAdvancedParams, setThemeParamSource } from '@ag-website-shared/theming/ParamModel';
import { setFeatureModels } from '@ag-website-shared/theming/PartModel';
import { setBaseTheme } from '@ag-website-shared/theming/base-theme';
import { setRenderedFeatures } from '@ag-website-shared/theming/rendered-theme';
import { setProductVersion } from '@ag-website-shared/theming/store';
import { getThemeDefaultParams } from '@ag-website-shared/theming/utils';
import { agStudioVersion } from '@constants';
import { _getEditableThemeParams, studioTheme } from 'ag-studio';

import { STUDIO_FONT_FAMILY_OPTIONS } from './fonts';
import { STUDIO_CURATED_KEYS } from './params';

// studioTheme is built on the grid and chart themes, so it carries their full param
// sets - including params Studio never applies. Editing one of those does nothing
// visible, so keep them out of the builder entirely: allParamModels() is what feeds
// the advanced param list, theme import validation and the rendered preview.

// Studio has no swappable-part features, so both feature lists stay empty.
setThemeParamSource(() => _getEditableThemeParams(getThemeDefaultParams(studioTheme)));
setNonAdvancedParams(STUDIO_CURATED_KEYS);
setFeatureModels(() => []);
setBaseTheme(studioTheme);
setRenderedFeatures([]);

// Import/export snippets read `studioTheme` from the 'ag-studio' package.
setThemeCodeConfig({ themeVariable: 'studioTheme', importSource: 'ag-studio' });

setFontFamilyOptions(STUDIO_FONT_FAMILY_OPTIONS);

setProductVersion(agStudioVersion);
