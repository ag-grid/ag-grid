import { setFontFamilyOptions } from '@ag-website-shared/components/theme-builder/FontFamilyValueEditor';
import { setNonAdvancedParams, setThemeParamSource } from '@ag-website-shared/theming/ParamModel';
import { setFeatureModels } from '@ag-website-shared/theming/PartModel';
import { setBaseTheme, setRenderedFeatures } from '@ag-website-shared/theming/rendered-theme';

import { CHARTS_PARAM_DEFAULTS, chartsShadowTheme } from './chartsTheme';
import { CHARTS_FONT_FAMILY_OPTIONS } from './fonts';
import { CURATED_KEYS } from './params';

// Point the shared theme-builder model at AG Charts' params rather than grid's
// themeQuartz. Charts has no swappable-part features, so both feature lists are empty.
setThemeParamSource(() => CHARTS_PARAM_DEFAULTS);
setNonAdvancedParams(CURATED_KEYS);
setFeatureModels(() => []);
setBaseTheme(chartsShadowTheme);
setRenderedFeatures([]);

setFontFamilyOptions(CHARTS_FONT_FAMILY_OPTIONS);

// setParamDocsProvider and setParamDocsUrlProvider are the host's to register,
// the descriptions coming from a 4MB reference it reduces at build time.
