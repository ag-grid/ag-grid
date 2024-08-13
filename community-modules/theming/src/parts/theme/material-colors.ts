import { createPart } from '../../theme-types';

// prettier-ignore
export const materialColors =
    /*#__PURE__*/
    createPart('materialPrimaryColor', 'part')
    .overrideParams({
        accentColor: "#ff4081"
    })
    .addParams({
        primaryColor: '#3f51b5'
    });
