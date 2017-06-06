<!-- Angular from here -->
<h2 id="ng2CellRendering">
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

<show-complex-example example="../ng2-example/index.html?fromDocs=true&example=floating-filter"
                      sources="{
                            [
                                { root: '/ng2-example/app/rich-dynamic-component-example/', files: 'rich.component.ts,rich.component.html,ratio.module.ts,ratio.parent.component.ts,ratio.component.ts,clickable.module.ts,clickable.parent.component.ts,clickable.component.ts' },
                                { root: '/ng2-example/app/', files: 'app.module.ts' }
                            ]
                          }"
                      plunker="https://embed.plnkr.co/qmgvkW/">
</show-complex-example>

<note>The full <a href="https://github.com/ceolter/ag-grid-angular-example">ag-grid-angular-example</a> repo shows many
    more examples for rendering, including grouped rows, full width renderers
    and so on, as well as examples on using Angular Components with both CellEditors and Filters
</note>