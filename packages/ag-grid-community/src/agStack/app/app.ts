import type { AgBeanStubEvent } from '../agBeanStub';
import { AgBeanStub } from '../agBeanStub';
import { AgComponentStub } from '../agComponentStub';
import type { AgSingletonBeanClass } from '../baseServices/agContext';
import { AgContext } from '../baseServices/agContext';
import { BaseEventService } from '../baseServices/baseEventService';
import { BasePopupService } from '../baseServices/basePopupService';
import { BaseRegistry } from '../baseServices/baseRegistry';
import type { BaseEvents } from '../interfaces/baseEvents';
import type { BaseProperties } from '../interfaces/baseProperties';
import type { AgCoreBeanCollection } from '../interfaces/iContext';
import type { WithoutCommon } from '../interfaces/iEvent';
import type { IIconService } from '../interfaces/iIconService';
import type { ILocaleService, LocaleTextFunc } from '../interfaces/iLocaleService';
import type { BasePopupPositionParams } from '../interfaces/iPopup';
import type { AgPropertyKey, AgPropertyValueChangedListener, IPropertiesService } from '../interfaces/iProperties';
import { LocalEventService } from '../localEventService';
import { _createAgElement } from '../utils/domUtils';
import { _getLocaleTextFromFunc, _getLocaleTextFromMap } from '../utils/localeUtils';
import type { AgInputTextFieldParams } from '../widgets/agInputTextField';
import { AgInputTextFieldSelector } from '../widgets/agInputTextField';
import type { AgSelectParams } from '../widgets/agSelect';
import { AgSelectSelector } from '../widgets/agSelect';
import type { AgWidgetSelectorType } from '../widgets/agWidgetSelectorType';

interface AppProperties extends BaseProperties {
    localeText?: { [key: string]: string };
    getLocaleText: (params: { key: string; defaultValue: string; variableValues?: string[] }) => string;
}

const APP_PROPERTY_DEFAULTS = {
    tabIndex: 0,
} as const;

interface AppEvents extends BaseEvents {}

type AppPropertiesDefaultsKeys = keyof typeof APP_PROPERTY_DEFAULTS;

export type AppPropertyOrDefault<K extends keyof AppProperties> = K extends typeof APP_PROPERTY_DEFAULTS
    ? NonNullable<AppProperties[K]>
    : AppProperties[K];

type PartialAppPropertiesWithDefaults = { [K in keyof AppProperties]: AppPropertyOrDefault<K> };

export type AppPropertiesWithDefaults = Required<Pick<PartialAppPropertiesWithDefaults, AppPropertiesDefaultsKeys>> &
    Omit<PartialAppPropertiesWithDefaults, AppPropertiesDefaultsKeys>;

export interface AppApi {}

export interface AppCommon {
    api: AppApi;
}

interface AppBeanCollection
    extends AgCoreBeanCollection<AppBeanCollection, AppPropertiesService, AppEvents, AppCommon> {
    gos: AppPropertiesService;
    options: AppProperties;
}

class AppPropertiesService
    extends AgBeanStub<
        AppBeanCollection,
        AppPropertiesWithDefaults,
        AppEvents,
        AppCommon,
        AppPropertiesService,
        AgBeanStubEvent
    >
    implements IPropertiesService<AppPropertiesWithDefaults, AppCommon>
{
    public beanName = 'gos' as const;

    private propEventSvc: LocalEventService<keyof AppProperties> = new LocalEventService();

    private options: AppProperties;

    public wireBeans(beans: AppBeanCollection): void {
        this.options = beans.options;
    }

    public addPropertyEventListener<K extends keyof AppProperties>(
        key: K,
        listener: AgPropertyValueChangedListener<AppPropertiesWithDefaults, K>
    ): void {
        this.propEventSvc.addEventListener(key, listener);
    }

    public removePropertyEventListener<K extends keyof AppProperties>(
        key: K,
        listener: AgPropertyValueChangedListener<AppPropertiesWithDefaults, K>
    ): void {
        this.propEventSvc.removeEventListener(key, listener);
    }

    public get<K extends AgPropertyKey<AppPropertiesWithDefaults>>(property: K): AppPropertiesWithDefaults[K] {
        return (this.options[property] ??
            APP_PROPERTY_DEFAULTS[property as keyof typeof APP_PROPERTY_DEFAULTS]) as AppPropertiesWithDefaults[K];
    }

    public addCommon<T extends AppCommon>(params: WithoutCommon<AppCommon, T>): T {
        // TODO
        return params as T;
    }
}

