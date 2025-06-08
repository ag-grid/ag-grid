import type { FilterDisplay, FilterDisplayParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import { AgPromise } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomFilterDisplayCallbacks, CustomFilterDisplayProps } from './interfaces';

export class FilterDisplayComponentWrapper
    extends CustomComponentWrapper<FilterDisplayParams, CustomFilterDisplayProps, CustomFilterDisplayCallbacks>
    implements FilterDisplay
{
    private resolveSetMethodsCallback!: () => void;
    private awaitSetMethodsCallback = new AgPromise<void>((resolve) => {
        this.resolveSetMethodsCallback = resolve;
    });

    public refresh(newParams: FilterDisplayParams): boolean {
        this.sourceParams = newParams;
        this.refreshProps();
        return true;
    }

    public afterGuiAttached(params?: IAfterGuiAttachedParams): void {
        const providedMethods = this.providedMethods;
        if (!providedMethods) {
            // setMethods hasn't been called yet
            this.awaitSetMethodsCallback.then(() => this.providedMethods?.afterGuiAttached?.(params));
        } else {
            providedMethods.afterGuiAttached?.(params);
        }
    }

    protected override getOptionalMethods(): string[] {
        return ['afterGuiDetached', 'onNewRowsLoaded', 'onAnyFilterChanged'];
    }

    protected override setMethods(methods: CustomFilterDisplayCallbacks): void {
        super.setMethods(methods);
        this.resolveSetMethodsCallback();
    }
}
