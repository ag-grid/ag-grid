<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Quick Look Code Example</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">app.js</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">index.js</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
<?= createSnippet(<<<SNIPPET
import Vue from 'vue';
import { AgChartsVue } from 'ag-charts-vue';

export const App = {
    template: `<ag-charts-vue :options="options"></ag-charts-vue>`,
    components: {
        'ag-charts-vue': AgChartsVue,
    },
    data: function() {
        return {
            options: null,
            data: [
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
            ]
        };
    },
    beforeMount() {
        this.options = {
            data: this.data,
            title: { text: 'Beverage Expenses' },
            subtitle: { text: 'per quarter' },
            padding: {
                top: 40,
                right: 40,
                bottom: 40,
                left: 40,
            },
            series: [
                {
                    type: 'column',
                    xKey: 'beverage',
                    yKeys: ['Q1', 'Q2', 'Q3', 'Q4'],
                },
            ],
            legend: { spacing: 40 },
        };
    }
};
SNIPPET
) ?>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">
<?= createSnippet(<<<SNIPPET
import Vue from 'vue';
import { App } from './app';

new Vue({
  el: '#root',
  render: h => h(App)
});
SNIPPET
, 'ts') ?>
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://stackblitz.com/edit/ag-charts-vue-hello-world-uqr6hk" target="_blank">
                    Open in <img src="../images/stackBlitzIcon.svg" alt="Open in StackBlitz"/> StackBlitz
                </a>
            </div>
        </div>
    </div>
</section>
