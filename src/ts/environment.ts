import {PreDestroy, Bean, Qualifier, Autowired, PostConstruct, Optional, Context} from './context/context';

let themeNames = ['fresh', 'dark', 'blue', 'bootstrap', 'material'];
const themes = themeNames.concat(themeNames.map(name => `theme-${name}`));
const themeClass = new RegExp(`ag-(${themes.join('|')})`);

const matGridSize = 8;
type HardCodedSize = {[key: string]: {[key: string]: number}};

const freshGridSize = 4;

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

    public getTheme(): string {
        let themeMatch: RegExpMatchArray;
        let element: HTMLElement = this.eGridDiv;

        while (element != document.documentElement && themeMatch == null) {
            themeMatch = element.className.match(themeClass);
            element = element.parentElement;
            if (element == null) {
                break;
            }
        }

        if (themeMatch) {
            return themeMatch[0];
        } else {
            return 'ag-fresh';
        }
    }
}
