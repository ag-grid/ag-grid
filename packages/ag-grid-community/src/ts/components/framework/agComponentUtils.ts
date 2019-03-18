import { Autowired, Bean } from "../../context/context";
import { AgGridComponentFunctionInput, AgGridRegisteredComponentInput } from "./userComponentRegistry";
import { IComponent } from "../../interfaces/iComponent";
import { ComponentMetadata, ComponentMetadataProvider } from "./componentMetadataProvider";
import { ComponentClassDef, ComponentSource } from "./userComponentFactory";
import { ICellRendererComp, ICellRendererParams } from "../../rendering/cellRenderers/iCellRenderer";
import { _ } from "../../utils";

@Bean("agComponentUtils")
export class AgComponentUtils {

    @Autowired("componentMetadataProvider")
    private componentMetadataProvider: ComponentMetadataProvider;

    public adaptFunction<A extends IComponent<any> & B, B>(
        propertyName: string,
        hardcodedJsFunction: AgGridComponentFunctionInput,
        componentFromFramework: boolean,
        source: ComponentSource
    ): ComponentClassDef<A, B> {
        if (hardcodedJsFunction == null) { return {
            component: null,
            componentFromFramework: componentFromFramework,
            source: source,
            paramsFromSelector: null
        };
        }

        const metadata: ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter) {
            return {
                componentFromFramework: componentFromFramework,
                component: metadata.functionAdapter(hardcodedJsFunction) as { new(): A },
                source: source,
                paramsFromSelector: null
            };
        }
        return null;
    }

    public adaptCellRendererFunction(callback: AgGridComponentFunctionInput): { new(): IComponent<any> } {
        class Adapter implements ICellRendererComp {
            private params: ICellRendererParams;

            refresh(params: any): boolean {
                return false;
            }

            getGui(): HTMLElement {
                const callbackResult: string | HTMLElement = callback(this.params);
                const type = typeof callbackResult;
                if (type === 'string' || type === 'number' || type === 'boolean') {
                    return _.loadTemplate('<span>' + callbackResult + '</span>');
                } else {
                    return callbackResult as HTMLElement;
                }
            }

            init?(params: ICellRendererParams): void {
                this.params = params;
            }
        }

        return Adapter;
    }

    public doesImplementIComponent(candidate: AgGridRegisteredComponentInput<IComponent<any>>): boolean {
        if (!candidate) { return false; }
        return (candidate as any).prototype && 'getGui' in (candidate as any).prototype;
    }
}