# AG Grid documentation

This is the documentation site for AG Grid, a statically-generated site using the Gatsby framework.

## Getting started

Copy `.env.example` to `.env`. This will allow you to configure environment variables for your machine. Then run:

    npm i
    npm start

This will ensure the Gatsby CLI is installed, and run the website. You can then open it at http://localhost:8000/. Any changes you make to the code will be hot-reloaded while you are in this develop mode.

## Build the site

To build the site for deployment, run

    npm run package

This will compile all the required assets and put them in the `public` folder ready for upload. Run `npm run serve` if you want to test the website from these assets, which will then be served
on http://localhost:9000/, unless you have changed `GATSBY_ROOT_DIRECTORY` in your `.env` file.

This process will also update the indices for the Algolia search. For this to work, you will need to provide the required environment variables in your `.env`.

**NOTE**: when you have built the website, if you then run develop mode, it will serve any files that it finds in the `public` folder instead of using ones that are generated on-the-fly, which can interrupt hot-reloading (for example for pages generated from Markdown). If you have issues with changes not appearing etc, please try stopping the process, running `npm run clean` and then running
`npm start` again.