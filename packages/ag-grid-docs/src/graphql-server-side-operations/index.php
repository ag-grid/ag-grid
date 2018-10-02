<?php
$pageTitle = "Server-side operations with GraphQL and ag-Grid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is a guide on how to perform server-side operations with Oracle and ag-Grid.";
$pageKeyboards = "Server-side operations with GraphQL";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
    <h1>
        Server-side operations with GraphQL
    </h1>

    <p class="lead">
        Learn how to perform server-side operations using GraphQL with a complete reference implementation that uses
        the MySQL database.
    </p>

    <p>
        This guide we will develop an Olympic Medals application that demonstrates how to integrate a GraphQL endpoint
        with ag-Grid's <a href="/javascript-grid-server-side-model/">Server-side Row Model</a>. Specifically it will
        show how can be lazy-loaded as required, even when performing group, filter, sort operations when working
        with large datasets.
    </p>

    <p>
        The following screenshot shows what the finished application looks like:
    </p>

    <p><img src="graphql-app.png" width="105%" style="border: 1px solid grey"/></p>

    <note>
        The reference implementation covered in this guide is for demonstration purposes only. If you use
        this in production it comes with no warranty or support.
    </note>

    <p>
        The source code can be found here:
        <a href="https://github.com/ag-grid/ag-grid-server-side-oracle-example">https://github.com/ag-grid/ag-grid-server-side-oracle-example</a>.
    </p>

    <h2>Overview</h2>

    <p>
        In recent years GraphQL has become a popular alternative to REST when fetching data for clients. Familiarity
        with GraphQL is assumed however the following; <a href="https://graphql.org/learn/">Introduction to GraphQL</a>
        should provide all the necessary background information to follow this guide.
    </p>

    <p>
        One of the main benefits of GraphQL is the ability to expose a single endpoint and schema which maps to numerous
        data sources. However in our Olympic Medals application we will keep things simple by using just a single
        <a href="https://www.mysql.com/">MySQL</a> datasource.
    </p>

    <p>
        In our application, the GraphQL endpoint will be hosted using a web server comprised of
        <a href="https://nodejs.org/">Node.js</a> running <a href="https://expressjs.com/">Express.js</a>. An overview
        of technologies used in this guide is illustrated in the diagram below:
    </p>

    <p><img src="graphql-arch.png" width="100%" style="border: 1px solid grey"/></p>

    <p>
        We will now proceed and to install and run the application before going through the implementation details.
    </p>

    <h2 id="download-and-install">Download and Install</h2>

    <p>
        Clone the example project using:

        <snippet>
            git clone https://github.com/ag-grid/ag-grid-server-side-graphql-example.git
        </snippet>

        Navigate into the project directory:

        <snippet>
            cd ag-grid-server-side-graphql-example
        </snippet>

        Install project dependencies and build project using:

        <snippet>
            yarn install
        </snippet>
    </p>

    <h2 id="database-setup">Database Setup</h2>

    <p>
       Download and install the database as per the <a href="https://www.mysql.com/downloads/">MySql Download</a>
       documentation.
    </p>

    <p>
       Create a database with the name 'sample_data'. Then run the following script to create the table
       <code>olympic_winners</code> and populate it with data via the mysql command line:
    </p>

    <p>
        <snippet>
            mysql -u root -p -D sample_data < ./data/olympic_winners.sql
        </snippet>
    </p>

    <p>
        That's it. We are now ready to run and explore the application.
    </p>

    <h2 id="running-the-application">Running the application</h2>

    <p>
        To run the application execute the following from the command line:
    </p>

    <p>
        <snippet>
        yarn start
        </snippet>
    </p>

    <p>
        Then point your browser to <a href="http://localhost:4000/">http://localhost:4000/</a>
    </p>

    <h2 id="graphql-schema">Defining the GraphQL schema</h2>

    <p>
        To keep things simple, our schema will just contain a single entity <code>OlympicWinner</code>.
    <p>

<snippet>
// server/schema.js

type OlympicWinner {
    athlete: String
    country: String
    age: Int
    sport: String
    year: Int
    gold: Int
    silver: Int
    bronze: Int
}
</snippet>

<p>
    A single <code>rows</code> query is also defined along with it's supporting input types and enums:
</p>

<snippet>
// server/schema.js

type Query {
  rows(
    startRow: Int,
    endRow: Int,
    sorting: [SortModel],
    rowGroups: [RowGroup],
    groupKeys: [String]
  ): [OlympicWinner]!
}

input SortModel {
    colId: String
    sort: String
}

input RowGroup {
    colId: String
    aggFunc: String
}
</snippet>

    <p>
        The input types defined in the schema directly map to the
        <a href="/javascript-grid-server-side-model/#server-side-datasource">IServerSideGetRowsRequest</a>.
        We will discuss these mappings in detail in the following sections.
    </p>

    <p>
        The corresponding <code>rows</code> resolver function is implemented as follows:
    <p>

<snippet>
// server/schema.js

import {fetchRows} from "./olympicService";

