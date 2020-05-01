<?php
$pageTitle = "Server-Side Operations With the Oracle Database and ag-Grid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is a guide on how to perform server-side operations with Oracle and ag-Grid.";
$pageKeywords = "Server-Side Operations With the Oracle Database";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>

<h1 id="oracle-enterprise">
    Server-Side Operations With Java &amp; Oracle
</h1>

<p class="lead">
    Learn how to perform server-side operations using the Oracle Database with a complete reference implementation.
</p>

<p>
    In this guide we will show how large datasets, which are too big be loaded directly into the browser, can be
    managed by performing server-side operations inside the Oracle database.
</p>

<p>
    We will develop a financial reporting application that demonstrates how data can be lazy-loaded as required,
    even when performing group, filter, sort and pivot operations.
</p>

<img src="oracle-enterprise.png" width="100%" style="border: 1px solid grey"/>

<note>
    The reference implementation covered in this guide is for demonstration purposes only. If you use
    this in production it comes with no warranty or support.
</note>

<p>
    The source code can be found here: <a href="https://github.com/ag-grid/ag-grid-server-side-oracle-example">https://github.com/ag-grid/ag-grid-server-side-oracle-example</a>
</p>

<h2>Overview</h2>

<p>
    When designing a grid based application, one of the key considerations is how much data needs to be sent from
    the server to the client. As a developer using ag-Grid you won't need to switch between grids based on the
    answer to this question, instead just select the appropriate Row Model used by the grid.
</p>

<h3>Client-Side Row Model</h3>

<p>
    The simplest approach is to send all row data to the browser in response to a single request at initialisation.
    For this use case the <a href="/javascript-grid-client-side-model/">Client-Side Row Model</a> has been designed.
</p>

<p>
    This scenario is illustrated below where 10,000 records are loaded directly into the browser:
</p>

<p><img src="in-memory-row-model.png" width="90%" style="border: 1px solid grey"/></p>

<p>
    The Client-Side Row Model only renders the rows currently visible, so the upper limit of rows is governed by the
    browser's memory footprint and data transfer time, rather than any restrictions inside the grid.
</p>

<h3>Server-Side Row Model</h3>

<p>
    However many real world applications contain much larger datasets, often involving millions of records. In this
    case it simply isn't feasible to load all the data into the browser in one go. Instead data will need
    to be lazy-loaded as required and then purged to limit the memory footprint in the browser.
</p>

<p>
    This is precisely the problem the <a href="/javascript-grid-server-side-model/">Server-Side Row Model</a> addresses,
    along with delegating server-side operations such as filtering, sorting, grouping and pivoting.
</p>

<p>
    The following diagram shows the approach used by the Server-Side Row Model. Here there are 10 million records,
    however the number of records is only constrained by the limits of the server:
</p>

<p><img src="enterprise-row-model.png" width="90%" style="border: 1px solid grey"/></p>

<p>
    As the user performs operations such as sorting and grouping, the grid issues requests to the server that contains
    all the necessary metadata required, including which portion of data should be returned based on the user's position in
    the dataset.
</p>

<p>
    The browser will never run out of heap space as the grid will automatically purge out-of-range records.
</p>

<p>
    Throughout the rest of this guide we will demonstrate the power of the Server-Side Row Model with the aid of a
    Java service connected to an Oracle database.
</p>

<h2 id="prerequisites">Prerequisites</h2>

<p>
    It is assumed the reader is already familiar with Java, Maven, Spring Boot and Oracle.
</p>

<p>
    This example was tested using the following versions:
</p>

<ul>
    <li>ag-grid-enterprise (v18.0.0)</li>
    <li>Java(TM) SE Runtime Environment (build 1.8.0_162-b12)</li>
    <li>Java HotSpot(TM) 64-Bit Server VM (build 25.162-b12, mixed mode)</li>
    <li>Apache Maven (3.5.2)</li>
    <li>Oracle 12c Release 2 (12.2.0.1)</li>
    <li>Oracle JDBC Driver (ojdbc7-12.1.0.2)</li>
</ul>

<p>
    Due to Oracle license restrictions the Oracle JDBC driver is not available in the public Maven repository and
    should be manually installed into your local Maven repository like so:
</p>

<?= createSnippet('mvn install:install-file -Dfile={Path/to/ojdbc7.jar} -DgroupId=com.oracle -DartifactId=ojdbc7 -Dversion=12.1.0.2 -Dpackaging=jar', 'sh') ?>

