<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Quick Look Code Example</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">app.component.ts</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="module-tab" data-toggle="tab" href="#module" role="tab" aria-controls="module" aria-selected="true">app.module.ts</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">app.component.html</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
<?= createSnippet(<<<SNIPPET
import { Component } from '@angular/core';

@Component({
    selector: 'my-app',
    templateUrl: './app.component.html'
})
export class AppComponent {
    private options: any;

    beverageSpending = [
        {
            beverage: 'Coffee',
            Q1: 450,
            Q2: 560,
            Q3: 600,
            Q4: 700,
        },
        {
            beverage: 'Tea',
            Q1: 270,
            Q2: 380,
            Q3: 450,
            Q4: 520,
        },
        {
            beverage: 'Milk',
            Q1: 180,
            Q2: 170,
            Q3: 190,
            Q4: 200,
        },
    ];
    constructor() {
        this.options = {
            data: this.beverageSpending,
            title: {
                text: 'Beverage Expenses',
            },
            subtitle: {
                text: 'per quarter',
            },
            series: [{
                type: 'column',
                xKey: 'beverage',
                yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
                label: {},
            }],
        };
    }
}
SNIPPET
) ?>
                </div>
                <div class="tab-pane" id="module" role="tabpanel" aria-labelledby="module-tab">
<?= createSnippet(<<<SNIPPET
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgChartsAngularModule } from 'ag-charts-angular';
import { AppComponent } from './app.component';

@NgModule({
    imports: [
        BrowserModule,
        AgChartsAngularModule
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {
}
SNIPPET
, 'ts') ?>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">

<?= createSnippet(<<<SNIPPET
<ag-charts-angular
    style="position: absolute; top: 0; right: 0; bottom: 0; left: 0;"
    [options]="options">
</ag-charts-angular>
SNIPPET
, 'html') ?>
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://stackblitz.com/edit/ag-charts-angular-hello-world-cxth9c" target="_blank">
                    Open in <img src="../images/stackBlitzIcon.svg" alt="Open in StackBlitz"/> StackBlitz
                </a>
            </div>
        </div>
    </div>
</section>
