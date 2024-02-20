---
title: "AG Grid Design System"
---

Our Figma design system allows designers to prototype & customise AG Grid applications with ease.

<image-caption src="ag-grid-design-system/resources/FDS-Example.png" alt="AG Grid Design System" constrained="false" centered="true" toggledarkmode="true"></image-caption>

The AG Grid design system replicates the Quartz and Alpine AG Grid themes within Figma. These default themes can be extended with Figma variables to match any existing visual design or create entirely new AG Grid themes.

The design system has been built from the ground up to be consistent with the javascript library, aiding in the designer - developer handoff process.

<download-ds-button></download-ds-button>

## Video introduction & Figma documentation

<video-section id="eyXUr3fYRYM" title="Introducing the AG Grid Figma Design System">
  <p class="font-size-responsive">Watch our short introduction video to the design system on Youtube. You'll learn how to get started with the design system, where to find complete grid templates, and how to build your own grids from scratch.</p>
  <p class="font-size-responsive">The design system contains comprehensive documentation for all our components right within Figma. We also provide in depth tutorial videos for many of the individual sections.</p>
</video-section>

## Download & Install

To get started with the AG Grid design system first download the .zip file using the button below. Within the zip archive you'll find a `AG-Grid-design-system-X.X.X.fig` Figma file, and a directory with a sample [Style Dictionary](https://amzn.github.io/style-dictionary/#/) project.

<download-ds-button></download-ds-button>
<br />

To start using the AG Grid Design System in Figma just drag and drop the `.fig` file into the Figma application. Alternatively you may want to use one of the other methods of [importing files content into Figma](https://help.figma.com/hc/en-us/articles/360041003114-Import-files-into-Figma).

The Figma file contains comprehensive documentation for how to use the design system and examples of pre-built grids including all our core features.

## Customising the Design System

The AG Grid design system utilises [Figma's native variables feature](https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma) for all of its customisable attributes. All of the [CSS variables](/global-style-customisation-variables/) used by the Quartz and Alpine themes are referenced within Figma and can be extended to your own theme.

You can find more information about how to create and manage themes within the Figma file under the **Create your own theme** page in the Figma file.

<image-caption src="ag-grid-design-system/resources/FDS-themes.png" alt="Figma Variable Theming" constrained="false" centered="true" toggledarkmode="true"></image-caption>

## Generating AG Grid Themes From Figma Variables

If you have created your own theme in Figma using the variables feature you can export those variables and use the [Style Dictionary](https://amzn.github.io/style-dictionary/#/) NPM package to create an [AG Grid CSS theme](/themes/). An example Style Dictionary project and full instructions are included in the above download file under the `ag-grid-figma-variables-to-css` directory.

To export your Figma Variables as json...

1. In the Resources panel go to the Plugins tab and search for the [Design Tokens plugin](https://www.figma.com/community/plugin/888356646278934516/Design-Tokens).
2. Click on the [Design Tokens plugin](https://www.figma.com/community/plugin/888356646278934516/Design-Tokens) and select the "Export Design Token File" option.
3. Deselect all include types except for "Figma Variables".
4. Click the 'Save & Export' button and save the json to the `./tokens/` directory.

<image-caption src="ag-grid-design-system/resources/FDS-export-variables.png" alt="Export Figma Variables" constrained="false" centered="true" toggledarkmode="true"></image-caption>

## Support and Future versions

AG Grid Enterprise customers can request support or suggest features and improvements via [Zendesk](https://ag-grid.zendesk.com/hc/en-us). Community users can file bug reports via [AG Grid Github issues](https://github.com/ag-grid/ag-grid/issues).

Future versions of the AG Grid design system will include support for all features of the grid.
