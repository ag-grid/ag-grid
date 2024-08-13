import { createTheme } from '../../theme-types';
import { checkboxStyleDefault } from '../checkbox-style/checkbox-styles';
import { colorSchemeLightCold, colorSchemeLightNeutral } from '../color-scheme/color-schemes';
import { iconSetAlpine, iconSetMaterial, iconSetQuartzRegular } from '../icon-set/icon-sets';
import { inputStyleBordered, inputStyleUnderlined } from '../input-style/input-styles';
import { tabStyleMaterial, tabStyleQuartz, tabStyleRolodex } from '../tab-style/tab-styles';

const createThemeWithDefaultWidgets = (name: string) => createTheme(name).usePart(checkboxStyleDefault);

// prettier-ignore
export const themeQuartz =
/*#__PURE__*/
createThemeWithDefaultWidgets('quartz')
.usePart(colorSchemeLightNeutral)
.usePart(iconSetQuartzRegular)
.usePart(tabStyleQuartz)
.usePart(inputStyleBordered);

// prettier-ignore
export const themeBalham =
    /*#__PURE__*/
    createThemeWithDefaultWidgets('balham')
        .usePart(colorSchemeLightCold)
        .usePart(iconSetAlpine)
        .usePart(tabStyleRolodex)
        .usePart(inputStyleBordered)
        .overrideParams({
            gridSize: 4,
            borderRadius: 2,
            wrapperBorderRadius: 2,
            headerColumnResizeHandleColor: 'transparent',
            headerColumnBorder: true,
            headerColumnBorderHeight: '50%',
            oddRowBackgroundColor: {
                ref: 'chromeBackgroundColor',
                mix: 0.5,
            },
            headerTextColor: {
                ref: 'foregroundColor',
                mix: 0.5,
            },
            fontFamily: [
                '-apple-system',
                'BlinkMacSystemFont',
                'Segoe UI',
                { googleFont: 'Roboto' },
                'Oxygen-Sans',
                'Ubuntu',
                'Cantarell',
                'Helvetica Neue',
                'sans-serif'
            ],
            fontSize: 12,
            headerFontWeight: 'bold'
        })
        .addCss(
            `
            .ag-filter-toolpanel-group-level-0-header {
                background-color: color-mix(in srgb, transparent, var(--ag-foreground-color) 7%);
                border-top: 1px solid var(--ag-border-color);
            }
        `
        );

// - [ ]
// - [ ] Hide all borders except those between rows and columns
// - [ ] Hide tab borders and show underlines
// - [ ] Roboto font

export const themeMaterial =
    /*#__PURE__*/
    createThemeWithDefaultWidgets('material')
        .usePart(iconSetMaterial)
        .usePart(tabStyleMaterial)
        .usePart(inputStyleUnderlined)
        .overrideParams({
            gridSize: 9,
            iconSize: 18,
            borderRadius: 0,
            wrapperBorderRadius: 0,
            wrapperBorder: false,
            sidePanelBorder: false,
            sideButtonSelectedBorder: false,
            headerColumnResizeHandleColor: 'none',
            headerBackgroundColor: {
                ref: 'backgroundColor',
            },
            rangeSelectionBackgroundColor: {
                ref: 'primaryColor',
                mix: 0.2,
            },
            rangeSelectionBorderColor: {
                ref: 'primaryColor',
            },
            fontFamily: [
                { googleFont: 'Roboto' },
                '-apple-system',
                'BlinkMacSystemFont',
                'Segoe UI',
                'Oxygen-Sans',
                'Ubuntu',
                'Cantarell',
                'Helvetica Neue',
                'sans-serif',
            ],
            inputFocusBorder: {
                style: 'solid',
                width: 2,
                color: { ref: 'primaryColor' },
            },
            headerFontWeight: 600,
        })
        .addCss(
            `
            .ag-filter-toolpanel-group-level-0-header, .ag-column-drop-horizontal {
                background-color: color-mix(in srgb, transparent, var(--ag-foreground-color) 7%);
            }
        `
        );
