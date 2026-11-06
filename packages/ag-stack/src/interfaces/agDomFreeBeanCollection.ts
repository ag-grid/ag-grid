import type { AgFrameworkOverrides } from './agFrameworkOverrides';
import type { IContext } from './iContext';
import type { AgInternalEventService } from './iDomFreeEvent';
import type { IDomFreePropertiesService } from './iDomFreeProperties';
import type { ILocaleService } from './iLocaleService';

/**
 * The beans available without a DOM. `AgCoreBeanCollection` adds the root element and the services that drive it.
 */
export interface AgDomFreeBeanCollection<
    TProperties,
    TGlobalEvents,
    TPropertiesService extends IDomFreePropertiesService<TProperties>,
> {
    context: IContext<this>;
    eventSvc: AgInternalEventService<TGlobalEvents>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
}