class AppLocaleService
    extends AgBeanStub<
        AppBeanCollection,
        AppPropertiesWithDefaults,
        AppEvents,
        AppCommon,
        AppPropertiesService,
        AgBeanStubEvent
    >
    implements ILocaleService
{
    beanName = 'localeSvc' as const;

    public override getLocaleTextFunc(): LocaleTextFunc {
        const gos = this.gos;
        const getLocaleText = gos.get('getLocaleText');
        if (getLocaleText) {
            return _getLocaleTextFromFunc(getLocaleText);
        }

        return _getLocaleTextFromMap(gos.get('localeText'));
    }
}

class AppPopupService extends BasePopupService<
    AppBeanCollection,
    AppPropertiesWithDefaults,
    AppEvents,
    AppCommon,
    AppPropertiesService,
    BasePopupPositionParams
> {
    protected override getDefaultPopupParent(): HTMLElement {
        return this.beans.eRootDiv;
    }

    protected override callPostProcessPopup(): void {
        // do nothing
    }

    protected override isStopPropagation(): boolean {
        return false;
    }
}

type AppDynamicBeanName = 'tooltipFeature';

class AppRegistry extends BaseRegistry<
    AppBeanCollection,
    AppPropertiesWithDefaults,
    AppEvents,
    AppCommon,
    AppPropertiesService,
    AppDynamicBeanName
> {
    public postConstruct(): void {
        this.registerDynamicBeans({});
    }

    protected override getDynamicError(): string {
        return 'TODO';
    }
}

class AppRootComp extends AgComponentStub<
    AppBeanCollection,
    AppPropertiesWithDefaults,
    AppEvents,
    AppCommon,
    AppPropertiesService,
    AgWidgetSelectorType
> {
    public postConstruct(): void {
        this.setTemplate(
            {
                tag: 'div',
                cls: 'ag-app-root',
                children: [
                    {
                        tag: 'ag-input-text-field',
                        ref: 'eInput',
                    },
                    {
                        tag: 'ag-select',
                        ref: 'eSelect',
                    },
                ],
            },
            [AgInputTextFieldSelector, AgSelectSelector],
            {
                eInput: {
                    label: 'Test',
                    // eslint-disable-next-line no-console
                    onValueChange: (value) => console.log('input', value),
                } as AgInputTextFieldParams<AgWidgetSelectorType>,
                eSelect: {
                    options: [
                        {
                            value: 'value1',
                        },
                    ],
                    label: 'Select',
                    // eslint-disable-next-line no-console
                    onValueChange: (value) => console.log('select', value),
                } as AgSelectParams<AgWidgetSelectorType>,
            }
        );
        this.beans.eRootDiv.appendChild(this.getGui());
    }
}

class AppIconService implements IIconService<string, any> {
    beanName = 'iconSvc' as const;

    public createIconNoSpan(iconName: string): Element | undefined {
        return _createAgElement({
            tag: 'span',
            cls: `ag-icon ag-icon-${iconName}`,
            role: 'presentation',
            attrs: { unselectable: 'on' },
        });
    }
}

export function createApp(eRootDiv: HTMLElement, options: AppProperties) {
    if (!options) {
        return;
    }
    const providedBeanInstances: Partial<AppBeanCollection> = {
        eRootDiv,
        frameworkOverrides: {
            wrapIncoming: (callback) => callback(),
        },
        environment: {
            beanName: 'environment' as const,
            addGlobalCSS: () => {},
            applyThemeClasses: () => {},
        },
        options,
    };

    const beanClasses: AgSingletonBeanClass<AppBeanCollection>[] = [
        BaseEventService<AppBeanCollection, AppPropertiesWithDefaults, AppEvents, AppCommon, AppPropertiesService>,
        AppPropertiesService,
        AppLocaleService,
        AppPopupService,
        AppRegistry,
        AppIconService,
    ];

    const context = new AgContext<AppBeanCollection>({
        providedBeanInstances,
        beanClasses,
        id: '1',
    });

    context.createBean(new AppRootComp());
}
