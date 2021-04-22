[[only-angular]]
|### Component Usage
|
|The below table gives an overview of where components can be used. The table shows both options for usage:
|
|- **Name / Direct JavaScript:** This can be:
|    - 1) A component name referring to a registered component (either plain JavaScript or an Angular Component);
|    - 2) A direct reference to a JavaScript component.
|- **Direct Angular Reference:** A direct reference to an Angular Component.
|
|| Component                     | Where                     | Name / Direct JavaScript | Direct Angular Reference             |
|| ----------------------------- | ------------------------- | ------------------------ | ------------------------------------ |
|| Detail Cell Renderer          | Grid Option               | detailCellRenderer       | detailCellRenderer**Framework**      |
|| Full Width Cell Renderer      | Grid Option               | fullWidthCellRenderer    | fullWidthCellRenderer**Framework**   |
|| Group Row Cell Renderer       | Grid Option               | groupRowRenderer         | groupRowRenderer**Framework**        |
|| Group Row Inner Cell Renderer | Grid Option               | groupRowInnerRenderer    | groupRowInnerRenderer**Framework**   |
|| Loading Cell Renderer         | Grid Option               | loadingCellRenderer      | loadingCellRenderer**Framework**     |
|| Loading Overlay               | Grid Option               | loadingOverlayComponent  | loadingOverlayComponent**Framework**  |
|| No Rows Overlay               | Grid Option               | noRowsOverlayComponent   | noRowsOverlayComponent**Framework**   |
|| Date Component                | Grid Option               | dateComponent            | dateComponent**Framework**           |
|| Status Bar Component          | Grid Option -> Status Bar | statusPanel              | statusPanel**Framework**             |
|| Cell Renderer                 | Column Definition         | cellRenderer             | cellRenderer**Framework**            |
|| Pinned Row Cell Renderer      | Column Definition         | pinnedRowCellRenderer    | pinnedRowCellRenderer**Framework**   |
|| Cell Editor                   | Column Definition         | cellEditor               | cellEditor**Framework**              |
|| Filter                        | Column Definition         | filter                   | filter**Framework**                  |
|| Floating Filter               | Column Definition         | floatingFilterComponent  | floatingFilterComponent**Framework** |
|| Header Component              | Column Definition         | headerComponent          | headerComponent**Framework**         |
|| Header Group Component        | Column Definition         | headerGroupComponent     | headerGroupComponent**Framework**    |
