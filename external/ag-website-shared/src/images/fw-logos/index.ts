import type { Framework } from '@ag-grid-types';

import angularSvg from './angular.svg';
import javascriptSvg from './javascript.svg';
import nextjsSvg from './nextjs.svg';
import nextjsInvertedSvg from './nextjs_inverted.svg';
import reactSvg from './react.svg';
import solidSvg from './solid.svg';
import vueSvg from './vue.svg';
import vueInvertedSvg from './vue_inverted.svg';

const fw_logos: Record<Framework | 'solid' | 'vueInverted' | 'nextjs', string> = {
    javascript: javascriptSvg.src,
    angular: angularSvg.src,
    react: reactSvg.src,
    solid: solidSvg.src,
    vue: vueSvg.src,
    vueInverted: vueInvertedSvg.src,
    nextjs: nextjsSvg.src,
    nextjsInverted: nextjsInvertedSvg.src,
};

export default fw_logos;
