import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app.component';

if (new URLSearchParams(window.location.search).get('prod') !== 'false') {
    enableProdMode();
}

const app = bootstrapApplication(AppComponent, {
    providers: [provideZonelessChangeDetection(), provideHttpClient()],
});
/** TEAR DOWN START **/
app.then((appRef) => {
    (window as any).tearDownExample = () => appRef.destroy();
}).catch((err) => {
    console.error('Error during bootstrap:', err);
});
/** TEAR DOWN END **/
