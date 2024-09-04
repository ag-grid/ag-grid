import type { DragAndDropIcon, IDragAndDropCoverComp, IDragAndDropCoverParams } from 'ag-grid-community';

import { CustomComponentWrapper } from './customComponentWrapper';
import type { CustomDragAndDropCoverProps } from './interfaces';

export class DragAndDropCoverComponentWrapper
    extends CustomComponentWrapper<IDragAndDropCoverParams, CustomDragAndDropCoverProps, object>
    implements IDragAndDropCoverComp
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

    protected override getProps(): CustomDragAndDropCoverProps {
        const props = super.getProps();
        const { label, icon, shake } = this;

        props.label = label;
        props.icon = icon;
        props.shake = shake;

        return props;
    }
}
