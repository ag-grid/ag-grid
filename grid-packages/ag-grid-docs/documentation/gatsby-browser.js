import 'jquery/dist/jquery.min.js';
import 'popper.js/dist/popper.min';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap/scss/bootstrap.scss';
import './src/themes/prism-coy-without-shadows.css';
import 'fontsource-roboto';
import { getPageName } from './src/utils/get-page-name';

export const shouldUpdateScroll = ({ prevRouterProps: { location: { pathname: previousPathname } }, routerProps: { location: { pathname } } }) => {
    const previousPageName = getPageName(previousPathname);
    const pageName = getPageName(pathname);

    if (pageName !== previousPageName) {
        document.getElementById('doc-page-wrapper').scrollIntoView();
        return false;
    }

    return true;
};