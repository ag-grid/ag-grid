import type { AgFrameworkOverrides } from './agFrameworkOverrides';
import type { BaseEvents } from './baseEvents';
import type { BaseProperties } from './baseProperties';
import type { IAriaAnnouncementService } from './iAriaAnnouncementService';
import type { IContext } from './iContext';
import type { IDragService } from './iDrag';
import type { IDragAndDropService } from './iDragAndDrop';
import type { IEnvironment } from './iEnvironment';
import type { AgEventService } from './iEvent';
import type { IIconService } from './iIconService';
import type { ILocaleService } from './iLocaleService';
import type { IPopupService } from './iPopupService';
import type { IPropertiesService } from './iProperties';
import type { IRegistry } from './iRegistry';

export interface AgCoreBeanCollection<
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties, TCommon>,
> extends UtilBeanCollection {
    context: IContext<this>;
    eventSvc: AgEventService<TGlobalEvents, TCommon>;
    frameworkOverrides: AgFrameworkOverrides;
    gos: TPropertiesService;
    localeSvc?: ILocaleService;
    environment: IEnvironment;
    eRootDiv: HTMLElement;
    popupSvc?: IPopupService<any>;
    registry: IRegistry<this, 'tooltipFeature' | 'highlightTooltipFeature' | 'tooltipStateManager'>;
    iconSvc: IIconService<string, any>;
    dragSvc?: IDragService;
    dragAndDrop?: IDragAndDropService<any, any, any, any, any>;
    agChartsExports?: unknown; // this is intentionally left untyped
    ariaAnnounce: IAriaAnnouncementService;
}

/** This is a cut down version to simplify typing for util functions that don't need/want all the generics */
export interface UtilBeanCollection {
    eRootDiv: HTMLElement;
    gos: {
        get<K extends keyof BaseProperties>(prop: K): BaseProperties[K];

        isElementInThisInstance(element: HTMLElement): boolean;
    };
}
