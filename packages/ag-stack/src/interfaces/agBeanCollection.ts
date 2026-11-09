import type { AgCoreBeanCollection } from './agCoreBeanCollection';
import type { BaseEvents } from './baseEvents';
import type { BaseProperties } from './baseProperties';
import type { IAriaAnnouncementService } from './iAriaAnnouncementService';
import type { IContext } from './iContext';
import type { IDragService } from './iDrag';
import type { IDragAndDropService } from './iDragAndDrop';
import type { IEnvironment } from './iEnvironment';
import type { AgEventService, AgRawEvents } from './iEvent';
import type { IIconService } from './iIconService';
import type { IPopupService } from './iPopupService';
import type { IPropertiesService } from './iProperties';
import type { IRegistry } from './iRegistry';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface AgBeanCollection<
    TProperties extends BaseProperties,
    TGlobalEvents extends BaseEvents,
    TCommon,
    TPropertiesService extends IPropertiesService<TProperties>,
>
    extends UtilBeanCollection, AgCoreBeanCollection<TProperties, TGlobalEvents, TPropertiesService> {
    context: IContext<this>;
    eventSvc: AgEventService<TGlobalEvents, AgRawEvents<TGlobalEvents, TCommon> | BaseEvents[keyof BaseEvents]>;
    // Redeclared to resolve the two inherited declarations to the full service.
    gos: TPropertiesService;
    environment: IEnvironment;
    eRootDiv: HTMLElement;
    hasAncestorStyledRoot?: boolean;
    popupSvc?: IPopupService<any>;
    registry: IRegistry<this, 'tooltipFeature' | 'highlightTooltipFeature' | 'tooltipStateManager'>;
    iconSvc: IIconService<string, any>;
    dragSvc?: IDragService;
    dragAndDrop?: IDragAndDropService<any, any, any, any, any>;
    ariaAnnounce: IAriaAnnouncementService;
}

/** This is a cut down version to simplify typing for util functions that don't need/want all the generics */
export interface UtilBeanCollection {
    eRootDiv: HTMLElement;
    gos: {
        get<K extends keyof BaseProperties>(prop: K): BaseProperties[K];
    };
    environment: Pick<IEnvironment, 'isElementInThisInstance'>;
}
