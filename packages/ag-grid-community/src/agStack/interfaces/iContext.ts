import type { AgEvent } from './agEvent';
import type { AgFrameworkOverrides } from './agFrameworkOverrides';
import type { AgBaseBean } from './iBean';
import type { IEnvironment } from './iEnvironment';
import type { AgEventService } from './iEvent';
import type { ILocaleService } from './iLocaleService';

export interface AgCoreBeanCollection<TPropertiesService, TEventParams, TProcessedEvents extends AgEvent, TContext> {
    context: TContext;
    eventSvc: AgEventService<TEventParams, TProcessedEvents>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
    environment: IEnvironment;
}

export type AgEventHandlers<TEventKey extends string, TEvent = any> = { [K in TEventKey]?: (event?: TEvent) => void };

export interface AgBaseContext<TBeanCollection> {
    createBean<T extends AgBaseBean<TBeanCollection>>(
        bean: T,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): T;

    getBean<T extends keyof TBeanCollection>(name: T): TBeanCollection[T];

    destroyBean(bean: AgBaseBean<TBeanCollection> | null | undefined): undefined;

    destroyBeans(beans: (AgBaseBean<TBeanCollection> | null | undefined)[]): [];
}
