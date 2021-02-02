import { navigate, withPrefix } from 'gatsby';
import { LocalStorage } from 'utils/local-storage';
import supportedFrameworks from 'utils/supported-frameworks.js';
import './src/bootstrap.scss';
import './src/themes/prism-coy-without-shadows.css';

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
