<?php
$pageTitle = "Server-side operations with the Oracle Database and ag-Grid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is a guide on how to perform server-side operations with Oracle and ag-Grid.";
$pageKeyboards = "Server-side operations with the Oracle Database";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
    <h1 id="oracle-enterprise">
        Server-side operations with Java & Oracle
    </h1>

    <p class="lead">
        Learn how to perform server-side operations using the Oracle Database with a complete reference implementation.
    </p>

    <p>
        In this guide we will show how large data sets, which are too big be loaded directly into the browser, can be
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
        the server to the client? As a developer using ag-Grid you won't need to switch between grids based on the
        answer to this question, instead just select the appropriate Row Model used by the grid.
    </p>

    <h4>In-Memory Row Model</h4>

    <p>
        The simplest approach is to send all row data to the browser in response to a single request at initialisation.
        For this use case the <a href="/oracle-server-side-operations/">In-Memory Row Model</a> has been designed.

     <p>
        This scenario is illustrated below where 10,000 records are loaded directly into the browser:
    </p>

    <p><img src="in-memory-row-model.png" width="90%" style="border: 1px solid grey"/></p>

    <p>
        The In-Memory Row Model only renders the rows currently visible, so the upper limit of rows is governed by the
        browsers memory footprint and data transfer time, rather than any restrictions inside the grid.
    </p>

    <h4>Enterprise Row Model</h4>

    <p>
        However many real world applications contain much larger data sets, often involving millions of records. In this
        case it simply isn't feasible to load all the data into the browser in one go. Instead data will somehow need
        to be lazy-loaded as required and then purged to limit the memory footprint in the browser?
    </p>

    <p>
        This is precisely the problem the <a href="/javascript-grid-enterprise-model/">Enterprise Row Model</a> addresses,
        along with delegating server-side operations such as filtering, sorting, grouping and pivoting.
    </p>

    <p>
        The following diagram shows the approach used by the Enterprise Row Model. Here there are 10 million records,
        however the number of records is only constrained by the limits of the server-side:
    </p>

    <p><img src="enterprise-row-model.png" width="90%" style="border: 1px solid grey"/></p>

    <p>
        As the user performs operations such as sorting and grouping, the grid issues requests to the server that contains
        all the necessary metadata required, including which portion of data should be returned based on the users position in
        the data set.
    </p>

    <p>
        The browser will never run out of heap space as the grid will automatically purge out-of-range records.
    </p>

    <p>
        Throughout the rest of this guide we will demonstrate the power of the Enterprise Row Model with the aid of a
        Java service connected to an oracle database.
    </p>

    <h2 id="prerequisites">Prerequisites</h2>

    <p>
        It is assumed the reader is already familiar with Java, Maven, Spring Boot and Oracle.
    </p>

    <p>
        This example was tested using the following versions:

        <ul>
            <li>ag-grid-enterprise (v18.0.0)</li>
            <li>Java(TM) SE Runtime Environment (build 1.8.0_162-b12)</li>
            <li>Java HotSpot(TM) 64-Bit Server VM (build 25.162-b12, mixed mode)</li>
            <li>Apache Maven (3.5.2)</li>
            <li>Oracle 12c Release 2 (12.2.0.1)</li>
            <li>Oracle JDBC Driver (ojdbc7-12.1.0.2)</li>
        </ul>
    </p>

    <p>
        Due to Oracle license restrictions the Oracle JDBC driver is not available in the public Maven repository and
        should be manually installed into your local Maven repository like so:
    </p>

<snippet>
$ mvn install:install-file -Dfile={Path/to/ojdbc7.jar} -DgroupId=com.oracle -DartifactId=ojdbc7 -Dversion=12.1.0.2 -Dpackaging=jar
</snippet>

    <p>
        Also ensure the Oracle JDBC driver version also matches the Oracle POM dependency:
    </p>

<snippet>
// pom.xml

&lt;dependency>
    &lt;groupId>com.oracle&lt;/groupId>
    &lt;artifactId>ojdbc7&lt;/artifactId>
    &lt;version>12.1.0.2&lt;/version>
&lt;/dependency>
</snippet>

    <h2 id="download-and-install">Download and Install</h2>

    <p>
        Clone the example project using:

        <snippet>
            git clone https://github.com/ag-grid/ag-grid-server-side-oracle-example.git
        </snippet>

        Navigate into the project directory:

        <snippet>
        cd ag-grid-server-side-oracle-example
        </snippet>

        Install project dependencies and build project using:

        <snippet>
        mvn clean install
        </snippet>
    </p>

    <p>
       To confirm all went well you should see the following maven output:
    </p>

    <p><img src="mvn-success.png" width="90%" style="border: 1px solid grey"/></p>

    <h2 id="configure-oracle">Configure Oracle</h2>

    <p>
       Update the Oracle configuration accordingly with your database connection details:
    </p>

