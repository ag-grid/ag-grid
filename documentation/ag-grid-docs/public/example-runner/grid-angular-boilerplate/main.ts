import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app.component';

// `?prod` picks the framework build an example runs against - the same parameter the import map
// reads to choose React's development bundle (PROD_PARAM in getImportMap.ts). Production is the
// default and only an explicit `prod=false` opts out, matching both that injector and the SystemJS
// config this replaced.
//
// Read straight from the URL rather than through a `window` flag: the flag was only ever set by the
// two deleted systemjs configs, and this file is copied verbatim into each generated example, so
// nothing else is around to set it. Plunker and CodeSandbox exports carry no query string and so
// get production mode, as they did under SystemJS.
if (new URLSearchParams(window.location.search).get('prod') !== 'false') {
    enableProdMode();
}

const app = bootstrapApplication(AppComponent, {
    providers: [provideHttpClient()],
});
/** TEAR DOWN START **/
app.then((appRef) => {
    (window as any).tearDownExample = () => appRef.destroy();
}).catch((err) => {
    console.error('Error during bootstrap:', err);
});
/** TEAR DOWN END **/
