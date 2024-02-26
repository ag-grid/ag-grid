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
                    this.eGui = loadTemplate('<span>' + callbackResult + '</span>');
                    return;
                }
                if (callbackResult==null) {
                    this.eGui = loadTemplate('<span></span>');
                    return;
                }
                this.eGui =  callbackResult as HTMLElement;
            }
        }

        return Adapter;
    }

    public doesImplementIComponent(candidate: any): boolean {
        if (!candidate) { return false; }
        return (candidate as any).prototype && 'getGui' in (candidate as any).prototype;
    }
}
