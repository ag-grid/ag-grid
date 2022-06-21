---
title: "Localisation"
---

All the displayed text in the grid is customisable for the purposes of localisation. This is done by providing locale information to the grid for the required language. Either provide an object  of key/value pairs via the `localeText` property, or provide a `getLocaleText` callback to hook the grid up to your application's localisation.

<api-documentation source='grid-options/properties.json' section='localisation' config='{"overrideBottomMargin":"1rem"}'></api-documentation>

The default language of the grid is American English. The grid does not come with other locales. If you want to provide the grid in another language, you must provide to the grid the relevant  locale information.

## Creating a Locale

By default, the grid does not require a locale. If no locale is provided, the grid will default to English. If a locale is provided but is missing values, the default English will be used for the missing values.

An example full locale file is provided below. To support other languages, the first step is to copy this file and translate the values into the required language.

`embed:examples/localisation/locale.en.js`

You can download the full file from [here](../../examples/localisation/localisation/locale.en.js).

There is one locale file for all the grid. The file covers all modules across all of AG Grid Enterprise and AG Grid Community. This was done on purpose as having multiple files for each module would provide to much confusion. The decision was made to keep it simple in one file.
 
## Installing a Locale

To install a locale into the grid, set the locale object to the grid's `localeText` property. The example below shows this in action:

The example below shows installing a locale file. The example has two local files `locale.en.js` and `locale.zzz.js`. The second one is a dummy locale, it just adds "zzz" to the start of each value. This is done so that the example looks different - otherwise is would just display English as normal and there would be no way of knowing if the locale was working or not as English is the default.

This to try in the example are as follows:

1. Open up in Plunker.
1. Change the locale to English by changing `localeText = AG_GRID_LOCALE_ZZZ` to `localeText = AG_GRID_LOCALE_EN`.
1. Edit values in `locale.en.js` and observe the changes in the grid.

<grid-example title='Localisation' name='localisation' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel", "filterpanel", "setfilter", "csv", "excel", "charts", "clipboard", "range", "rowgrouping", "multifilter", "sidebar", "statusbar"], "exampleHeight": 650 }'></grid-example>

[[note]]
| Some localisation variables have `${variable}` in them. When this occurs, it means that part of the string will be replaced by a variable value.

## Changing Locale

The grid uses the locale as it is needed. It does not refresh as the locale changes. If your application allows changing the locale for the application, you must destroy and recreate the grid for it to use the new locale.

## Locale Callback

Providing a locale for the grid does not fit in with localisation libraries or localisation for a broader application. If you want the grid to take from an application wide locale, then implement the `getLocaleText` to act as a bridge between the grid and the applications localisation.

The example below shows providing a callback for the grid's localisation. The example for simplicity just returns the default value in upper case. In a real world application, the callback would use the applications localisation.

<grid-example title='Callback' name='callback' type='generated' options='{ "enterprise": true, "modules": ["clientside", "menu", "columnpanel", "filterpanel", "setfilter", "csv", "excel", "charts", "clipboard", "range", "rowgrouping", "multifilter", "sidebar", "statusbar"], "exampleHeight": 650 }'></grid-example>

In a real world application, the callback would look something like this:

```js
const getLocaleText = (params) => {
    // to avoid key clash with external keys, we add 'grid' to the start of each key.
    const gridKey = 'grid.' + params.key;

    // look the value up using an application wide service
    return applicationLocaleService(gridKey);
}
```
