1. Open packages/ag-grid-community/src/styles
1. Create a new folder called "your-custom-theme"
1. Created the required subfolders, icons, resources, sass, vars (It may be useful to copy one of the existing themes to use as a base)
1. Create any needed files:
    - sass/your-custom-theme.scss - contains the main class for your theme as well as any custom styles you want to use
    - vars/\_your-custom-theme-vars.scss - contains variables that will be used throughout your theme, primarily sizing and colors
    - icons/ - svgs for all icons need, this is optional as you can simply point to one of the existing icons sets using the icons-path variable in your vars file.
    - resources/ - extra sass files that are need for some themes (such as material)
1. Add a require to packages/ag-grid-community/main-with-styles.js for your custom theme. The path for this should be './dist/styles/your-custom-theme-main-class.css'
1. Replace 'your-custom-theme-main-class' to the customThemes array at the top of packages/ag-grid-community/src/ts/environment.ts (You can replace the sring 'your-custom-theme' that is already in the array with anything else)
1. If compiling for the enterprise version add a require to packages/ag-grid-enterprise/webpack-with-styles.js for your custom theme. The path for this should be 'ag-grid-community/dist/styles/your-custom-theme-main-class.css'
1. Build everything by running one of the following:
    - npm run-script buildEnterprise - this will build the community and enterprise while making sure to include the theme you added by copying the compiled community version to ag-grid-enterprise's node_modules
    - npm run-script buildVanilla - this will build the community and enterprise versions without copying the community changes over