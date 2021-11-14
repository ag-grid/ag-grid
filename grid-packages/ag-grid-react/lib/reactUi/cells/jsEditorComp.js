// ag-grid-react v26.2.0
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
const JsEditorComp = (props: {setCellEditorRef: (cellEditor: ICellEditor | undefined)=>void,
    compDetails: UserCompDetails, eParentElement: HTMLElement}) => {

    const {context} = useContext(BeansContext);

    useEffect(() => {

        const {compDetails, eParentElement, setCellEditorRef} = props;

        const cellEditor = createJsComp(context, factory => factory.createCellEditor(compDetails) ) as ICellEditorComp;
        if (!cellEditor) { return; }

        const compGui = cellEditor.getGui();

        if (compGui) {
            eParentElement.appendChild(cellEditor.getGui());
        }

        setCellEditorRef(cellEditor);

        cellEditor.afterGuiAttached && cellEditor.afterGuiAttached();

        return () => {
            context.destroyBean(cellEditor);
            setCellEditorRef(undefined);
            if (compGui && compGui.parentElement) {
                compGui.parentElement.removeChild(compGui);
            }
        };
    }, []);

    return (
        <></>
    );
};

export default memo(JsEditorComp);
*/ 
