import { standardiseWhitespace } from './test-utils';
import { appModuleAngular } from './chart-packages-angular-app-module';

describe('appModuleAngular', () => {
    it('returns basic app module content', () => {
        const appModuleContent = standardiseWhitespace(appModuleAngular([]));
        const expected = standardiseWhitespace(`import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { AppComponent } from './app.component';

@NgModule({
  imports: [ BrowserModule, AgChartsAngularModule ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
`);

        expect(appModuleContent).toBe(expected);
    });

    it('returns app module content with additional components', () => {
        const appModuleContent = standardiseWhitespace(
            appModuleAngular(['partial-match-filter.component.ts', 'rich-grid.component.ts'])
        );

        const expected = standardiseWhitespace(`import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { AppComponent } from './app.component';

import { PartialMatchFilter } from './partial-match-filter.component';
import { RichGrid } from './rich-grid.component';

@NgModule({
  imports: [ BrowserModule, AgChartsAngularModule ],
  declarations: [ AppComponent, PartialMatchFilter, RichGrid ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
`);

        expect(appModuleContent).toBe(expected);
    });
});