<p>
    Also ensure the Oracle JDBC driver version also matches the Oracle POM dependency:
</p>

<?= createSnippet(<<<SNIPPET
// pom.xml

<dependency>
    <groupId>com.oracle</groupId>
    <artifactId>ojdbc7</artifactId>
    <version>12.1.0.2</version>
</dependency>
SNIPPET
, 'html') ?>

<h2 id="download-and-install">Download and Install</h2>

<p>
    Clone the example project using:
</p>

<?= createSnippet('git clone https://github.com/ag-grid/ag-grid-server-side-oracle-example.git', 'sh') ?>

<p>
    Navigate into the project directory:
</p>

<?= createSnippet('cd ag-grid-server-side-oracle-example', 'sh') ?>

<p>
    Install project dependencies and build project using:
</p>

<?= createSnippet('mvn clean install', 'sh') ?>

<p>
    To confirm all went well you should see the following maven output:
</p>

<p><img src="mvn-success.png" width="90%" style="border: 1px solid grey"/></p>

<h2 id="configure-oracle">Configure Oracle</h2>

<p>
    Update the Oracle configuration accordingly with your database connection details:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/resources/application.properties

spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/orcl
spring.datasource.username=system
spring.datasource.password=oracle
SNIPPET
, 'sh') ?>

<h2 id="setup-data">Setup Data</h2>

<p>Run the following script in Oracle to create the table required in this example:</p>

<?= createSnippet(<<<SNIPPET
// src/main/resources/schema.sql

CREATE TABLE trade
(
    product VARCHAR(255),
    portfolio VARCHAR(255),
    book VARCHAR(255),
    tradeId NUMBER,
    submitterId NUMBER,
    submitterDealId NUMBER,
    dealType VARCHAR(255),
    bidType VARCHAR(255),
    currentValue NUMBER,
    previousValue NUMBER,
    pl1 NUMBER,
    pl2 NUMBER,
    gainDx NUMBER,
    sxPx NUMBER,
    x99Out NUMBER,
    batch NUMBER
);
SNIPPET
, 'sql') ?>

<p>Next run the following utility to populate it with data:</p>

<p><code>src/test/java/com/ag/grid/enterprise/oracle/demo/TradeDataLoader.java</code></p>

<h2 id="run-app">Run the App</h2>

<p>From the project root run:</p>

<?= createSnippet('mvn spring-boot:run') ?>

<p>If successful you should see something like this:</p>

<p><img src="tomcat-started.png" width="100%" style="border: 1px solid grey"/></p>

<p>To test the application point your browser to <a href="http://localhost:9090">http://localhost:9090</a></p>

<h2 id="enterprise-datasource">Server-Side Row Model Interfaces</h2>

<p>Our Java service will use the following request and response objects:</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/request/ServerSideGetRowsRequest.java

public class ServerSideGetRowsRequest implements Serializable {

    private int startRow, endRow;

    // row group columns
    private List<ColumnVO> rowGroupCols;

    // value columns
    private List<ColumnVO> valueCols;

    // pivot columns
    private List<ColumnVO> pivotCols;

    // true if pivot mode is on, otherwise false
    private boolean pivotMode;

    // what groups the user is viewing
    private List<String> groupKeys;

    // if filtering, what the filter model is
    private Map<String, ColumnFilter> filterModel;

    // if sorting, what the sort model is
    private List<SortModel> sortModel;

    ...
}
SNIPPET
, 'java') ?>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/response/ServerSideGetRowsResponse.java

public class ServerSideGetRowsResponse {

    private List<Map<String, Object>> data;

    private int lastRow;

    private List<String> secondaryColumnFields;

    ...
}
SNIPPET
, 'java') ?>

<p>
    We will discuss these in detail throughout this guide, however for more details see:
    <a href="/javascript-grid-server-side-model/#server-side-datasource">Server-Side Datasource</a>
</p>

<h2 id="service-controller">Service Controller</h2>

<p>
    Our service shall contain a single endpoint <code>/getRows</code> with the request and response objects defined above:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/controller/TradeController.java

@RestController
public class TradeController {

    private TradeDao tradeDao;

    @Autowired
    public TradeController(@Qualifier("tradeDao") TradeDao tradeDao) {
        this.tradeDao = tradeDao;
    }

    @RequestMapping(method = POST, value = "/getRows")
    @ResponseBody
    public ServerSideGetRowsResponse getRows(@RequestBody ServerSideGetRowsRequest request) {
        return tradeDao.getData(request);
    }
}
SNIPPET
, 'java') ?>

