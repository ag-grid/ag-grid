import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IEnvironment } from '../interfaces/iEnvironment';
import type { IPropertiesService } from '../interfaces/iProperties';
import {
    IS_SSR,
    _injectCoreAndModuleCSS,
    _injectGlobalCSS,
    _registerInstanceUsingThemingAPI,
    _unregisterInstanceUsingThemingAPI,
} from '../theming/inject';
import type { Theme } from '../theming/theme';
import { ThemeImpl } from '../theming/themeImpl';
import { _createAgElement } from '../utils/dom';
import { AgBeanStub } from './agBeanStub';

let paramsId = 0;

export abstract class BaseEnvironment<
        TBeanCollection extends AgCoreBeanCollection<TBeanCollection, TPropertiesService, TGlobalEvents, TCommon>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TChangeKey extends string = 'themeChanged',
    >
    extends AgBeanStub<TBeanCollection, TProperties, TGlobalEvents, TCommon, TPropertiesService>
    implements IEnvironment
{
    beanName = 'environment' as const;

    protected eRootDiv: HTMLElement;
    public eStyleContainer: HTMLElement;
    public cssLayer: string | undefined;
    public styleNonce: string | undefined;
    private mutationObserver: MutationObserver;

    public wireBeans(beans: TBeanCollection): void {
        this.eRootDiv = beans.eRootDiv;
    }

    private paramsClass = `ag-theme-params-${++paramsId}`;
    private theme: ThemeImpl | undefined;
    private eParamsStyle: HTMLStyleElement | undefined;
    private globalCSS: [string, string][] = [];

    protected abstract initVariables(): void;

    protected abstract fireStylesChangedEvent(change: TChangeKey): void;

    protected abstract getAdditionalCss(): Map<string, string[]>;

    protected abstract postProcessThemeChange(newTheme: ThemeImpl | undefined, themeProperty?: Theme | 'legacy'): void;

    protected abstract getDefaultTheme(): Theme;

    protected abstract themeError(theme: Theme | 'legacy'): void;

    public postConstruct(): void {
        const { gos, eRootDiv } = this;
        this.eStyleContainer =
            gos.get('themeStyleContainer') ?? (eRootDiv.getRootNode() === document ? document.head : eRootDiv);
        this.cssLayer = gos.get('themeCssLayer');
        this.styleNonce = gos.get('styleNonce');
        this.addManagedPropertyListener('theme', () => this.handleThemeChange());
        this.handleThemeChange();

        this.initVariables();

        this.addDestroyFunc(() => _unregisterInstanceUsingThemingAPI(this));

        this.mutationObserver = new MutationObserver(() => {
            this.fireStylesChangedEvent('themeChanged' as TChangeKey);
        });
        this.addDestroyFunc(() => this.mutationObserver.disconnect());
    }

    public applyThemeClasses(el: HTMLElement, extraClasses: string[] = []): void {
        const { theme } = this;
        let themeClass: string;
        if (theme) {
            // Theming API mode
            themeClass = `${this.paramsClass} ${theme._getCssClass()}`;
        } else {
            themeClass = this.applyLegacyThemeClasses();
        }

        for (const className of Array.from(el.classList)) {
            if (className.startsWith('ag-theme-')) {
                el.classList.remove(className);
            }
        }
        if (themeClass) {
            const oldClass = el.className;
            el.className = `${oldClass}${oldClass ? ' ' : ''}${themeClass}${extraClasses?.length ? ` ${extraClasses.join(' ')}` : ''}`;
        }
    }

    private applyLegacyThemeClasses(): string {
        let themeClass = '';
        this.mutationObserver.disconnect();
        let node: HTMLElement | null = this.eRootDiv;
        while (node) {
            let isThemeEl = false;
            for (const className of Array.from(node.classList)) {
                if (className.startsWith('ag-theme-')) {
                    isThemeEl = true;
                    themeClass = themeClass ? `${themeClass} ${className}` : className;
                }
            }
            if (isThemeEl) {
                this.mutationObserver.observe(node, {
                    attributes: true,
                    attributeFilter: ['class'],
                });
            }
            node = node.parentElement;
        }
        return themeClass;
    }

    public addGlobalCSS(css: string, debugId: string): void {
        if (this.theme) {
            _injectGlobalCSS(css, this.eStyleContainer, debugId, this.cssLayer, 0, this.styleNonce);
        } else {
            this.globalCSS.push([css, debugId]);
        }
    }

    private handleThemeChange(): void {
        const { gos, theme: oldTheme } = this;
        const themeProperty = gos.get('theme');
        let newTheme: ThemeImpl | undefined;
        if (themeProperty === 'legacy') {
            newTheme = undefined;
        } else {
            const themeOrDefault = themeProperty ?? this.getDefaultTheme();
            if (themeOrDefault instanceof ThemeImpl) {
                newTheme = themeOrDefault;
            } else {
                this.themeError(themeOrDefault);
            }
        }
        if (newTheme !== oldTheme) {
            this.handleNewTheme(newTheme);
        }
        this.postProcessThemeChange(newTheme, themeProperty);
    }

    private handleNewTheme(newTheme: ThemeImpl | undefined): void {
        const { gos, eRootDiv, globalCSS } = this;
        const additionalCss = this.getAdditionalCss();
        if (newTheme) {
            _registerInstanceUsingThemingAPI(this);
            _injectCoreAndModuleCSS(this.eStyleContainer, this.cssLayer, this.styleNonce, additionalCss);
            for (const [css, debugId] of globalCSS) {
                _injectGlobalCSS(css, this.eStyleContainer, debugId, this.cssLayer, 0, this.styleNonce);
            }
            globalCSS.length = 0;
        }
        this.theme = newTheme;
        newTheme?._startUse({
            loadThemeGoogleFonts: gos.get('loadThemeGoogleFonts'),
            styleContainer: this.eStyleContainer,
            cssLayer: this.cssLayer,
            nonce: this.styleNonce,
            moduleCss: additionalCss,
        });
        let eParamsStyle = this.eParamsStyle;
        if (!eParamsStyle) {
            eParamsStyle = this.eParamsStyle = _createAgElement<HTMLStyleElement>({ tag: 'style' });
            const styleNonce = gos.get('styleNonce');
            if (styleNonce) {
                eParamsStyle.setAttribute('nonce', styleNonce);
            }
            eRootDiv.appendChild(eParamsStyle);
        }
        if (!IS_SSR) {
            eParamsStyle.textContent = newTheme?._getPerInstanceCss(this.paramsClass) || '';
        }

        this.applyThemeClasses(eRootDiv);
        this.fireStylesChangedEvent('themeChanged' as TChangeKey);
    }
}
