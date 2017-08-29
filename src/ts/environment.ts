import {PreDestroy, Bean, Qualifier, Autowired, PostConstruct, Optional, Context} from "./context/context";

const themes = [ 'fresh', 'dark', 'blue', 'bootstrap', 'material', 'theme-material'];
const themeCLass = new RegExp(`ag-(${themes.join('|')})`);

@Bean('environment')
export class Environment {
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    public getTheme(): string {
        let themeMatch:RegExpMatchArray;
        let element:HTMLElement = this.eGridDiv;

        while (element != document.documentElement && themeMatch == null) {
            themeMatch = element.className.match(themeCLass);
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
