---
title: "AG Grid Design System"
---

Our [Figma](https://www.figma.com/) design system allows designers to prototype & customise AG Grid applications with ease.

<image-caption src="ag-grid-design-system/resources/FDS-Example.png" alt="AG Grid Design System" constrained="false" centered="true"></image-caption>

The AG Grid design system replicates the Alpine & Alpine Dark AG Grid themes within [Figma](https://www.figma.com/). These default themes can be extended with Figma variables to match any existing visual design or create entrirely new AG Grid themes.

The design system has been built from the ground up to be consistent with the javasvscript library, aiding in the designer / developer handoff process.

## Download & Install

To get started with the AG Grid design system first download the `.zip` file below. Within the zip archive you'll find a `AG-Grid-design-system-X.X.X.fig` Figma file, and a directory with a sample [Style Dictionary](https://amzn.github.io/style-dictionary/#/) project.

To start using the AG Grid Design System in Figma just drag and drop the `.fig` file into the Figma application. Alternatively you may want to use one of the other methods of [importing files content into Figma](https://help.figma.com/hc/en-us/articles/360041003114-Import-files-into-Figma).

The Figma file contains comprehensive documentation for how to use the design system and examples of pre-built grids including all our core features.

<a href="../../../downloads/AG-Grid-design-system-30-0-0-preview.zip" download class="button">Download AG Grid Design System</a>

## Customising the Design System

The AG Grid design system utilises [Figma's native variables feature](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma) for all of it's customisable attributes. All of the [CSS variables](/global-style-customisation-variables/) used by the Alpine & Alpine Dark themes are referenced within Figma and can be extended to your own theme.

You can find more information about how to create and manage themes within the Figma file under the **Create your own theme** page in the Figma file.

<image-caption src="ag-grid-design-system/resources/FDS-themes.png" alt="Figma Variable Theming" constrained="false" centered="true"></image-caption>

## Generating AG Grid Themes From Figma Variables

If you have created your own theme in Figma using the variables feature you can export those variables and use the [Style Dictionary](https://amzn.github.io/style-dictionary/#/) NPM package to create an [AG Grid CSS theme](/themes/). An example Style Dictionary project and full instructions are included in the above download file under the `ag-grid-figma-variables-to-css` directory.

To export your Figma Variables as json...

1. In the Resources panel go to the Plugins tab.
2. Search for the [Variables Import Export plugin](https://www.figma.com/community/plugin/1254848311152928301).
3. Click run for the [Variables Import Export plugin](https://www.figma.com/community/plugin/1254848311152928301) and select the 'Export variables' option.
4. Click the 'Export variables' button and save the json to the `./tokens/` directory.

<image-caption src="ag-grid-design-system/resources/FDS-export-variables.png" alt="Export Figma Variables" constrained="false" centered="true"></image-caption>

## Support and Future versions

AG Grid Enterprise customers can request support or suggest features and improvements via [Zenhub](https://ag-grid.zendesk.com/hc/en-us). Community users can file bug reports via [AG Grid Github issues](https://github.com/ag-grid/ag-grid/issues).

Future versions of the AG Grid design system will include support for all features of the grid.
