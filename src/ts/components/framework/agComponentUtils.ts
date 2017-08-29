import {Autowired, Bean} from "../../context/context";
import {AgGridComponentFunctionInput, AgGridRegisteredComponentInput} from "./componentProvider";
import {IAfterGuiAttachedParams, IComponent} from "../../interfaces/iComponent";
import {ComponentMetadata, ComponentMetadataProvider} from "./componentMetadataProvider";
import {ComponentSource, ComponentType, ResolvedComponent} from "./componentResolver";
import {ICellRendererComp, ICellRendererParams} from "../../rendering/cellRenderers/iCellRenderer";
import {_} from "../../utils";

export class DefaultCellRenderer implements ICellRendererComp{
    private params:ICellRendererParams;

    init?(params: ICellRendererParams): void {
        this.params = params;
    }

    refresh(params: any): boolean {
        this.params = params;
        //We update params, but still wish to be called on getGui
        return false;
    }

    getGui(): HTMLElement|string {
        let valueToUse = this.params.valueFormatted != null ? this.params.valueFormatted : this.params.value;
        if (valueToUse == null) return '';
        return '<span>' + valueToUse + '</span>';
    }

}

@Bean("agComponentUtils")
export class AgComponentUtils {
    @Autowired("componentMetadataProvider")
    private componentMetadataProvider:ComponentMetadataProvider;

    public adaptFunction <A extends IComponent<any, IAfterGuiAttachedParams> & B, B>(
        propertyName:string,
        hardcodedJsFunction: AgGridComponentFunctionInput,
        type:ComponentType,
        source:ComponentSource
    ):ResolvedComponent<A,B>{
        if (hardcodedJsFunction == null) return {
            component: null,
            type: type,
            source: source
        };

        let metadata:ComponentMetadata = this.componentMetadataProvider.retrieve(propertyName);
        if (metadata && metadata.functionAdapter){
            return {
                type: type,
                component: <{new(): A}>metadata.functionAdapter(hardcodedJsFunction),
                source: source
            }
        }
        console.error(`It seems like you are providing a function as a component: ${hardcodedJsFunction}, but this component: [${propertyName}] doesnt accept functions`)
        return null;
    }

    public adaptCellRendererFunction (callback:AgGridComponentFunctionInput):{new(): IComponent<any, IAfterGuiAttachedParams>}{
        class Adapter implements ICellRendererComp{
            private params: ICellRendererParams;

            refresh(params: any): boolean {
                return false;
            }

            getGui(): HTMLElement|string {
                let callbackResult: string | HTMLElement = callback(this.params);
                if (callbackResult == null) return '';
                if (typeof callbackResult != 'string') return callbackResult;

                return callbackResult;
            }


            init?(params: ICellRendererParams): void {
                this.params = params;
            }

        }
        return Adapter;
    }


    public doesImplementIComponent(candidate: AgGridRegisteredComponentInput<IComponent<any, IAfterGuiAttachedParams>>): boolean {
        if (!candidate) return false;
        return (<any>candidate).prototype && 'getGui' in (<any>candidate).prototype;
    }
}