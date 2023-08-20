import { TabGuardClassNames, TabGuardCtrl } from '@ag-grid-community/core';
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
            <div class={`${TabGuardClassNames.TAB_GUARD} ${TabGuardClassNames.TAB_GUARD_TOP}`} role="presentation" tabIndex={tabIndex()} ref={eTopGuard}></div>

            {children}

            <div class={`${TabGuardClassNames.TAB_GUARD} ${TabGuardClassNames.TAB_GUARD_BOTTOM}`} role="presentation" tabIndex={tabIndex()} ref={eBottomGuard}></div>
        </>);
};
export default TabGuardComp;
