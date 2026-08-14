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
    /** Whether a plain JavaScript function can be adapted into this component type. */
    supportsJsFunction?: boolean;
    mandatoryMethods?: (keyof TComp & string)[];
    optionalMethods?: (keyof TComp & string)[];
    /**
     * Set to true to force display:block on the .ag-react-wrapper element around custom react components
     *
     * By default the .ag-react-wrapper element around react custom components is display:contents so as not to break
     * flex child behaviour. But when the grid positions or measures the React wrapper element itself (e.g.
     * absolutely-positioned tooltips and drag images), the wrapper must be display:block.
     */
    requiresBlockWrapper?: boolean;
}
