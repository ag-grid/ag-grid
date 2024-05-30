import type { NamedBean } from '../../context/bean';
import { BeanStub } from '../../context/beanStub';
import type { BeanCollection, BeanName } from '../../context/context';
import type { IComponent } from '../../interfaces/iComponent';
import type { ICellRendererComp, ICellRendererParams } from '../../rendering/cellRenderers/iCellRenderer';
import { _loadTemplate } from '../../utils/dom';
import type { ComponentMetadata, ComponentMetadataProvider } from './componentMetadataProvider';

export class AgComponentUtils extends BeanStub implements NamedBean {
    beanName = 'agComponentUtils' as const;

    private componentMetadataProvider: ComponentMetadataProvider;

    public wireBeans(beans: BeanCollection): void {
        this.componentMetadataProvider = beans.componentMetadataProvider;
    }

    public adaptFunction(propertyName: string, jsCompFunc: any): any {
        const metadata: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter) {
            return metadata.functionAdapter(jsCompFunc);
        }
        return null;
    }

    public adaptCellRendererFunction(callback: any): { new (): IComponent<ICellRendererParams> } {
        class Adapter implements ICellRendererComp {
            private eGui: HTMLElement;

            refresh(params: ICellRendererParams): boolean {
                return false;
            }

            getGui(): HTMLElement {
                return this.eGui;
            }

            init?(params: ICellRendererParams): void {
                const callbackResult: string | HTMLElement = callback(params);
                const type = typeof callbackResult;
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    this.eGui = _loadTemplate('<span>' + callbackResult + '</span>');
                    return;
                }
                if (callbackResult == null) {
                    this.eGui = _loadTemplate('<span></span>');
                    return;
                }
                this.eGui = callbackResult as HTMLElement;
            }
        }

        return Adapter;
    }

    public doesImplementIComponent(candidate: any): boolean {
        if (!candidate) {
            return false;
        }
        return (candidate as any).prototype && 'getGui' in (candidate as any).prototype;
    }
}
