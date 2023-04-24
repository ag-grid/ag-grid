# Running charts Dev Server

1. Go to the charts community package (`cd charts-community-modules/ag-charts-community`).
2. Start the server (`npm run dev-server`).
3. The browser should open a tab with examples. If it didn't, go to `http://localhost:2020` (or the port specified in the config).

## Adding a local example (beta)

You can put your own examples into `tools/dev-server/my-examples/example-name` directory.
You will need to create `index.html` and `main.ts` files in this directory
(see the doc examples for reference).

After creating the example, restart the server, and then go to `My Examples/Example Name`.

Please note that **local examples are stored only on your machine and may be removed by `git clean`**.