<snippet>
// src/main/resources/application.properties

spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/orcl
spring.datasource.username=system
spring.datasource.password=oracle
</snippet>


    <h2 id="setup-data">Setup Data</h2>

    <p>Run the following script in Oracle to create the table required in this example:</p>

<snippet>
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
</snippet>

    <p>Next run the following utility to populate it with data:</p>

    <p><code>src/test/java/com/ag/grid/enterprise/oracle/demo/TradeDataLoader.java</code></p>

    <h2 id="run-app">Run the App</h2>

    <p>From the project root run:  <code>mvn spring-boot:run</code></p>

    <p>If successful you should see something like this:</p>

    <p><img src="tomcat-started.png" width="100%" style="border: 1px solid grey"/></p>

    <p>To test the application point your browser to: <code>localhost:9090</code></p>

    <h2 id="enterprise-datasource">Enterprise Row Model Interfaces</h2>

    <p>Our Java service will use the following request and response objects:</p>

<snippet>
// src/main/java/com/ag/grid/enterprise/oracle/demo/request/EnterpriseGetRowsRequest.java

public class EnterpriseGetRowsRequest implements Serializable {

    private int startRow, endRow;

    // row group columns
    private List&lt;ColumnVO> rowGroupCols;

    // value columns
    private List&lt;ColumnVO> valueCols;

    // pivot columns
    private List&lt;ColumnVO> pivotCols;

    // true if pivot mode is one, otherwise false
    private boolean pivotMode;

    // what groups the user is viewing
    private List&lt;String> groupKeys;

    // if filtering, what the filter model is
    private Map&lt;String, ColumnFilter> filterModel;

    // if sorting, what the sort model is
    private List&lt;SortModel> sortModel;

    ...
}
</snippet>

<snippet>
// src/main/java/com/ag/grid/enterprise/oracle/demo/response/EnterpriseGetRowsResponse.java

public class EnterpriseGetRowsResponse {

    private List&lt;Map&lt;String, Object>> data;

    private int lastRow;

    private List&lt;String> secondaryColumnFields;

    ...
}
</snippet>
    <p>
        We will discuss these in detail throughout this guide, however for more details see:
        <a href="/javascript-grid-enterprise-model/#enterprise-datasource">Enterprise Datasource</a>
    </p>

    <h2 id="service-controller">Service Controller</h2>

    <p>
        Our service shall contain a single endpoint <code>/getRows</code> with the request and response objects defined above:
    </p>

<snippet>
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
    public EnterpriseGetRowsResponse getRows(@RequestBody EnterpriseGetRowsRequest request) {
        return tradeDao.getData(request);
    }
}
</snippet>

    <p>
        The <code>TradeController</code> makes use of the
        <a href="https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-controller">Spring Controller</a>
        to handle HTTP and JSON Serialization.
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

<snippet>
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

    public EnterpriseGetRowsResponse getData(EnterpriseGetRowsRequest request) {
        String tableName = "trade"; // could be supplied in request as a lookup key?

        // first obtain the pivot values from the DB for the requested pivot columns
        Map&lt;String, List&lt;String>> pivotValues = getPivotValues(request.getPivotCols());

        // generate sql
        String sql = queryBuilder.createSql(request, tableName, pivotValues);

        // query db for rows
        List&lt;Map&lt;String, Object>> rows = template.queryForList(sql);

        // create response with our results
        return createResponse(request, rows, pivotValues);
    }

    private Map&lt;String, List&lt;String>> getPivotValues(List&lt;ColumnVO> pivotCols) {
        return pivotCols.stream()
            .map(ColumnVO::getField)
            .collect(toMap(
                pivotCol -> pivotCol, this::getPivotValues, (a, b) -> a, LinkedHashMap::new));
    }

    private List&lt;String> getPivotValues(String pivotColumn) {
        String sql = "SELECT DISTINCT %s FROM trade";
        return template.queryForList(format(sql, pivotColumn), String.class);
    }
}
</snippet>

    <h2 id="filtering">Filtering</h2>

    <p>
        Our example will make use of the grids <code>NumberFilter</code> and <code>SetFilter</code>
        <a href="/javascript-grid-filtering/">Column Filter's</a>. The corresponding server side classes are as follows:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/oracle/demo/filter/NumberColumnFilter.java
public class NumberColumnFilter extends ColumnFilter {
    private String type;
    private Integer filter;
    private Integer filterTo;
    ...
}

// src/main/java/com/ag/grid/enterprise/oracle/demo/filter/SetColumnFilter.java
public class SetColumnFilter extends ColumnFilter {
    private List&lt;String> values;
    ...
}
</snippet>

