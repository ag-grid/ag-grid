import {Autowired, Bean, PostConstruct} from "../../context/context";
import {IAfterGuiAttachedParams, IComponent} from "../../interfaces/iComponent";
import {AgGridComponentFunctionInput} from "./componentProvider";
import {AgComponentUtils} from "./agComponentUtils";

export interface ComponentMetadata {
    mandatoryMethodList:string[],
    optionalMethodList:string[],
    functionAdapter?:(callback:AgGridComponentFunctionInput)=>{new(): IComponent<any>}
}


@Bean("componentMetadataProvider")
export class ComponentMetadataProvider {
    private componentMetaData :{[key:string]:ComponentMetadata};

    @Autowired("agComponentUtils")
    private agComponentUtils: AgComponentUtils;

    @PostConstruct
    public postConstruct (){
        this.componentMetaData = {
            dateComponent: {
                mandatoryMethodList: ['getDate', 'setDate'],
                optionalMethodList: ['afterGuiAttached']
            },
            detailCellRenderer: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            headerComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            headerGroupComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            loadingOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            noRowsOverlayComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            floatingFilterComponent: {
                mandatoryMethodList: ['onParentModelChanged'],
                optionalMethodList: ['afterGuiAttached']
            },
            floatingFilterWrapperComponent: {
                mandatoryMethodList: [],
                optionalMethodList: []
            },
            cellRenderer:{
                mandatoryMethodList: [],
                optionalMethodList: ['refresh', 'afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            cellEditor:{
                mandatoryMethodList: ['getValue'],
                optionalMethodList: ['isPopup','isCancelBeforeStart','isCancelAfterEnd','focusIn','focusOut','afterGuiAttached']
            },
            innerRenderer:{
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            fullWidthCellRenderer:{
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            pinnedRowCellRenderer:{
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            groupRowInnerRenderer:{
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            groupRowRenderer:{
                mandatoryMethodList: [],
                optionalMethodList: ['afterGuiAttached'],
                functionAdapter: this.agComponentUtils.adaptCellRendererFunction.bind(this.agComponentUtils)
            },
            filter:{
                mandatoryMethodList: ['isFilterActive','doesFilterPass','getModel','setModel'],
                optionalMethodList: ['afterGuiAttached','onNewRowsLoaded','getModelAsString','onFloatingFilterChanged', 'afterGuiAttached']
            },
            filterComponent:{
                mandatoryMethodList: ['isFilterActive','doesFilterPass','getModel','setModel'],
                optionalMethodList: ['afterGuiAttached','onNewRowsLoaded','getModelAsString','onFloatingFilterChanged', 'afterGuiAttached']
            }
        }
    }

    public retrieve (name:string):ComponentMetadata{
        return this.componentMetaData[name];
    }
}