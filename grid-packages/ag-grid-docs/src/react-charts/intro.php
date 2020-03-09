<section id="angular-demo" class="mb-3">
    <div class="card">
        <div class="card-header">Quick Look Code Example</div>
        <div class="card-body">
            <ul class="nav nav-tabs">
                <li class="nav-item">
                    <a class="nav-link active" id="component-tab" data-toggle="tab" href="#component" role="tab" aria-controls="component" aria-selected="true">index.js</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" id="template-tab" data-toggle="tab" href="#template" role="tab" aria-controls="template" aria-selected="false">index.html</a>
                </li>
            </ul>
            <div class="tab-content">
                <div class="tab-pane show active" id="component" role="tabpanel" aria-labelledby="component-tab">
<?= createSnippet(<<<SNIPPET
import React, { Component } from 'react';
import { render } from 'react-dom';
import { AgChartsReact } from 'ag-charts-react';

class ChartExample extends Component {
    data = [
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

    constructor(props) {
        super(props);

        this.state = {
            options: {
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
            },
        };
    }

    render() {
        return <AgChartsReact options={this.state.options} />;
    }
}

render(<ChartExample />, document.querySelector('#root'));
SNIPPET
, 'jsx') ?>
                </div>
                <div class="tab-pane" id="template" role="tabpanel" aria-labelledby="template-tab">

<?= createSnippet('<div id="root"></div>', 'html') ?>
                </div>
            </div>
            <div class="text-right" style="margin-top: -1.5rem;">
                <a class="btn btn-dark" href="https://stackblitz.com/edit/ag-charts-react-hello-world-daq5bw" target="_blank">
                    Open in <img src="../images/stackBlitzIcon.svg" alt="Open in StackBlitz"/> StackBlitz
                </a>
            </div>
        </div>
    </div>
</section>
