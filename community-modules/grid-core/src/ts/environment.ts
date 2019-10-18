import { Bean, Autowired } from './context/context';
import { _ } from "./utils";

const MAT_GRID_SIZE = 8;

export type SASS_PROPERTIES = 'headerHeight' | 'virtualItemHeight' | 'rowHeight';
interface HardCodedSize {
    [key: string]: {
        [key in SASS_PROPERTIES]?: number
    };
}
const FRESH_GRID_SIZE = 4;
const BALHAM_GRID_SIZE = 4;

const HARD_CODED_SIZES: HardCodedSize = {
    'ag-theme-material': {
        headerHeight: MAT_GRID_SIZE * 7,
        virtualItemHeight: MAT_GRID_SIZE * 5,
        rowHeight: MAT_GRID_SIZE * 6
    },
    'ag-theme-classic': {
        headerHeight: 25,
        virtualItemHeight: FRESH_GRID_SIZE * 5,
        rowHeight: 25
    },
    'ag-theme-balham': {
        headerHeight: BALHAM_GRID_SIZE * 8,
        virtualItemHeight: BALHAM_GRID_SIZE * 7,
        rowHeight: BALHAM_GRID_SIZE * 7
   }
};

/**
 * this object contains a list of Sass variables and an array
 * of CSS styles required to get the correct value.
 * eg. $virtual-item-height requires a structure, so we can get it's height.
 * <div class="ag-theme-balham">
 *     <div class="ag-virtual-list-container">
 *         <div class="ag-virtual-list-item"></div>
 *     </div>
 */
const SASS_PROPERTY_BUILDER: { [key in SASS_PROPERTIES]: string[] } = {
    headerHeight: ['ag-header-row'],
    virtualItemHeight: ['ag-virtual-list-container', 'ag-virtual-list-item'],
    rowHeight: ['ag-row']
};

const CALCULATED_SIZES: HardCodedSize = {};

@Bean('environment')
export class Environment {

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    public getSassVariable(theme: string, key: SASS_PROPERTIES): number {
        const useTheme = 'ag-theme-' + (theme.match('material') ? 'material' : (theme.match('balham') ? 'balham' : 'classic'));
        const defaultValue = HARD_CODED_SIZES[useTheme][key];
        let calculatedValue = 0;

        if (!CALCULATED_SIZES[theme]) {
            CALCULATED_SIZES[theme] = {};
        }

        if (CALCULATED_SIZES[theme][key]) {
            return CALCULATED_SIZES[theme][key];
        }

        if (SASS_PROPERTY_BUILDER[key]) {
            const classList = SASS_PROPERTY_BUILDER[key];
            const div = document.createElement('div');
            const el: HTMLDivElement = classList.reduce((el: HTMLDivElement, currentClass: string, idx: number) => {
                if (idx === 0) {
                    _.addCssClass(el, theme);
                }

                const div = document.createElement('div');
                _.addCssClass(div, currentClass);
                el.appendChild(div);

                return div;
            }, div);

            if (document.body) {
                document.body.appendChild(div);
                calculatedValue = parseInt(window.getComputedStyle(el).height, 10);
                document.body.removeChild(div);
            }
        }

        CALCULATED_SIZES[theme][key] = calculatedValue || defaultValue;

        return CALCULATED_SIZES[theme][key];
    }

    public isThemeDark(): boolean {
        const { theme } = this.getTheme();
        return !!theme && theme.indexOf('dark') >= 0;
    }

    public getTheme(): { theme?: string, el?: HTMLElement } {
        const reg = /\bag-(fresh|dark|blue|material|bootstrap|(?:theme-([\w\-]*)))\b/;
        let el: HTMLElement = this.eGridDiv;
        let themeMatch: RegExpMatchArray;

        while (el) {
            themeMatch = reg.exec(el.className);
            if (!themeMatch) {
                el = el.parentElement;
            } else {
                break;
            }
        }

        if (!themeMatch) { return {}; }

        const theme = themeMatch[0];
        const usingOldTheme = themeMatch[2] === undefined;

        if (usingOldTheme) {
            const newTheme =  theme.replace('ag-', 'ag-theme-');
            _.doOnce(() => console.warn(`ag-Grid: As of v19 old theme are no longer provided. Please replace ${theme} with ${newTheme}.`), 'using-old-theme');
        }

        return { theme, el };
    }
}
