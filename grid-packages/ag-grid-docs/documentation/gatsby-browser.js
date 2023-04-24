/**
 * The file gatsby-browser.js lets you respond to actions within the browser, and wrap your site in additional
 * components. The Gatsby Browser API gives you many options for interacting with the client-side of Gatsby.
 * https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */

import { navigate, withPrefix } from 'gatsby';
import { LocalStorage } from 'utils/local-storage';
import supportedFrameworks from 'utils/supported-frameworks.js';
import './src/bootstrap.scss'; // Import the Bootstrap CSS
import './src/themes/prism-coy-without-shadows.css'; // Import theme for Prism

const frameworkStorageKey = 'framework';
const getRelativePath = path => path.replace(withPrefix('/'), '/');

/**
 * Every time the route changes, we record which framework the user is looking at. When they load the documentation
 * homepage, we check to see if we've stored a preferred framework, and automatically take them to the documentation for
 * that framework if so.
 */
export const onRouteUpdate = ({ location }) => {
    if (['/documentation/'].includes(getRelativePath(location.pathname))) {
        const selectedFramework = LocalStorage.get(frameworkStorageKey) || 'javascript';

        navigate(`/${selectedFramework}-data-grid/`, { replace: true });
    } else if (LocalStorage.exists()) {
        const firstPart = getRelativePath(location.pathname).split('/').filter(p => p !== '')[0];
        const framework = firstPart && firstPart.replace(/-data-grid|-grid|-charts/, '');

        if (framework && supportedFrameworks.indexOf(framework) >= 0) {
            LocalStorage.set(frameworkStorageKey, framework);
        }
    }
};
