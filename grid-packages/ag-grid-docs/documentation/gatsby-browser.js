import { navigate, withPrefix } from 'gatsby';
import { LocalStorage } from './src/utils/local-storage';
import supportedFrameworks from './src/utils/supported-frameworks.js';
import 'jquery/dist/jquery.min.js';
import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import '@fortawesome/fontawesome-svg-core/styles.css';
import './src/bootstrap.scss';
import './src/themes/prism-coy-without-shadows.css';
import 'fontsource-roboto';

const frameworkStorageKey = 'framework';
const getRelativePath = path => path.replace(withPrefix('/'), '/');

export const onRouteUpdate = ({ location }) => {
    if (getRelativePath(location.pathname) === '/') {
        const selectedFramework = LocalStorage.get(frameworkStorageKey) || 'javascript';

        navigate(`/${selectedFramework}/`, { replace: true });
    } else if (LocalStorage.exists()) {
        const frameworkFromUrl = getRelativePath(location.pathname).split('/').filter(p => p !== '')[0];

        if (frameworkFromUrl && supportedFrameworks.indexOf(frameworkFromUrl) >= 0) {
            LocalStorage.set(frameworkStorageKey, frameworkFromUrl);
        }
    }
};