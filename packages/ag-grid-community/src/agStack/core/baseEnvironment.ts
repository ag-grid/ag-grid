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
import { _createAgElement, _isInDOM, _observeResize } from '../utils/dom';
import { AgBeanStub } from './agBeanStub';

let paramsId = 0;

const LIST_ITEM_HEIGHT: CssVariable<BaseCssChangeKeys> = {
    cssName: '--ag-list-item-height',
    changeKey: 'listItemHeightChanged',
    defaultValue: 24,
};

export abstract class BaseEnvironment<
        TBeanCollection extends AgCoreBeanCollection<TProperties, TGlobalEvents, TCommon, TPropertiesService>,
        TProperties extends BaseProperties,
        TGlobalEvents extends BaseEvents,
        TCommon,
        TPropertiesService extends IPropertiesService<TProperties, TCommon>,
        TChangeKeys extends BaseCssChangeKeys = BaseCssChangeKeys,
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
    private readonly sizeEls = new Map<CssVariable<TChangeKeys>, HTMLElement>();
    private readonly lastKnownValues = new Map<CssVariable<TChangeKeys>, number>();
    private eMeasurementContainer: HTMLElement | undefined;
    public sizesMeasured = false;

    public wireBeans(beans: TBeanCollection): void {
        this.eRootDiv = beans.eRootDiv;
    }

    private readonly paramsClass = `ag-theme-params-${++paramsId}`;
    private theme: ThemeImpl | undefined;
    private eParamsStyle: HTMLStyleElement | undefined;
    private readonly globalCSS: [string, string][] = [];

    protected abstract initVariables(): void;
    protected abstract getAdditionalCss(): Map<string, string[]>;

    protected abstract postProcessThemeChange(newTheme: ThemeImpl | undefined, themeProperty?: Theme | 'legacy'): void;

    protected abstract getDefaultTheme(): Theme;

    protected abstract themeError(theme: Theme | 'legacy'): void;

    protected abstract shadowRootError(): void;

    protected abstract varError(variable: CssVariable<TChangeKeys>): void;

    public postConstruct(): void {
        const { gos, eRootDiv } = this;
        gos.setInstanceDomData(eRootDiv);
        const themeStyleContainer = gos.get('themeStyleContainer');
        const hasShadowRootGlobal = typeof ShadowRoot !== 'undefined';
        const isShadowRoot = hasShadowRootGlobal && eRootDiv.getRootNode() instanceof ShadowRoot;
        this.eStyleContainer = gos.get('themeStyleContainer') ?? (isShadowRoot ? eRootDiv : document.head);
        if (!themeStyleContainer && !isShadowRoot && hasShadowRootGlobal) {
            warnOnAttachToShadowRoot(eRootDiv, this.shadowRootError.bind(this), this.addDestroyFunc.bind(this));
        }
        this.cssLayer = gos.get('themeCssLayer');
        this.styleNonce = gos.get('styleNonce');
        this.addManagedPropertyListener('theme', () => this.handleThemeChange());
        this.handleThemeChange();

        this.getSizeEl(LIST_ITEM_HEIGHT);
        this.initVariables();

        this.addDestroyFunc(() => _unregisterInstanceUsingThemingAPI(this));

        this.mutationObserver = new MutationObserver(() => {
            this.fireStylesChangedEvent('themeChanged');
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
            el.className = `${oldClass}${oldClass ? ' ' : ''}${themeClass}${extraClasses?.length ? ' ' + extraClasses.join(' ') : ''}`;
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

    public getDefaultListItemHeight(): number {
        return this.getCSSVariablePixelValue(LIST_ITEM_HEIGHT);
    }

    protected getCSSVariablePixelValue(variable: CssVariable<TChangeKeys>): number {
        const cached = this.lastKnownValues.get(variable);
        if (cached != null) {
            return cached;
        }
        const measurement = this.measureSizeEl(variable);
        if (measurement === 'detached' || measurement === 'no-styles') {
            if (variable.cacheDefault) {
                this.lastKnownValues.set(variable, variable.defaultValue);
            }
            return variable.defaultValue;
        }
        this.lastKnownValues.set(variable, measurement);
        return measurement;
    }

    private measureSizeEl(variable: CssVariable<TChangeKeys>): number | 'detached' | 'no-styles' {
        const sizeEl = this.getSizeEl(variable);
        if (sizeEl.offsetParent == null) {
            return 'detached';
        }
        const newSize = sizeEl.offsetWidth;
        if (newSize === NO_VALUE_SENTINEL) {
            return 'no-styles';
        }
        this.sizesMeasured = true;
        return newSize;
    }

    protected getMeasurementContainer(): HTMLElement {
        let container = this.eMeasurementContainer;
        if (!container) {
            container = this.eMeasurementContainer = _createAgElement({ tag: 'div', cls: 'ag-measurement-container' });
            this.eRootDiv.appendChild(container);
        }
        return container;
    }

    protected getSizeEl(variable: CssVariable<TChangeKeys>): HTMLElement {
        let sizeEl = this.sizeEls.get(variable);
        if (sizeEl) {
            return sizeEl;
        }
        const container = this.getMeasurementContainer();

        sizeEl = _createAgElement({ tag: 'div' });
        const { border, noWarn } = variable;
        if (border) {
            sizeEl.className = 'ag-measurement-element-border';
            sizeEl.style.setProperty(
                '--ag-internal-measurement-border',
                `var(${variable.cssName}, solid ${NO_VALUE_SENTINEL}px)`
            );
        } else {
            sizeEl.style.width = `var(${variable.cssName}, ${NO_VALUE_SENTINEL}px)`;
        }
        container.appendChild(sizeEl);
        this.sizeEls.set(variable, sizeEl);

        let lastMeasurement = this.measureSizeEl(variable);

        if (lastMeasurement === 'no-styles' && !noWarn) {
            // No value for the variable
            this.varError(variable);
        }

        const unsubscribe = _observeResize(this.beans, sizeEl, () => {
            const newMeasurement = this.measureSizeEl(variable);
            if (newMeasurement === 'detached' || newMeasurement === 'no-styles') {
                return;
            }
            this.lastKnownValues.set(variable, newMeasurement);
            if (newMeasurement !== lastMeasurement) {
                lastMeasurement = newMeasurement;
                this.fireStylesChangedEvent(variable.changeKey);
            }
        });
        this.addDestroyFunc(() => unsubscribe());

        return sizeEl;
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
        this.fireStylesChangedEvent('themeChanged');
    }

    protected fireStylesChangedEvent(change: keyof TChangeKeys): void {
        this.eventSvc.dispatchEvent({
            type: 'stylesChanged',
            [change]: true,
        });
    }
}

export type CssVariable<TChangeKeys extends BaseCssChangeKeys> = {
    cssName: string;
    changeKey: keyof TChangeKeys;
    defaultValue: number;
    border?: boolean;
    noWarn?: boolean;
    cacheDefault?: boolean;
};

export interface BaseCssChangeKeys {
    themeChanged: true;
    listItemHeightChanged: true;
}

const NO_VALUE_SENTINEL = 15538;

const warnOnAttachToShadowRoot = (
    el: HTMLElement,
    errorCallback: () => void,
    onDestroy: (handler: () => void) => void
) => {
    // only retry for a minute, to prevent our tests (and potentially customer's
    // tests) from hanging if they try to use vi.runAllTimers() to run the interval
    // until it terminates
    let retries = 60;
    const interval = setInterval(() => {
        if (typeof ShadowRoot !== 'undefined' && el.getRootNode() instanceof ShadowRoot) {
            errorCallback();
            clearInterval(interval);
        }
        if (_isInDOM(el) || --retries < 0) {
            clearInterval(interval);
        }
    }, 1000);
    onDestroy(() => clearInterval(interval));
};
