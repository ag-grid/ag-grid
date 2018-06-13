# ag grid move
mkdir -p packages/ag-grid

cp -r dist packages/ag-grid/

git mv .gitignore packages/ag-grid/
git mv .travis.yml packages/ag-grid/
git mv bower.json packages/ag-grid/
git mv jspm-main.js packages/ag-grid/
git mv notes.txt packages/ag-grid/
git mv tsconfig-exports.json packages/ag-grid/
git mv webpack.config.js packages/ag-grid/
git mv .npmignore packages/ag-grid/
git mv CONTRIBUTING.md packages/ag-grid/
git mv main-with-styles.js packages/ag-grid/
git mv package.json packages/ag-grid/
git mv tsconfig.json packages/ag-grid/
git mv .prettierrc packages/ag-grid/
git mv LICENSE.txt packages/ag-grid/
git mv exports.ts packages/ag-grid/
git mv main.d.ts packages/ag-grid/
git mv spec packages/ag-grid/
git mv tslint-fix.json packages/ag-grid/
git mv .github packages/ag-grid/
git mv .sasslintrc packages/ag-grid/
git mv README.md packages/ag-grid/
git mv gulpfile.js packages/ag-grid/
git mv main.js packages/ag-grid/
git mv src packages/ag-grid/
git mv tslint.json packages/ag-grid/

git add packages/ag-grid/dist

