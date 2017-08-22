import {PreDestroy, Bean, Qualifier, Autowired, PostConstruct, Optional, Context} from "./context/context";

const themes = [ 'fresh', 'dark', 'blue', 'bootstrap', 'material-next', 'material'];
const themeCLass = new RegExp(`ag-(${themes.join('|')})`);

@Bean('environment')
export class Environment {
    @Autowired('eGridDiv') private eGridDiv: HTMLElement;

    public getTheme(): string {
        const themeMatch: RegExpMatchArray = this.eGridDiv.className.match(themeCLass);
        if (themeMatch) {
            return themeMatch[0];
        } else {
            return '';
        }
    }
}
