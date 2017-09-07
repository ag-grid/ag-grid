<!-- Angular from here -->
<h2 id="ng2Angular">
    <img src="../images/angular2_large.png" style="width: 60px;"/>
    Angular Floating Filters
</h2>

<div class="note" style="margin-bottom: 20px">
    <img align="left" src="../images/note.png" style="margin-right: 10px;"/>
    <p>This section explains how to utilise ag-Grid floatingFilter using Angular 2+. You should read about how
        <a href="../javascript-grid-floating-filter-component/">Floating filter works in ag-Grid</a> first before trying to
        understand this section.</p>
</div>

<p>
    See example below on how to create a custom floating filter reusing the out of the box number filter with angular
</p>

<show-complex-example example="../framework-examples/angular-examples/index.html?fromDocs=true&example=floating-filter"
                      sources="{
                            [
                                { root: '/framework-examples/angular-examples/app/floating-filter-example/', files:
                                    'floating-filter.component.ts,floating-filter.component.html,slider-floating-filter.component.ts,slider-floating-filter.component.html'
                                },
                                { root: '/framework-examples/angular-examples/app/', files: 'app.module.ts' }
                            ]
                          }">
</show-complex-example>

<note>The full <a href="https://github.com/ag-grid/ag-grid-angular-example">ag-grid-angular-example</a> repo shows many
    more examples for rendering, including grouped rows, full width renderer's
    and so on, as well as examples on using Angular Components with both Cell Editors and Filters
</note>