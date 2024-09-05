import type { DragAndDropIcon, IDragAndDropImageComp, IDragAndDropImageParams } from '@ag-grid-community/core';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomDragAndDropImageProps } from './interfaces';

export class DragAndDropImageComponentWrapper
    extends CustomComponentWrapper<IDragAndDropImageParams, CustomDragAndDropImageProps, object>
    implements IDragAndDropImageComp
{
    private label: string = '';
    private icon: DragAndDropIcon | null = null;
    private shake: boolean = false;

    public setIcon(iconName: DragAndDropIcon, shake: boolean): void {
        this.icon = iconName;
        this.shake = shake;

        this.refreshProps();
    }

    public setLabel(label: string): void {
        this.label = label;
        this.refreshProps();
    }

    protected override getProps(): CustomDragAndDropImageProps {
        const props = super.getProps();
        const { label, icon, shake } = this;

        props.label = label;
        props.icon = icon;
        props.shake = shake;

        return props;
    }
}
