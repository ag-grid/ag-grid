import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
export interface HorizontalResizeParams {
    eResizeBar: HTMLElement;
    dragStartPixels?: number;
    onResizeStart: (shiftKey: boolean) => void;
    onResizing: (delta: number) => void;
    onResizeEnd: (delta: number) => void;
}
export declare class HorizontalResizeService extends BeanStub implements NamedBean {
    beanName: "horizontalResizeService";
    private dragService;
    private ctrlsService;
    wireBeans(beans: BeanCollection): void;
    private dragStartX;
    private resizeAmount;
    addResizeBar(params: HorizontalResizeParams): () => void;
    private onDragStart;
    private setResizeIcons;
    private onDragStop;
    private resetIcons;
    private onDragging;
}
