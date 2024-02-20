/**
 * The file gatsby-browser.js lets you respond to actions within the browser, and wrap your site in additional
 * components. The Gatsby Browser API gives you many options for interacting with the client-side of Gatsby.
 * https://www.gatsbyjs.com/docs/reference/config-files/gatsby-browser/
 */
import { navigate, withPrefix } from 'gatsby';
import {getCurrentFramework, setCurrentFramework} from 'utils/local-storage';
import supportedFrameworks from 'utils/supported-frameworks.js';
import { cleanUp as heroGridCleanUp } from './src/components/hero-grid';
import { cleanUp as rowGroupingExampleCleanUp } from './src/components/automated-examples/examples/row-grouping';
import { cleanUp as integratedChartsExampleCleanUp } from './src/components/automated-examples/examples/integrated-charts';
import LocalStorage from "./src/utils/local-storage";

const getRelativePath = path => path.replace(withPrefix('/'), '/');

const getFrameworkPath = () => {
    const selectedFramework = getCurrentFramework();
    return `/${selectedFramework}-data-grid`;
};

const removeForwardSlashes = (url) => url.replaceAll('/', '');
/**
 * Every time the route changes, we record which framework the user is looking at. When they load the documentation
 * homepage, we check to see if we've stored a preferred framework, and automatically take them to the documentation for
 * that framework if so.
 */
export const onRouteUpdate = ({ location, prevLocation }) => {
    const relativePath = getRelativePath(location.pathname);

    if (LocalStorage.exists()) {
        const framework = relativePath.split('/').find(Boolean)?.replace(/-data-grid|-grid/, '');
        if (supportedFrameworks.includes(framework)) {
            setCurrentFramework(framework);
        }
    }

    if (removeForwardSlashes(location.pathname) === removeForwardSlashes(getFrameworkPath()) || location.pathname.includes('documentation')) {
        navigate(`${getFrameworkPath()}/getting-started`)
    }

    // If coming from homepage, clean up all the grids
    if (prevLocation?.pathname === '/') {
        heroGridCleanUp();
        rowGroupingExampleCleanUp();
        integratedChartsExampleCleanUp();
    }
};


