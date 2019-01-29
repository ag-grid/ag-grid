import { Bean, Autowired } from './context/context';
import { _ } from "./utils";

const matGridSize = 8;
interface HardCodedSize {
    [key: string]: {
        [key: string]: number
    };
}
const freshGridSize = 4;
const balhamGridSize = 4;

const HARD_CODED_SIZES: HardCodedSize = {
    'ag-theme-material': {
        headerHeight: matGridSize * 7,
        virtualItemHeight: matGridSize * 5,
        rowHeight: matGridSize * 6
    },
    'ag-theme-classic': {
        headerHeight: 25,
        virtualItemHeight: freshGridSize * 5,
        rowHeight: 25
    },
    'ag-theme-balham': {
        headerHeight: balhamGridSize * 8,
        virtualItemHeight: balhamGridSize * 7,
        rowHeight: balhamGridSize * 7
   }
};

@Bean('environment')
export class Environment {

    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    private gridSize: number;
    private iconSize: number;
    private sassVariables: {[key: string]: string} = {};

    // Approach described here:
    // https://www.ofcodeandcolor.com/2017/04/02/encoding-data-in-css/
    public loadSassVariables(): void {
        /*
        var element = document.createElement('div');
        element.className = 'sass-variables';
        this.eGridDiv.appendChild(element);

        var content = window.getComputedStyle(element, '::after').content;

        try {
            this.sassVariables = JSON.parse(JSON.parse(content));
        } catch (e) {
            throw new Error("Failed loading the theme sizing - check that you have the theme set up correctly.");
        }

        this.eGridDiv.removeChild(element);
        */
    }

    public getSassVariable(theme: string, key: string): number {
        if (theme == 'ag-theme-material') {
            return HARD_CODED_SIZES['ag-theme-material'][key];
        } else if (theme == 'ag-theme-balham' || theme == 'ag-theme-balham-dark') {
            return HARD_CODED_SIZES['ag-theme-balham'][key];
        }
        return HARD_CODED_SIZES['ag-theme-classic'][key];
        /*
        const result = parseInt(this.sassVariables[key]);
        if (!result || isNaN(result)) {
            throw new Error(`Failed loading ${key} Sass variable from ${this.sassVariables}`);
        }
        return result;
        */
    }

    public getTheme(): string | undefined {
        const reg = /\bag-(fresh|dark|blue|material|bootstrap|(?:theme-([\w\-]*)))\b/;
        let el: HTMLElement = this.eGridDiv;
        let themeMatch: RegExpMatchArray;

        while (el) {
            themeMatch = reg.exec(el.className);
            el = el.parentElement;
            if (el == null || themeMatch) {
                break;
            }
        }

        if (!themeMatch) { return; }

        const theme = themeMatch[0];
        const usingOldTheme = themeMatch[2] === undefined;

        if (usingOldTheme) {
            const newTheme =  theme.replace('ag-', 'ag-theme-');
            _.doOnce(() => console.warn(`ag-Grid: As of v19 old theme are no longer provided. Please replace ${theme} with ${newTheme}.`), 'using-old-theme');
        }

        return theme;
    }
}
