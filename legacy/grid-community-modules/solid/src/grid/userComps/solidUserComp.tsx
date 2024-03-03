import { UserCompDetails } from '@ag-grid-community/core';
import { onCleanup } from 'solid-js';

const SolidUserComp = (props: {
    compDetails: UserCompDetails, 
    ref?: any
})=> {
    const SolidClass = props.compDetails.componentClass;

    let refSet = false;

    const setRef = (ref: any)=> {
        if (!props.ref) { return; }
        props.ref(ref);
        refSet = true;
    };

    onCleanup( ()=> {
        if (refSet) {
            props.ref && props.ref(undefined);
        }
    });

    return <SolidClass ref={setRef} { ...props.compDetails.params }/>;
};

export default SolidUserComp;
