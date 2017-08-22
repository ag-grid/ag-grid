import {ComponentSource, ComponentType, ResolvedComponent} from "./componentResolver";
import {Autowired, Bean} from "../../context/context";
import {
    AgGridComponentFunctionInput, AgGridRegisteredComponentInput, ComponentProvider,
    RegisteredComponent, RegisteredComponentSource
} from "./componentProvider";
import {IAfterGuiAttachedParams, IComponent} from "../../interfaces/iComponent";
import {AgComponentUtils} from "./agComponentUtils";

@Bean("namedComponentResolver")
export class NamedComponentResolver {
    @Autowired("componentProvider")
    private componentProvider: ComponentProvider;

    @Autowired("agComponentUtils")
    private agComponentUtils: AgComponentUtils;


    public resolve<A extends IComponent<any, IAfterGuiAttachedParams> & B, B> (
        propertyName:string,
        componentNameOpt?:string
    ):ResolvedComponent<A, B>{
        let componentName:string = componentNameOpt != null ? componentNameOpt : propertyName;

        let registeredComponent:RegisteredComponent<A,B> = this.componentProvider.retrieve(componentName);
        if (registeredComponent == null) return null;

        //If it is a FW it has to be registered as a component
        if (registeredComponent.type == ComponentType.FRAMEWORK){
            return {
                component: <{new(): B}>registeredComponent.component,
                type: ComponentType.FRAMEWORK,
                source: ComponentSource.REGISTERED_BY_NAME
            }
        }


        //If it is JS it may be a function or a component
        if (this.agComponentUtils.doesImplementIComponent(<AgGridRegisteredComponentInput<A>>registeredComponent.component)){
            return {
                component: <{new(): A}>registeredComponent.component,
                type: ComponentType.AG_GRID,
                source: (registeredComponent.source == RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT
            }
        }

        // This is a function
        return this.agComponentUtils.adaptFunction(
            propertyName,
            <AgGridComponentFunctionInput>registeredComponent.component,
            registeredComponent.type,
            (registeredComponent.source == RegisteredComponentSource.REGISTERED) ? ComponentSource.REGISTERED_BY_NAME : ComponentSource.DEFAULT
        );
    }
}