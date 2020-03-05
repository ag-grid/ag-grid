<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Quick Look Code Example</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">app.component.ts</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">app.component.html</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
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
SNIPPET, 'ts') ?>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">

<?= createSnippet(<<<SNIPPET
<ag-charts-angular
    style="height: 100%"
    [options]="options">
</ag-charts-angular>
SNIPPET, 'html') ?>
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
