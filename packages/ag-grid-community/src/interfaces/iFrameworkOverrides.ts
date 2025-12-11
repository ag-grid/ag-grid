import type { LocalEventService } from '../agStack/events/localEventService';
import type { AgFrameworkOverrides } from '../agStack/interfaces/agFrameworkOverrides';
import type { IFrameworkEventListenerService } from './iFrameworkEventListenerService';

export interface IFrameworkOverrides extends AgFrameworkOverrides {
    /** Used for Angular event listener wrapping */
    createLocalEventListenerWrapper?(
        existingFrameworkEventListenerService: IFrameworkEventListenerService<any, any> | undefined,
        localEventService: LocalEventService<any>
    ): IFrameworkEventListenerService<any, any> | undefined;

    /** Used for Angular event listener wrapping */
    createGlobalEventListenerWrapper?(): IFrameworkEventListenerService<any, any>;

    /*
     * vue components are specified in the "components" part of the vue component - as such we need a way to deteremine if a given component is
     * within that context - this method provides this
     * Note: This is only really used/necessary with cellRendererSelectors
     */
    frameworkComponent(name: string, components?: any): any;

    /*
     * Allows framework to identify if a class is a component from that framework.
     */
    isFrameworkComponent(comp: any): boolean;

    /**
     * Allows Angular to batch render Cell Components all within a single Angular ngZone.run().
     */
    readonly batchFrameworkComps: boolean;

    /**
     * Which rendering engine is used for the grid components. Can be either 'vanilla' or 'react'.
     */
    readonly renderingEngine: 'vanilla' | 'react';

    /**
     * Returns the framework specific url for linking to a documentation page.
     * @param path Optional path to append to the base url. i.e 'aligned-grids' Does not need the leading `/`
     */
    getDocLink(path?: string): string;

    /** Used by `RowRenderer` when getting lock. Allows React async refreshes to work. */
    getLockOnRefresh?(): void;

    /** Used by `RowRenderer` when releasing lock. Allows React async refreshes to work. */
    releaseLockOnRefresh?(): void;

    /** Used by the CtrlsService to decide whether to trigger the whenReady callbacks asynchronously.
     * Required for React to work with StrictMode from v19 with the current implementation of the CtrlsService.
     */
    runWhenReadyAsync?(): boolean;
}
