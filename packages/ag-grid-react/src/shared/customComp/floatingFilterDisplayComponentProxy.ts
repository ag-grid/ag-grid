import type { FloatingFilterDisplay, FloatingFilterDisplayParams } from 'ag-grid-community';

import { addOptionalMethods } from './customComponentWrapper';
import type { CustomFloatingFilterCallbacks, CustomFloatingFilterDisplayProps } from './interfaces';

export class FloatingFilterDisplayComponentProxy implements FloatingFilterDisplay {
    constructor(
        private floatingFilterParams: FloatingFilterDisplayParams,
        private readonly refreshProps: () => void
    ) {}

    public getProps(): CustomFloatingFilterDisplayProps {
        return this.floatingFilterParams;
    }

    public refresh(params: FloatingFilterDisplayParams): void {
        this.floatingFilterParams = params;
        this.refreshProps();
    }

    public setMethods(methods: CustomFloatingFilterCallbacks): void {
        addOptionalMethods(this.getOptionalMethods(), methods, this);
    }

    private getOptionalMethods(): string[] {
        return ['afterGuiAttached'];
    }
}
