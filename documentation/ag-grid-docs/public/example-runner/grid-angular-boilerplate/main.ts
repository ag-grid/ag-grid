import '@angular/compiler';
import { provideHttpClient } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app.component';

if ((window as any).ENABLE_PROD_MODE) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [provideHttpClient()],
});