<p>These filters are supplied per column in the <code>EnterpriseGetRowsRequest</code> via the following property:</p>

<snippet>
    Map&lt;String, ColumnFilter> filterModel;
</snippet>

    <p>
        As these filters differ in structure it is necessary to perform some specialised deserialization using the Type
        Annotations provided by the <a href="https://github.com/FasterXML/jackson-annotations">Jackson Annotations</a> project.
    </p>

    <p>When the <code>filterModel</code> property is deserialized, we will need to select the appropriate concrete
        <code>ColumnFilter</code> as shown below:</p>

<snippet>
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
</snippet>

    <p>
        Here we are using the <code>filterType</code> property to determine which concrete filter class needs to be
        associated with the <code>ColumnFilter</code> entries in the <code>filterModel</code> map.
    </p>


    <h2 id="sorting">Sorting</h2>

    <p>
        The <code>EnterpriseGetRowsRequest</code> contains the following attribute to determine which columns to sort by:
    </p>

    <snippet>
        private List&lt;SortModel> sortModel;
    </snippet>

    <p>
        The <code>SortModel</code> contains the <code>colId</code> (i.e. 'book') and the <code>sort</code> type (i.e. 'asc')
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/oracle/demo/request/SortModel.java

public class SortModel implements Serializable {
    private String colId;
    private String sort;
    ...
}
</snippet>

<p>
    The OracleSqlQueryBuilder then appends accordingly to the <code>ORDER BY</code> clause:
</p>

<snippet>
// src/main/java/com/ag/grid/enterprise/oracle/demo/builder/OracleSqlQueryBuilder.java

orderByCols.isEmpty() ? "" : " ORDER BY " + join(",", orderByCols);
</snippet>


    <h2 id="grouping">Grouping</h2>

    <p>
        Grouping is easily achieved in the <code>OracleSqlQueryBuilder</code> by appending <code>rowGroups</code>
        to the <code>GROUP BY</code> like so:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/oracle/demo/builder/OracleSqlQueryBuilder.java

private String groupBySql() {
    return isGrouping ? " GROUP BY " + join(", ", rowGroupsToInclude) : "";
}

private List&lt;String> getRowGroupsToInclude() {
    return rowGroups.stream()
        .limit(groupKeys.size() + 1)
        .collect(toList());
}
</snippet>


<h2 id="pivoting">Pivoting</h2>

    <p>In order to perform pivoting we will use the <code>OracleSqlQueryBuilder</code> to generate a series of decode
       statements for each combination of pivot and value columns, such as:
    </p>

<snippet>
sum (
     DECODE(DEALTYPE, 'Financial', DECODE(BIDTYPE, 'Buy', CURRENTVALUE))
) "Financial_Buy_CURRENTVALUE"
</snippet>

<p>
    These new pivot columns (i.e. 'Secondary Columns') are created using the row values contained in the data and have
    field names such as: <code>Financial_Buy_CURRENTVALUE</code>.
</p>
<p>
    These will need to be returned to the grid in the <code>EnterpriseGetRowsResponse</code> in the following property:
</p>

<snippet>
    List&lt;String> secondaryColumnFields;
</snippet>

<p>
    Our client code will then use these secondary column field to generate the corresponding <code>ColDef's</code> like so:
</p>

<snippet>
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
            if(isGroup) {
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
</snippet>

    <p>
        In order for the grid to show these newly created columns an explicit api call is required:
    </p>

<snippet>
gridOptions.columnApi.setSecondaryColumns(secondaryColDefs);
</snippet>

    <h2 id="infinite-scrolling">Infinite Scrolling</h2>

    <p>
        The <code>EnterpriseGetRowsRequest</code> contains the following attribute to determine the range to return:
    </p>

<snippet>
    private int startRow, endRow;
</snippet>

    <p>
        The <code>OracleSqlQueryBuilder</code> uses this information when limiting the results as follows:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/oracle/demo/builder/OracleSqlQueryBuilder.java

private String limitSql() {
    return " OFFSET " + startRow + " ROWS FETCH NEXT " + (endRow - startRow + 1) + " ROWS ONLY";
}
</snippet>

    <h2 id="conclusion">Conclusion</h2>

    <p>
        In this guide we presented a reference implementation for integrating the Enterprise Row Model with a Java
        service connected to an Oracle database. This included all necessary configuration and install instructions.
    </p>

    <p>
        A high level overview was given to illustrate the problem this approach solves before providing details of how
        to achieve the following server-side operations:

        <ul>
            <li>Filtering</li>
            <li>Sorting</li>
            <li>Grouping</li>
            <li>Pivoting</li>
            <li>Infinite Scrolling</li>
        </ul>

    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>