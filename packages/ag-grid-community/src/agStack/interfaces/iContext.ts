import type { AgEvent } from './agEvent';
import type { AgFrameworkOverrides } from './agFrameworkOverrides';
import type { AgBaseBean } from './iBean';
import type { IEnvironment } from './iEnvironment';
import type { AgEventService } from './iEvent';
import type { ILocaleService } from './iLocaleService';

export interface AgCoreBeanCollection<TBeanCollection, TPropertiesService, TGlobalEvents, TRawEvents extends AgEvent> {
    context: IContext<TBeanCollection>;
    eventSvc: AgEventService<TGlobalEvents, TRawEvents>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
    environment: IEnvironment;
}

export type AgEventHandlers<TEventKey extends string, TEvent = any> = { [K in TEventKey]?: (event?: TEvent) => void };

export interface IContext<TBeanCollection> {
    createBean<T extends AgBaseBean<TBeanCollection>>(
        bean: T,
        afterPreCreateCallback?: (bean: AgBaseBean<TBeanCollection>) => void
    ): T;

    getBean<T extends keyof TBeanCollection>(name: T): TBeanCollection[T];

    destroyBean(bean: AgBaseBean<TBeanCollection> | null | undefined): undefined;

    destroyBeans<T extends AgBaseBean<TBeanCollection>>(beans: (T | null | undefined)[]): T[];

    getId(): string;

    destroy(): void;

    isDestroyed(): boolean;
}
