Each umbrella icon key now covers only the single use case its name indicates. To keep a custom icon applied across the cases it previously covered, set the additional granular keys (in the `icons` grid option, `colDef.icons`, or the Theming API `iconOverrides` part) to the same icon:

- `smallDown` also set `advancedFilterBuilderSelectOpen` (Advanced Filter Builder dropdown), `selectOpen` (Select cell editor and dropdowns, e.g. Integrated Charts menu), `richSelectOpen` (Rich Select cell editor).
- `smallLeft` also set `panelDelimiterRtl` (Row Group / Pivot Panel, RTL), `subMenuOpenRtl` (sub-menus, RTL).
- `smallRight` also set `panelDelimiter` (Row Group / Pivot Panel), `subMenuOpen` (sub-menus).
- `previous` also set `chartsThemePrevious` (Integrated Charts theme picker).
- `next` also set `chartsThemeNext` (Integrated Charts theme picker).
- `cancel` also set `richSelectRemove` (Rich Select cell editor pills).
- `menu` also set `legacyMenu` (legacy column menu tab header).
- `menuAlt` also set `chartsMenu` (Integrated Charts menu).
- `columns` also set `columnsToolPanel` (Columns Tool Panel tab icon).
- `filter` also set `filtersToolPanel` (Filters Tool Panel tab icon), `filterActive` (active-filter indicator), `filterTab` (filter tab of the legacy tabbed column menu).
- `save` also set `chartsDownload` (Integrated Charts download).
- `columnSelectClosed` also set `accordionClosed` (accordions in Filters Tool Panel / Integrated Charts tool panels).
- `columnSelectOpen` also set `accordionOpen` (accordions).
- `columnSelectIndeterminate` also set `accordionIndeterminate` (accordions).

Note: the `advancedFilterBuilderSelectOpen` key sets the Advanced Filter Builder dropdown icon; a previous documentation table and runtime warning referred to `advancedFilterBuilderSelect`, which is not a valid key.
