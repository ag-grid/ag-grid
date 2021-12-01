import { Autowired, Bean } from "../../context/context";
import { IComponent } from "../../interfaces/iComponent";
import { ComponentMetadata, ComponentMetadataProvider } from "./componentMetadataProvider";
import { ICellRendererComp, ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { BeanStub } from "../../context/beanStub";
import { loadTemplate } from "../../utils/dom";

@Bean("agComponentUtils")
export class AgComponentUtils extends BeanStub {

    @Autowired("componentMetadataProvider")
    private componentMetadataProvider: ComponentMetadataProvider;

    public adaptFunction(propertyName: string, jsCompFunc: any): any {
        const metadata: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter) {
            return metadata.functionAdapter(jsCompFunc);
        }
        return null;
    }

    public adaptCellRendererFunction(callback: any): { new(): IComponent<ICellRendererParams>; } {
        class Adapter implements ICellRendererComp {
            private params: ICellRendererParams;

            refresh(params: ICellRendererParams): boolean {
                return false;
            }

            getGui(): HTMLElement {
                const callbackResult: string | HTMLElement = callback(this.params);
                const type = typeof callbackResult;
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    return loadTemplate('<span>' + callbackResult + '</span>');
                }
                if (callbackResult == null) {
                    return loadTemplate('<span></span>');
                }
                return callbackResult as HTMLElement;
            }

            init?(params: ICellRendererParams): void {
                this.params = params;
            }
        }

        return Adapter;
    }

    public doesImplementIComponent(candidate: any): boolean {
        if (!candidate) { return false; }
        return (candidate as any).prototype && 'getGui' in (candidate as any).prototype;
    }
}
