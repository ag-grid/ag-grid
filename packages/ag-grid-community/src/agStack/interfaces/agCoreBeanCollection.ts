import type { AgFrameworkOverrides } from './agFrameworkOverrides';
import type { BaseEvents } from './baseEvents';
import type { IContext } from './iContext';
import type { IEnvironment } from './iEnvironment';
import type { AgEventService } from './iEvent';
import type { IIconService } from './iIconService';
import type { ILocaleService } from './iLocaleService';
import type { BasePopupPositionParams } from './iPopup';
import type { IPopupService } from './iPopupService';
import type { IRegistry } from './iRegistry';

export interface AgCoreBeanCollection<TBeanCollection, TPropertiesService, TGlobalEvents extends BaseEvents, TCommon> {
    context: IContext<TBeanCollection>;
    eventSvc: AgEventService<TGlobalEvents, TCommon>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
    environment: IEnvironment;
    eRootDiv: HTMLElement;
    popupSvc?: IPopupService<BasePopupPositionParams>;
    registry: IRegistry<TBeanCollection, 'tooltipFeature' | 'tooltipStateManager'>;
    iconSvc: IIconService<string, any>;
}
