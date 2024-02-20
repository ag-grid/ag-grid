import type { BBoxProvider } from '../../util/bboxset';
import { Listeners } from '../../util/listeners';
import type { InteractionEvent, InteractionManager, InteractionTypes } from './interactionManager';
import { InteractionState } from './interactionManager';
export type RegionName = 'legend' | 'pagination';
type RegionHandler<Event extends InteractionEvent> = (event: Event) => void;
declare class RegionListeners extends Listeners<InteractionTypes, RegionHandler<InteractionEvent<InteractionTypes>>> {
}
type Region = {
    name: RegionName;
    listeners: RegionListeners;
};
export declare class RegionManager {
    private interactionManager;
    currentRegion?: Region;
    private eventHandler;
    private regions;
    private readonly destroyFns;
    constructor(interactionManager: InteractionManager);
    destroy(): void;
    private pushRegion;
    addRegion(name: RegionName, bboxprovider: BBoxProvider): {
        addListener<T extends "click" | "dblclick" | "contextmenu" | "hover" | "drag-start" | "drag" | "drag-end" | "leave" | "page-left" | "wheel">(type: T, handler: RegionHandler<InteractionEvent<T>>, triggeringStates?: InteractionState): () => void;
    };
    private processEvent;
    private pickRegion;
}
export {};