const resolvers = {
  Query: {
    rows: (obj, args) =>
      new Promise((resolve, reject) => {
        const resultCallback = (err, results) => err ? reject(err) : resolve(results);
         fetchRows(args, resultCallback);
      }).then(rows => rows)
  },
};
</snippet>

    <p>
        The <code>OlympicService</code> simply takes the query arguments and uses dynamic SQL techniques to construct
        the corresponding SQL queries. The implementation details will be omitted from this guide but can be examined
        in the project repository.
    </p>

    <p>
        The GraphQL schema created using the <code>makeExecutableSchema</code> helper function from the
        <code>graphql-tools</code> package, by combining the schema <code>typeDefs</code> along with the corresponding
        <code>resolvers</code> package as follows:
    </p>

<snippet>
// server/schema.js

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export default schema;
</snippet>

    <h2 id="graphql-endpoint">GraphQL Endpoint</h2>

    <p>
        Hosting our GraphQL endpoint is done with the help of the <code>express-graphql</code> npm package. It is supplied
        with the schema we defined above.
    <p/>

<snippet>
// server/server.js

import express from 'express';
import graphqlHTTP from 'express-graphql';
import schema from './schema';

const app = express();

app.use('/graphql', graphqlHTTP({ schema: schema, graphiql: true }));

app.listen(4000, () => {
  console.log('Started on localhost:4000');
});
</snippet>

    <p>
        Notice that we have supplied the option: <code>graphiql: true</code> to enable the GraphiQL, client which is a
        useful tool for testing queries during development, and is available at:
        <a href="http://localhost:4000/graphql/">http://localhost:4000/graphql</a>.
    </p>

    <p><img src="graphiql.png" width="100%" style="border: 1px solid grey"/></p>


    <h2 id="server-side-datasource">Server-side Datasource</h2>

    <p>
        In order to fetch data for the Server-side Row Model we must implement the <code>IServerSideDatasource</code>,
        which contains a single method <code>getRows(params)</code> which accepts request params from the grid.
    </p>

    <p>
        To retrieve data from our GraphQL endpoint we will use the
        <a href="https://www.apollographql.com/client/">Apollo client</a>. The response is then passed back to the grid
        via the <code>params.successCallback(rows, lastRow)</code> as shown below:
    </p>

<snippet>
// client/serverSideDatasource.js

class ServerSideDatasource {
  constructor(gridOptions) {
    this.gridOptions = gridOptions;
    this.client = new ApolloClient({uri: "http://localhost:4000/graphql/"});
  }

  getRows(params) {
    const columns = this.gridOptions.columnDefs;

    // query GraphQL endpoint
    this.client.query(query(params.request, columns))
      .then(response => {

        const rows = response.data.rows;

        // determine last row to size scrollbar and last block size correctly
        let lastRow = -1;
        if (rows.length <= this.gridOptions.cacheBlockSize) {
          lastRow = params.request.startRow + rows.length;
        }

        // pass results to grid
        params.successCallback(rows, lastRow);
      })
      .catch(err => {
        console.error(err);
        params.failCallback()
      });
  }
}
</snippet>

    <p>
        The <code>IServerSideGetRowsRequest</code> supplied in the <code>params</code> is simply mapped to our GraphQL
        queries input params as shown below:
    </p>

<snippet>
// client/serverSideDatasource.js

const query = (request, columns) => {
  return {
    query: gql`
      query GetRows($start: Int, $end: Int, $sortModel: [SortModel], $groups: [RowGroup], $groupKeys: [String]) {
        rows(
            startRow: $start,
            endRow: $end,
            sorting: $sortModel,
            rowGroups: $groups,
            groupKeys: $groupKeys
        ) {
            ${getFields(columns)}
        }
      }
    `,
    variables: {
      start: request.startRow,
      end: request.endRow,
      sortModel: mapSortModel(request),
      groups: mapGroups(request),
      groupKeys: mapGroupKeys(request)
    },
  }
};

const getFields = (columnDefs) => {
  return columnDefs.map(colDef => colDef.field).join();
};

const mapGroups = (request) => {
  return request.rowGroupCols.map(grp => {
    return { colId: grp.field }
  });
};

const mapGroupKeys = (request) => {
  return request.groupKeys.map(key => key.toString());
};

const mapSortModel = (request) => {
  return request.sortModel.map(srt => {
    return { colId: srt.colId, sort: srt.sort }
  });
};
</snippet>

    <p>
        Note that we are using the <a href="https://github.com/apollographql/graphql-tag">Apollo graphql-tag</a> package
        to help create the GraphQL AST.
    </p>

    <p>
        The <code>ServerSideDatasource</code> is then registered with the grid via the grid api as follows:
    </p>

<snippet>
// client/index.js

const datasource = new ServerSideDatasource(gridOptions);
gridOptions.api.setServerSideDatasource(datasource);
</snippet>

    <h2 id="conclusion">Conclusion</h2>

    <p>
        In this guide we presented a reference implementation for integrating the Server-side Row Model with GraphQL
        server hosted in node and connected to a MySQL database. This included all necessary configuration and install
        instructions.
    </p>

    <p>
        A high level overview was given to illustrate the problem this approach solves before providing details of how
        to achieve the following server-side operations:

        <ul>
            <li>Infinite Scrolling</li>
            <li>Sorting</li>
            <li>Grouping</li>
        </ul>
    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>