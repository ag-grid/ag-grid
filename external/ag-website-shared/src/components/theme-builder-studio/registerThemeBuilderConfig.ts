import { setFontFamilyOptions } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { setThemeCodeConfig } from '@ag-website-shared/components/theme-builder/themeImport';
import { setNonAdvancedParams, setThemeParamSource } from '@ag-website-shared/theming/ParamModel';
import { setFeatureModels } from '@ag-website-shared/theming/PartModel';
import { setBaseTheme, setRenderedFeatures } from '@ag-website-shared/theming/rendered-theme';
import { getThemeDefaultParams } from '@ag-website-shared/theming/utils';
import { studioTheme } from 'ag-studio';

import { STUDIO_FONT_FAMILY_OPTIONS } from './fonts';
import { STUDIO_CURATED_KEYS } from './params';

// Point the shared, host-agnostic theme-builder model at Studio's theme instead
// of grid's themeQuartz. Studio has no swappable-part features, so both the
// feature registry and the rendered-preview feature list are empty.
setThemeParamSource(() => getThemeDefaultParams(studioTheme));
setNonAdvancedParams(STUDIO_CURATED_KEYS);
setFeatureModels(() => []);
setBaseTheme(studioTheme);
setRenderedFeatures([]);

// Import/export snippets read `studioTheme` from the 'ag-studio' package.
setThemeCodeConfig({ themeVariable: 'studioTheme', importSource: 'ag-studio' });

setFontFamilyOptions(STUDIO_FONT_FAMILY_OPTIONS);
