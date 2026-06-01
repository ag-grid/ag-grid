import type { AgPromise, IComponent } from 'ag-stack';

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface UserCompDetails<TComp extends IComponent<any> = any> {
    componentClass: any;
    componentFromFramework: boolean;
    params: any;
    type: ComponentType;
    popupFromSelector?: boolean;
    popupPositionFromSelector?: 'over' | 'under';
    newAgStackInstance: () => AgPromise<TComp>;
}

/** @internal AG_GRID_INTERNAL - Not for public use. Can change / be removed at any time. */
export interface ComponentType<TComp = any> {
    name: string;
    cellRenderer?: boolean;
    mandatoryMethods?: (keyof TComp & string)[];
    optionalMethods?: (keyof TComp & string)[];
}
