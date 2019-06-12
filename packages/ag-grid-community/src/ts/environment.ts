import { Bean, Autowired } from './context/context';
import { _ } from "./utils";

const MAT_GRID_SIZE = 8;
interface HardCodedSize {
    [key: string]: {
        [key: string]: number
    };
}
const FRESH_GRID_SIZE = 4;
const FINANCE_GRID_SIZE = 4;

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
    'ag-theme-finance': {
        headerHeight: FINANCE_GRID_SIZE * 8,
        virtualItemHeight: FINANCE_GRID_SIZE * 7,
        rowHeight: FINANCE_GRID_SIZE * 7
   }
};

@Bean('environment')
export class Environment {

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    public getSassVariable(theme: string, key: string): number {
        if (theme == 'ag-theme-material') {
            return HARD_CODED_SIZES['ag-theme-material'][key];
        } else if (theme == 'ag-theme-finance' || theme == 'ag-theme-finance-dark') {
            return HARD_CODED_SIZES['ag-theme-finance'][key];
        }
        return HARD_CODED_SIZES['ag-theme-classic'][key];
    }

    public isThemeDark(): boolean {
        const theme = this.getTheme();
        return !!theme && theme.indexOf('dark') >= 0;
    }

    public getThemeDetails(): { themeMatch: RegExpMatchArray | null, element: HTMLElement | null } {
        const reg = /\bag-(fresh|dark|blue|material|bootstrap|(?:theme-([\w\-]*)))\b/;
        let el: HTMLElement = this.eGridDiv;
        let themeMatch: RegExpMatchArray;

        while (el) {
            themeMatch = reg.exec(el.className);
            if (el == null || themeMatch) {
                break;
            }
            el = el.parentElement;
        }

        return {
            themeMatch,
            element: el
        };
    }

    public getTheme(): string | undefined {
        const { themeMatch } = this.getThemeDetails();

        if (!themeMatch) {
            return;
        }

        const theme = themeMatch[0];
        const usingOldTheme = themeMatch[2] === undefined;

        if (usingOldTheme) {
            const newTheme =  theme.replace('ag-', 'ag-theme-');
            _.doOnce(() => console.warn(`ag-Grid: As of v19 old theme are no longer provided. Please replace ${theme} with ${newTheme}.`), 'using-old-theme');
        }

        return theme;
    }
}
