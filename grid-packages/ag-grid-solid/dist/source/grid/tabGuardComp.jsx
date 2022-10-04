import { TabGuardCtrl } from 'ag-grid-community';
import { createSignal, onCleanup, onMount, useContext } from "solid-js";
import { BeansContext } from "./core/beansContext";
const TabGuardComp = (props) => {
    const { children, eFocusableElement, onTabKeyDown, gridCtrl } = props;
    const [tabIndex, setTabIndex] = createSignal();
    let eTopGuard;
    let eBottomGuard;
    let ctrl;
    const { context } = useContext(BeansContext);
    onMount(() => {
        const compProxy = {
            setTabIndex: value => value == null ? setTabIndex(undefined) : setTabIndex(parseInt(value, 10))
        };
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
    onCleanup(() => context.destroyBean(ctrl));
    return (<>
            <div class={`ag-tab-guard ag-tab-guard-top`} role="presentation" tabIndex={tabIndex()} ref={eTopGuard}></div>

            {children}

            <div class={`ag-tab-guard ag-tab-guard-bottom`} role="presentation" tabIndex={tabIndex()} ref={eBottomGuard}></div>
        </>);
};
export default TabGuardComp;
