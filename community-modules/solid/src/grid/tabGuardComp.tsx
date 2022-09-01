import { GridCtrl, ITabGuard, TabGuardCtrl } from '@ag-grid-community/core';
import { createSignal, JSX, onCleanup, onMount, useContext } from "solid-js";
import { BeansContext } from "./core/beansContext";

interface TabGuardProps {
    children: JSX.Element,
    eFocusableElement: HTMLDivElement,
    onTabKeyDown: (e: KeyboardEvent) => void,
    gridCtrl: GridCtrl,
    ref: (ref: TabGuardRef)=>void
}

export interface TabGuardRef {
    forceFocusOutOfContainer(): void;
}

const TabGuardComp = (props: TabGuardProps)=> {

    const { children, eFocusableElement, onTabKeyDown, gridCtrl } = props;
    const [tabIndex, setTabIndex] = createSignal<number>();

    let eTopGuard: HTMLDivElement;
    let eBottomGuard: HTMLDivElement;
    let ctrl: TabGuardCtrl;

    const { context } = useContext(BeansContext);

    onMount(() => {

        const compProxy: ITabGuard = {
            setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
        }

        ctrl = context.createBean(new TabGuardCtrl({
            comp: compProxy,
            eTopGuard: eTopGuard,
            eBottomGuard: eBottomGuard,
            eFocusableElement: eFocusableElement,
            
            onTabKeyDown: onTabKeyDown,
            focusInnerElement: fromBottom => gridCtrl.focusInnerElement(fromBottom)
        }));

        props.ref({
            forceFocusOutOfContainer() {
                ctrl.forceFocusOutOfContainer();
            }
        });
    });

    onCleanup( ()=> context.destroyBean(ctrl) );

    return (
        <>
            <div class={ `ag-tab-guard ag-tab-guard-top` }
                role="presentation"
                tabIndex={ tabIndex() }
                ref={ eTopGuard! }></div>

            { children }

            <div class={ `ag-tab-guard ag-tab-guard-bottom` }
                role="presentation"
                tabIndex={ tabIndex() }
                ref={ eBottomGuard! }></div>
        </>
    )
};

export default TabGuardComp;