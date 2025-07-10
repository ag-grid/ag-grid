import type { AgEvent } from './agEvent';
import type { AgFrameworkOverrides } from './agFrameworkOverrides';
import type { AgBaseBean } from './iBean';
import type { IEnvironment } from './iEnvironment';
import type { AgEventService } from './iEvent';
import type { ILocaleService } from './iLocaleService';

export interface AgCoreBeanCollection<
    TPropertiesService,
    TEventType extends string,
    TEventParams extends Record<TEventType, any>,
    TProcessedEvents extends AgEvent,
    TContext,
> {
    context: TContext;
    eventSvc: AgEventService<TEventType, TEventParams, TProcessedEvents>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
    environment: IEnvironment;
}

export type AgEventHandlers<TEventKey extends string, TEvent = any> = { [K in TEventKey]?: (event?: TEvent) => void };

export interface AgBaseContext<TBeanName extends string, TBeanCollection extends { [key in TBeanName]?: any }> {
    createBean<T extends AgBaseBean<TBeanCollection>>(
        bean: T,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): T;

    getBean<T extends TBeanName>(name: T): TBeanCollection[T];

    destroyBean(bean: AgBaseBean<TBeanCollection> | null | undefined): undefined;

    destroyBeans(beans: (AgBaseBean<TBeanCollection> | null | undefined)[]): [];
}
