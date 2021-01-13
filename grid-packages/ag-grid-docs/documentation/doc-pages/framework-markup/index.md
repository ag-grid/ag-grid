---
title: "Markup"
frameworks: ["angular", "vue"]
---

[[only-angular]]
| You can create Grids either programatically (with pure JavaScript/Typescript/Components), 
| or declare them via declaratively with markup.
| 
| ### Column Definition
| ```js
| <ag-grid-column headerName="Name" field="name" [width]="150"></ag-grid-column>
| ```
| 
| This example declares a simple Column Definition, specifying header name, field and width.
| 
| ### Setting Column Properties
| 
| There are some simple rules you should follow when setting column properties via Markup:
| 
| ```js
| // string value
| propertyName="String Value"
| [propertyName]="'String Value'"
| [propertyName]="{{Interpolated Value}}"
| [propertyName]="functionCallReturningAString()"
| 
| // boolean value
| [propertyName]="true|false"
| [propertyName]="{{Interpolated Value}}"
| [propertyName]="functionCallReturningABoolean()"
| 
| // numeric value
| [propertyName]="Numeric Value"
| [propertyName]="functionCallReturningANumber()"
| 
| // function value
| [propertyName]="functionName"
| [propertyName]="functionCallReturningAFunction()"
| ```
| 
| ### Setting a Class or a Complex Value
| 
| You can set a Class or a Complex property in the following way:
| 
| ```ts
| // return a Class definition for a Filter
| [filter]="getSkillFilter()"
| 
| private getSkillFilter(): any {
|     return SkillFilter;
| }
| 
| // return an Object for filterParams
| [filterParams]="getCountryFilterParams()"
| 
| private getCountryFilterParams():any {
|     return {
|         cellRenderer: this.countryCellRenderer,
|         cellHeight: 20
|     }
| }
| ```
| 
| ### Grouped Column Definition
| 
| To specify a Grouped Column, you can nest a column defintion:
| 
| ```jsx
| <ag-grid-column headerName="IT Skills">
|     <ag-grid-column 
|         headerName="Skills" 
|         [width]="125"
|         [sortable]="false"
|         [cellRenderer]="skillsCellRenderer"
|         [filter]="getSkillFilter()">
|     </ag-grid-column>
|     <ag-grid-column 
|         headerName="Proficiency"
|         field="proficiency"
|         [width]="120"
|         [cellRenderer]="percentCellRenderer"
|         [filter]="getProficiencyFilter()">
|     </ag-grid-column>
| </ag-grid-column>
| ```
| 
| In this example we have a parent Column of "IT Skills", with two child columns.
| 
| ## Example: Rich Grid using Markup
| 
| The example below shows the same rich grid as the example above, but with configuration done via Markup.
|
| <grid-example title='Grid Customised for Accessibility' name='angular-rich-grid-markup' type='angular' options='{ "enterprise": true, "exampleHeight": 525, "showResult": true, "extras": ["fontawesome", "bootstrap"] }'></grid-example>

[[only-vue]]
| You can also define your grid column definition decoratively if you would prefer.
| 
| You declare the grid as normal:
| 
| ```jsx
| <ag-grid-vue
|         class="ag-theme-alpine"
|         style="width: 700px; height: 400px;"
|         :rowData="rowData"
|         //...rest of definition
| ```
| 
| And within this component you can then define your column definitions:
| 
| ```jsx
| <ag-grid-vue
|     //...rest of definition
| >
|     <ag-grid-column headerName="IT Skills">
|         <ag-grid-column 
|             field="skills" 
|             :width="120" 
|             suppressSorting
|             cellRendererFramework="SkillsCellRenderer"
|             :menuTabs="['filterMenuTab']">
|         </ag-grid-column>
|         <ag-grid-column
|             field="proficiency" 
|             :width="135"
|             cellRendererFramework="ProficiencyCellRenderer"
|             :menuTabs="['filterMenuTab']">
|         </ag-grid-column>
|     </ag-grid-column>
| </ag-grid-vue>
| ```
| 
| In this example we're defining a grouped column with `IT Skills` having two 
| child columns `Skills and Proficiency`.
| 
| Not that anything other than a string value will need to be bound (i.e. `:width="120"`) as 
| Vue will default to providing values as Strings.
| 
| A full working example of defining a grid declaratively can be found in the 
| [Vue Playground Repo](https://github.com/seanlandsman/ag-grid-vue-playground).
