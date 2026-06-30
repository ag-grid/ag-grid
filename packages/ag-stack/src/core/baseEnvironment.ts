import type { AgCoreBeanCollection } from '../interfaces/agCoreBeanCollection';
import type { AgStylesChangedEvent, BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { IEnvironment } from '../interfaces/iEnvironment';
import type { IPropertiesService } from '../interfaces/iProperties';
import {
    _injectCoreAndModuleCSS,
    _injectGlobalCSS,
    _unregisterInstanceUsingThemingAPI,
    _useParamsCss,
} from '../theming/inject';
import { _initStyledRootFromInnerOfThreeElements } from '../theming/styledRoot';
import type { Theme } from '../theming/theme';
import { ThemeImpl } from '../theming/themeImpl';
import type { ParamType } from '../theming/themeTypeUtils';
import { paramToVariableName } from '../theming/themeUtils';
import { _createAgElement, _observeResize } from '../utils/dom';
import { AgBeanStub } from './agBeanStub';

const LIST_ITEM_HEIGHT: CssVariable<BaseCssChangeKeys> = {
    changeKey: 'listItemHeight',
    type: 'length',
    defaultValue: 24,
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
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

    private theme: ThemeImpl | undefined;
    private readonly globalCSS: [string, string][] = [];

    protected abstract initVariables(): void;
    protected abstract getAdditionalCss(): Map<string, string[]>;

    protected abstract postProcessThemeChange(newTheme: ThemeImpl | undefined, themeProperty?: Theme | 'legacy'): void;

    protected abstract getDefaultTheme(): Theme;

    protected abstract themeError(theme: Theme | 'legacy'): void;

    protected abstract shadowRootError(): void;

    protected abstract varError(cssName: string, defaultValue: number): void;

    public postConstruct(): void {
        const { gos, eRootDiv } = this;
        gos.setInstanceDomData(eRootDiv);
        const themeStyleContainer = gos.get('themeStyleContainer');
        const hasShadowRootGlobal = typeof ShadowRoot !== 'undefined';
        const isShadowRoot = hasShadowRootGlobal && eRootDiv.getRootNode() instanceof ShadowRoot;
        this.eStyleContainer =
            (typeof themeStyleContainer === 'function' ? themeStyleContainer() : themeStyleContainer) ??
            (isShadowRoot ? eRootDiv : document.head);
        if (!themeStyleContainer && !isShadowRoot && hasShadowRootGlobal) {
            warnOnAttachToShadowRoot(eRootDiv, this.shadowRootError.bind(this), this.addDestroyFunc.bind(this));
        }
        this.cssLayer = gos.get('themeCssLayer');
        this.styleNonce = gos.get('styleNonce');
        this.addManagedPropertyListener('theme', () => this.handleThemeChange());
        this.handleThemeChange();

        this.mutationObserver = new MutationObserver(() => {
            this.fireStylesChangedEvent('theme');
        });
        this.addDestroyFunc(() => this.mutationObserver.disconnect());

        this.initStyledRoot();
        this.getSizeEl(LIST_ITEM_HEIGHT);
        this.initVariables();

        this.addDestroyFunc(() => _unregisterInstanceUsingThemingAPI(this));
    }

    public getStyledRootClasses(): [inheritClass: string, applyClass: string, directionClass: string] {
        const { theme } = this;
        const [inheritClass, applyClass] = theme ? theme._getCssClasses() : ['', this.getLegacyThemeClasses()];
        const directionClass = this.gos.get('enableRtl') ? 'ag-rtl' : 'ag-ltr';
        return [inheritClass, applyClass, directionClass];
    }

    private getLegacyThemeClasses(): string {
        const themeClasses = new Set<string>();
        // rebuild the observer set every time we call this function, to handle
        // edge cases where the grid is initialised outside the DOM or moved
        this.mutationObserver.disconnect();
        let node = this.eRootDiv.parentElement;
        while (node) {
            if (!node.classList.contains('ag-styled-root')) {
                let isThemeEl = false;
                for (const cls of node.classList) {
                    if (cls.startsWith('ag-theme-')) {
                        isThemeEl = true;
                        themeClasses.add(cls);
                    }
                }
                if (isThemeEl) {
                    this.mutationObserver.observe(node, {
                        attributes: true,
                        attributeFilter: ['class'],
                    });
                }
            }
            node = node.parentElement;
        }
        return [...themeClasses].join(' ');
    }

    public onThemeChanged(handler: () => void): () => void {
        const listener = (e: AgStylesChangedEvent) => {
            if (e.themeChanged) {
                handler();
            }
        };
        this.eventSvc.addListener('stylesChanged', listener);
        return () => this.eventSvc.removeListener('stylesChanged', listener);
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
            this.addDestroyFunc(() => container?.remove());
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

        const cssName = this.setSizeElStyles(sizeEl, variable);
        container.appendChild(sizeEl);
        this.sizeEls.set(variable, sizeEl);

        const { type, noWarn } = variable;

        if (type !== 'length' && type !== 'border') {
            return sizeEl;
        }

        let lastMeasurement = this.measureSizeEl(variable);

        if (lastMeasurement === 'no-styles' && !noWarn) {
            // No value for the variable
            this.varError(cssName, variable.defaultValue);
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

    protected setSizeElStyles(sizeEl: HTMLElement, variable: CssVariable<TChangeKeys>): string {
        const { changeKey, type } = variable;
        let cssName = paramToVariableName(changeKey);
        if (type === 'border') {
            if (cssName.endsWith('-width')) {
                cssName = cssName.slice(0, -6);
            }
            sizeEl.className = 'ag-measurement-element-border';
            sizeEl.style.setProperty(
                '--ag-internal-measurement-border',
                `var(${cssName}, solid ${NO_VALUE_SENTINEL}px)`
            );
        } else {
            sizeEl.style.width = `var(${cssName}, ${NO_VALUE_SENTINEL}px)`;
        }
        return cssName;
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
        const { gos, globalCSS } = this;
        const additionalCss = this.getAdditionalCss();
        if (newTheme) {
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

        _useParamsCss(
            this,
            newTheme?._getParamsCss() ?? null,
            newTheme?._getParamsClassName() ?? null,
            this.eStyleContainer,
            this.cssLayer,
            this.styleNonce
        );

        this.fireStylesChangedEvent('theme');
    }

    protected fireStylesChangedEvent(change: keyof TChangeKeys & string): void {
        this.eventSvc.dispatchEvent({
            type: 'stylesChanged',
            [`${change}Changed`]: true,
        });
    }

    // overridden by studio
    protected initStyledRoot(): void {
        this.addDestroyFunc(_initStyledRootFromInnerOfThreeElements(this, this.eRootDiv));
    }
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export type CssVariable<TChangeKeys extends BaseCssChangeKeys> = {
    changeKey: keyof TChangeKeys & string;
    type: ParamType;
    defaultValue: number;
    noWarn?: boolean;
    cacheDefault?: boolean;
};

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface BaseCssChangeKeys {
    theme: true;
    listItemHeight: true;
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
        if (el.isConnected || --retries < 0) {
            clearInterval(interval);
        }
    }, 1000);
    onDestroy(() => clearInterval(interval));
};
