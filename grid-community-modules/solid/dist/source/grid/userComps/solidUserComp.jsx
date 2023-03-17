import { onCleanup } from 'solid-js';
const SolidUserComp = (props) => {
    const SolidClass = props.compDetails.componentClass;
    let refSet = false;
    const setRef = (ref) => {
        if (!props.ref) {
            return;
        }
        props.ref(ref);
        refSet = true;
    };
    onCleanup(() => {
        if (refSet) {
            props.ref && props.ref(undefined);
        }
    });
    return <SolidClass ref={setRef} {...props.compDetails.params}/>;
};
export default SolidUserComp;
