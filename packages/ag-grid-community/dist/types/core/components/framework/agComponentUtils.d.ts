import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection } from '../../context/context';
import type { IComponent } from '../../interfaces/iComponent';
import type { ICellRendererParams } from '../../rendering/cellRenderers/iCellRenderer';
export declare class AgComponentUtils extends BeanStub implements NamedBean {
    beanName: "agComponentUtils";
    private componentMetadataProvider;
    wireBeans(beans: BeanCollection): void;
    adaptFunction(propertyName: string, jsCompFunc: any): any;
    adaptCellRendererFunction(callback: any): {
        new (): IComponent<ICellRendererParams>;
    };
    doesImplementIComponent(candidate: any): boolean;
}