<p>
    The <code>TradeController</code> makes use of the
    <a href="https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-controller">Spring Controller</a>
    to handle HTTP and JSON Serialisation.
</p>

<h2>Data Access</h2>

<p>
    The <code>OracleSqlQueryBuilder</code> dynamically generates SQL based on the supplied request. We will query
    the <code>Trade</code> table with our generated SQL using the
    <a href="https://docs.spring.io/spring/docs/current/spring-framework-reference/data-access.html">Spring JDBC Template</a>.
</p>

<p>
    Here is the implementation of our <code>TradeDao</code>:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/dao/TradeDao.java

@Repository("tradeDao")
public class TradeDao {

    private JdbcTemplate template;
    private OracleSqlQueryBuilder queryBuilder;

    @Autowired
    public TradeDao(JdbcTemplate template) {
        this.template = template;
        queryBuilder = new OracleSqlQueryBuilder();
    }

    public ServerSideGetRowsResponse getData(ServerSideGetRowsRequest request) {
        String tableName = "trade"; // could be supplied in request as a lookup key?

        // first obtain the pivot values from the DB for the requested pivot columns
        Map<String, List<String>> pivotValues = getPivotValues(request.getPivotCols());

        // generate SQL
        String sql = queryBuilder.createSql(request, tableName, pivotValues);

        // query DB for rows
        List<Map<String, Object>> rows = template.queryForList(sql);

        // create response with our results
        return createResponse(request, rows, pivotValues);
    }

    private Map<String, List<String>> getPivotValues(List<ColumnVO> pivotCols) {
        return pivotCols.stream()
            .map(ColumnVO::getField)
            .collect(toMap(
                pivotCol -> pivotCol, this::getPivotValues, (a, b) -> a, LinkedHashMap::new));
    }

    private List<String> getPivotValues(String pivotColumn) {
        String sql = "SELECT DISTINCT %s FROM trade";
        return template.queryForList(format(sql, pivotColumn), String.class);
    }
}
SNIPPET
, 'java') ?>

<h2 id="filtering">Filtering</h2>

<p>
    Our example will make use of the grid's <code>NumberFilter</code> and <code>SetFilter</code>
    <a href="/javascript-grid-filtering/">Column Filters</a>. The corresponding server-side classes are as follows:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/filter/NumberColumnFilter.java

public class NumberColumnFilter extends ColumnFilter {
    private String type;
    private Integer filter;
    private Integer filterTo;
    ...
}
SNIPPET
, 'java') ?>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/filter/SetColumnFilter.java

public class SetColumnFilter extends ColumnFilter {
    private List<String> values;
    ...
}
SNIPPET
, 'java') ?>

<p>These filters are supplied per column in the <code>ServerSideGetRowsRequest</code> via the following property:</p>

<?= createSnippet('Map<String, ColumnFilter> filterModel;', 'java') ?>

<p>
    As these filters differ in structure it is necessary to perform some specialised deserialisation using the Type
    Annotations provided by the <a href="https://github.com/FasterXML/jackson-annotations">Jackson Annotations</a> project.
</p>

<p>
    When the <code>filterModel</code> property is deserialised, we will need to select the appropriate concrete
    <code>ColumnFilter</code> as shown below:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/filter/ColumnFilter.java

@JsonTypeInfo(
    use = JsonTypeInfo.Id.NAME,
    include = JsonTypeInfo.As.PROPERTY,
    property = "filterType")
@JsonSubTypes({
    @JsonSubTypes.Type(value = NumberColumnFilter.class, name = "number"),
    @JsonSubTypes.Type(value = SetColumnFilter.class, name = "set") })
public abstract class ColumnFilter {
    String filterType;
}
SNIPPET
, 'java') ?>

<p>
    Here we are using the <code>filterType</code> property to determine which concrete filter class needs to be
    associated with the <code>ColumnFilter</code> entries in the <code>filterModel</code> map.
</p>

<h2 id="sorting">Sorting</h2>

<p>
    The <code>ServerSideGetRowsRequest</code> contains the following attribute to determine which columns to sort by:
</p>

<?= createSnippet('private List<SortModel> sortModel;', 'java') ?>

<p>
    The <code>SortModel</code> contains the <code>colId</code> (i.e. 'book') and the <code>sort</code> type (i.e. 'asc')
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/request/SortModel.java

public class SortModel implements Serializable {
    private String colId;
    private String sort;
    ...
}
SNIPPET
, 'java') ?>

