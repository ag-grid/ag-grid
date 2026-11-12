import type { AgFrameworkOverrides } from './agFrameworkOverrides';
import type { IContext } from './iContext';
import type { AgEventService } from './iEvent';
import type { ILocaleService } from './iLocaleService';
import type { IPropertiesService } from './iProperties';

/**
 * The beans available without a DOM. `AgBeanCollection` adds the root element and the services that drive it.
 * @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time.
 */
export interface AgCoreBeanCollection<
    TProperties,
    TGlobalEvents,
    TPropertiesService extends IPropertiesService<TProperties>,
> {
    context: IContext<this>;
    eventSvc: AgEventService<TGlobalEvents>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
}
