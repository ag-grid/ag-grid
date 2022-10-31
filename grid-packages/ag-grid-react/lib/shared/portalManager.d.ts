// ag-grid-react v28.2.1
import { Component, ReactPortal } from "react";
import { ReactComponent } from "./reactComponent";
export declare class PortalManager {
    private static MAX_COMPONENT_CREATION_TIME_IN_MS;
    private parent;
    private wrappingElement;
    private destroyed;
    private portals;
    private hasPendingPortalUpdate;
    private maxComponentCreationTimeMs;
    constructor(parent: Component, wrappingElement?: string, maxComponentCreationTimeMs?: number);
    getPortals(): ReactPortal[];
    destroy(): void;
    destroyPortal(portal: ReactPortal): void;
    getComponentWrappingElement(): string | undefined;
    mountReactPortal(portal: ReactPortal, reactComponent: ReactComponent, resolve: (value: any) => void): void;
    updateReactPortal(oldPortal: ReactPortal, newPortal: ReactPortal): void;
    private batchUpdate;
    waitForInstance(reactComponent: ReactComponent, resolve: (value: any) => void, startTime?: number): void;
}
