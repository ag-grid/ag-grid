import type { FloatingFilterDisplay, FloatingFilterDisplayParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomFloatingFilterCallbacks, CustomFloatingFilterDisplayProps } from './interfaces';

// floating filter is normally instantiated via react header filter cell comp, but not in the case of multi filter
export class FloatingFilterDisplayComponentWrapper
    extends CustomComponentWrapper<
        FloatingFilterDisplayParams,
        CustomFloatingFilterDisplayProps,
        CustomFloatingFilterCallbacks
    >
    implements FloatingFilterDisplay
{
    public refresh(newParams: FloatingFilterDisplayParams): void {
        this.sourceParams = newParams;
        this.refreshProps();
    }

    protected override getOptionalMethods(): string[] {
        return ['afterGuiAttached'];
    }
}
