import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app.component';

// `?prod=false` opts an example into Angular's development mode; production is the default. This
// is the same parameter the import map reads to pick a framework build (PROD_PARAM in
// getImportMap.ts), so one URL selects the same build everywhere.
//
// Read straight from the URL rather than through a `window` flag, because nothing sets one: this
// file is copied verbatim into each generated example. Exports carry no query string, so they get
// production mode.
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
