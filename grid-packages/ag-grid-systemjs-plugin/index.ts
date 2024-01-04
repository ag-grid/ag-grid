import babelLoader from './src/plugins/babel-loader';
import injectCssLoader from './src/plugins/inject-css-loader';
import { registerSystemJsPlugin } from './src/utils/systemjs';

// Register the SystemJS plugins
registerSystemJsPlugin(injectCssLoader);
registerSystemJsPlugin(babelLoader);
