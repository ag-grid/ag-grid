import 'jquery/dist/jquery.min.js';
import 'popper.js/dist/popper.min.js';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './src/themes/prism-coy-without-shadows.css';
import 'fontsource-roboto';
import { getPageName } from './src/utils/get-page-name';

export const shouldUpdateScroll = ({ prevRouterProps, routerProps: { location: { pathname } } }) => {
    if (!prevRouterProps) { return true; }

    const { location: { pathname: previousPathname } } = prevRouterProps;

    const previousPageName = getPageName(previousPathname);
    const pageName = getPageName(pathname);

    if (pageName !== previousPageName) {
        const docPageWrapper = document.getElementById('doc-page-wrapper');

        if (docPageWrapper) {
            docPageWrapper.scrollIntoView();
            return false;
        }
    }

    return true;
};