<p>
    The OracleSqlQueryBuilder then appends accordingly to the <code>ORDER BY</code> clause:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/builder/OracleSqlQueryBuilder.java

orderByCols.isEmpty() ? "" : " ORDER BY " + join(",", orderByCols);
SNIPPET
, 'java') ?>

<h2 id="grouping">Grouping</h2>

<p>
    Grouping is easily achieved in the <code>OracleSqlQueryBuilder</code> by appending <code>rowGroups</code>
    to the <code>GROUP BY</code> like so:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/builder/OracleSqlQueryBuilder.java

private String groupBySql() {
    return isGrouping ? " GROUP BY " + join(", ", rowGroupsToInclude) : "";
}

private List<String> getRowGroupsToInclude() {
    return rowGroups.stream()
        .limit(groupKeys.size() + 1)
        .collect(toList());
}
SNIPPET
, 'java') ?>

<h2 id="pivoting">Pivoting</h2>

<p>
    In order to perform pivoting we will use the <code>OracleSqlQueryBuilder</code> to generate a series of decode
    statements for each combination of pivot and value columns, such as:
</p>

<?= createSnippet(<<<SNIPPET
sum (
     DECODE(DEALTYPE, 'Financial', DECODE(BIDTYPE, 'Buy', CURRENTVALUE))
) "Financial_Buy_CURRENTVALUE"
SNIPPET
, 'sql') ?>

<p>
    These new pivot columns (i.e. 'Secondary Columns') are created using the row values contained in the data and have
    field names such as: <code>Financial_Buy_CURRENTVALUE</code>.
</p>

<p>
    These will need to be returned to the grid in the <code>ServerSideGetRowsResponse</code> in the following property:
</p>

<?= createSnippet('List<String> secondaryColumnFields;', 'java') ?>

<p>
    Our client code will then use these secondary column fields to generate the corresponding <code>ColDefs</code> like so:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/resources/static/main.js

let createSecondaryColumns = function (fields, valueCols) {
    let secondaryCols = [];

    function addColDef(colId, parts, res) {
        if (parts.length === 0) return [];

        let first = parts.shift();
        let existing = res.find(r => r.groupId === first);

        if (existing) {
            existing['children'] = addColDef(colId, parts, existing.children);
        } else {
            let colDef = {};
            let isGroup = parts.length > 0;

            if (isGroup) {
                colDef['groupId'] = first;
                colDef['headerName'] = first;
            } else {
                let valueCol = valueCols.find(r => r.field === first);

                colDef['colId'] = colId;
                colDef['headerName'] =  valueCol.displayName;
                colDef['field'] = colId;
                colDef['type'] = 'measure';
            }

            let children = addColDef(colId, parts, []);
            children.length > 0 ? colDef['children'] = children : null;

            res.push(colDef);
        }

        return res;
    }

    fields.sort();
    fields.forEach(field => addColDef(field, field.split('_'), secondaryCols));

    return secondaryCols;
};
SNIPPET
) ?>

<p>
    In order for the grid to show these newly created columns an explicit API call is required:
</p>

<?= createSnippet('gridOptions.columnApi.setSecondaryColumns(secondaryColDefs);') ?>

<h2 id="infinite-scrolling">Infinite Scrolling</h2>

<p>
    The <code>ServerSideGetRowsRequest</code> contains the following attribute to determine the range to return:
</p>

<?= createSnippet('private int startRow, endRow;') ?>

<p>
    The <code>OracleSqlQueryBuilder</code> uses this information when limiting the results as follows:
</p>

<?= createSnippet(<<<SNIPPET
// src/main/java/com/ag/grid/enterprise/oracle/demo/builder/OracleSqlQueryBuilder.java

private String limitSql() {
    return " OFFSET " + startRow + " ROWS FETCH NEXT " + (endRow - startRow + 1) + " ROWS ONLY";
}
SNIPPET
, 'java') ?>

<h2 id="conclusion">Conclusion</h2>

<p>
    In this guide we presented a reference implementation for integrating the Server-Side Row Model with a Java
    service connected to an Oracle database. This included all necessary configuration and install instructions.
</p>

<p>
    A high level overview was given to illustrate the problem this approach solves before providing details of how
    to achieve the following server-side operations:
</p>

<ul>
    <li>Filtering</li>
    <li>Sorting</li>
    <li>Grouping</li>
    <li>Pivoting</li>
    <li>Infinite Scrolling</li>
</ul>

<?php include '../documentation-main/documentation_footer.php'; ?>