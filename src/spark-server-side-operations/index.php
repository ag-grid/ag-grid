<?php
$pageTitle = "Server-side operations with Apache Spark and ag-Grid";
$pageDescription = "ag-Grid is a feature-rich datagrid available in Free or Enterprise versions. This is a guide on how to perform server-side operations with Apache Spark and ag-Grid";
$pageKeyboards = "Server-side operations with the Apache Spark";
$pageGroup = "basics";
include '../documentation-main/documentation_header.php';
?>
    <h1 id="spark-enterprise">
        Server-side operations with Java & Spark
    </h1>

    <p class="lead">
        Learn how to perform server-side operations using Apache Spark with a complete reference implementation.
    </p>

    <p>
        In recent years analysts and data scientists are requesting browser based applications for big data analytics.
        This data is often widely dispersed in different systems and large file storage volumes.
    </p>

    <p>
        This guide will show how to combine Apache Spark's powerful server side transformations with ag-Grid's
        <a href="/javascript-grid-enterprise-model/">Enterprise Row Model</a> to create interactive reports
        for big data analytics.
    </p>

    <p>
        We will develop an Olympic Medals application that demonstrates how data can be lazy-loaded as required,
        even when performing group, filter, sort and pivot operations.
    </p>

    <img src="spark-enterprise-app.png" width="100%" style="border: 1px solid grey"/>

    <note>
        The reference implementation covered in this guide is for demonstration purposes only. If you use
        this in production it comes with no warranty or support.
    </note>

    <p>
        The source code can be found here: <a href="https://github.com/ag-grid/ag-grid-server-side-apache-spark-example">ag-grid-server-side-apache-spark-example</a>
    </p>

    <h2 id="overview">Overview</h2>

    <p>
        Apache Spark has quickly become a popular choice for iterative data processing and reporting in a big
        data context. This is largely due to it's ability to cache distributed datasets in memory for faster execution times.
    </p>

    <h4 id="dataframes">DataFrames</h4>

    <p>
        The Apache Spark SQL library contains a distributed collection called a
        <a href="https://spark.apache.org/docs/latest/sql-programming-guide.html#datasets-and-dataframes">DataFrame</a>
        which represents data as a table with rows and named columns. It's distributed nature means large datasets
        can span many computers to increase storage and parallel execution.
    </p>

    <p>
        In our example we will create a DataFrame from a single csv file and cache it in memory for successive
        transformations. In real world applications data will typically be sourced from many input systems and files.
    </p>

    <h4 id="transformations">Transformations</h4>

    <p>
        With our application data loaded into a DataFrame we can then use API calls to perform data transformations. It's
        important to note that transformations just specify the processing that will occur when triggered by an action
        such as <i>count</i> or <i>collect</i>.
    </p>

    <p>
        The following diagram illustrates the pipeline of transformations we will be performing in our application:

    </p>

    <p><img src="spark-transformations.png" width="100%" style="border: 1px solid grey"/></p>

    <p>
        Each of these individual transformations will be described in detail throughout this guide.
    </p>

    <p>
        Before preceding with this guide be sure to review the <a href="/oracle-server-side-operations/#overview">Row Model Overview</a>
        as it provides some context for choosing the Enterprise Row Model for big data applications.
    </p>

    <h2 id="prerequisites">Prerequisites</h2>

    <p>
        It is assumed the reader is already familiar with Java, Maven, Spring Boot and Apache Spark.
    </p>

    <p>
        This example was tested using the following versions:

        <ul>
            <li>ag-grid-enterprise (v18.0.0)</li>
            <li>Java(TM) SE Runtime Environment (build 1.8.0_162-b12)</li>
            <li>Java HotSpot(TM) 64-Bit Server VM (build 25.162-b12, mixed mode)</li>
            <li>Apache Maven (3.5.2)</li>
            <li>Apache Spark Core 2.11(v2.2.1)</li>
            <li>Apache Spark SQL 2.11(v2.2.1)</li>
        </ul>
    </p>

    <h2 id="download-and-install">Download and Install</h2>

    <p>
        Clone the example project using:

        <snippet>
            git clone https://github.com/ag-grid/ag-grid-server-side-apache-spark-example.git
        </snippet>

        Navigate into the project directory:

        <snippet>
        cd ag-grid-server-side-apache-spark-example
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

    <h2 id="configure-spark">Spark Configuration</h2>

    <p>
       The example application is configured to run in local mode as shown below:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

SparkConf sparkConf = new SparkConf()
    .setAppName("OlympicMedals")
    .setMaster("local[*]")
    .set("spark.sql.shuffle.partitions", "2");
</snippet>

    <p>
        By default the <code>spark.sql.shuffle.partitions</code> is set to 200. This will result in performance degradation
        when in local mode. It has been arbitrarily set to 2 partitions, however when in cluster mode this should be
        increased to enable parallelism and prevent out of memory exceptions.
    </p>


    <h2 id="setup-data">Setup Data</h2>

    <p>The project includes a small dataset contained within the following csv file:</p>

    <p><code>src/main/resources/data/result.csv</code></p>

    <p>The <code>OlympicMedalDataLoader</code> utility has been provided to generate a larger dataset however:</p>

<snippet>
// src/test/java/util/OlympicMedalDataLoader.java

public class OlympicMedalDataLoader {
    private static String FILENAME = "src/main/resources/data/result.csv";
    private static int BATCH_SIZE = 10_000_000;

    public static void main(String[] args) throws IOException {
        Files.write(Paths.get(FILENAME),
        (Iterable<String>) IntStream
            .range(0, BATCH_SIZE)
            .mapToObj(i -> randomResult())::iterator, APPEND);
    }

    ...
}
</snippet>

<p>
    When executed it will append an additional 10 million records to <code>results.csv</code>, however you can modify
    this by changing the <code>BATCH_SIZE</code>.
</p>

    <h2 id="run-app">Run the App</h2>

    <p>From the project root run:  <code>mvn spring-boot:run</code></p>

    <p>If successful you should see something like this:</p>

    <p><img src="tomcat-started.png" width="100%" style="border: 1px solid grey"/></p>

    <p>To test the application point your browser to: <code>localhost:9090</code></p>

    <h2 id="enterprise-datasource">Enterprise Get Rows Request</h2>

    <p>Our Java service will use the following request:</p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/request/EnterpriseGetRowsRequest.java

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

    <p>
        We will discuss this in detail throughout this guide, however for more details see:
        <a href="/javascript-grid-enterprise-model/#enterprise-datasource">Enterprise Datasource</a>.
    </p>

    <h2 id="service-controller">Service Controller</h2>

    <p>
        Our service shall contain a single endpoint <code>/getRows</code> with accepts the request defined above:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/controller/OlympicMedalsController.java

@RestController
public class OlympicMedalsController {

    @Autowired
    private OlympicMedalDao medalDao;

    @RequestMapping(method = RequestMethod.POST, value = "/getRows")
    public ResponseEntity&lt;String> getRows(@RequestBody EnterpriseGetRowsRequest request) {
        DataResult data = medalDao.getData(request);
        return new ResponseEntity<>(asJsonResponse(data), HttpStatus.OK);
    }

    ...
}
</snippet>

    <p>
        The <code>OlympicMedalsController</code> makes use of the
        <a href="https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-controller">Spring Controller</a>
        to handle HTTP and JSON Serialization.
    </p>

    <h2>Data Access</h2>

    <p>
        The <code>OlympicMedalDao</code> contains most of the application code. It interacts directly with Spark and
        uses the API's to perform the various data transformations.
    </p>

    <p>
        Upon initialisation it creates a spark session using the configuration discussed above. It then reads in the
        data from <code>result.csv</code> to create a DataFrame which is cached for subsequent transformations.
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/dao/OlympicMedalDao.java

private SparkSession sparkSession;

@PostConstruct
public void init() {
    SparkConf sparkConf = new SparkConf()
        .setAppName("OlympicMedals")
        .setMaster("local[*]")
        .set("spark.sql.shuffle.partitions", "1");

    this.sparkSession = SparkSession.builder()
        .config(sparkConf)
        .getOrCreate();

    Dataset&lt;Row> dataFrame = this.sparkSession.read()
        .option("header", "true")
        .option("inferSchema", "true")
        .csv("src/main/resources/data/result.csv");

    dataFrame.cache();

    dataFrame.createOrReplaceTempView("medals");
}
</snippet>

    <p>
        A view containing the medals data is created using <code>dataFrame.createOrReplaceTempView("medals")</code>.
        This is lazily evaluated but the backing dataset has been previously cached using: <code>dataFrame.cache()</code>.
    </p>

    <p>
        As a DataFrame is a structured collection we have supplied the <code>inferSchema=true</code> option to allow
        Spark to infer the schema using the first few rows contained in <code>result.csv</code>.
    </p>

    <p>
        The rest of this class will be discussed in the remaining sections.
    </p>


    <h2 id="filtering">Filtering</h2>

    <p>
        Our example will make use of the grids <code>NumberFilter</code> and <code>SetFilter</code>
        <a href="/javascript-grid-filtering/">Column Filter's</a>. The corresponding server side classes are as follows:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/filter/NumberColumnFilter.java
public class NumberColumnFilter extends ColumnFilter {
    private String type;
    private Integer filter;
    private Integer filterTo;
    ...
}

// src/main/java/com/ag/grid/enterprise/spark/demo/filter/SetColumnFilter.java
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
// src/main/java/com/ag/grid/enterprise/spark/demo/filter/ColumnFilter.java

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

<p>
    The filters are supplied to the DataFrame using standard SQL syntax as shown below:
</p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/dao/OlympicMedalDao.java

Stream<String> columnFilters = filterModel.entrySet()
    .stream()
    .map(applyColumnFilters);

Stream<String> groupToFilter = zip(groupKeys.stream(), rowGroups.stream(),
    (key, group) -> group + " = '" + key + "'");

String filters = concat(columnFilters, groupToFilter).collect(joining(" AND "));

df.filter(filters);
</snippet>

    <h2 id="grouping">Grouping</h2>

    <p>
        Grouping is performed using <code>Dataset.groupBy()</code> as shown below:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/dao/OlympicMedalDao.java

private Dataset&lt;Row> groupBy(Dataset&lt;Row> df) {
    if (!isGrouping) return df;

    Column[] groups = rowGroups.stream()
        .limit(groupKeys.size() + 1)
        .map(functions::col)
        .toArray(Column[]::new);

    return agg(pivot(df.groupBy(groups)));
}
</snippet>

<p>
    The result of a <code>groupBy()</code> transformation is a <code>RelationalGroupedDataset</code> collection. This
    is supplied to the <code>pivot</code> and <code>agg</code> functions.
</p>

<h2 id="pivoting">Pivoting</h2>

    <p>
        Spark SQL provides a convenient pivot function to create pivot tables, however as it currently only supports
        pivots on a single column our example will only allow pivoting on the sport column. This is enabled on the
        <code>ColDef.enablePivot=true</code> in the client code.
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

private RelationalGroupedDataset pivot(RelationalGroupedDataset groupedDf) {
    if (!isPivotMode) return groupedDf;

    // spark sql only supports a single pivot column
    Optional&lt;String> pivotColumn = pivotColumns.stream()
        .map(ColumnVO::getField)
        .findFirst();

    return pivotColumn.map(groupedDf::pivot).orElse(groupedDf);
}
</snippet>

    <p>
        The result of a <code>pivot()</code> transformation is also a <code>RelationalGroupedDataset</code>.
    </p>

<p>
    From the DataFrame we will use the inferred schema to determine the generated secondary columns:
</p>

<snippet>
private List<String> getSecondaryColumns(Dataset<Row> df) {
    return stream(df.schema().fieldNames())
        .filter(f -> !rowGroups.contains(f)) // filter out group fields
        .collect(toList());
}
</snippet>


<p>
    These will need to be returned to the grid in the following property:
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

    <h2 id="aggregations">Aggregation</h2>

    <p>
        Aggregations are performed using <code>RelationalGroupedDataset.agg()</code> as shown below:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/dao/OlympicMedalDao.java

private Dataset&lt;Row> agg(RelationalGroupedDataset groupedDf) {
    if (valueColumns.isEmpty()) return groupedDf.count();

    Column[] aggCols = valueColumns
        .stream()
        .map(ColumnVO::getField)
        .map(field -> sum(field).alias(field))
        .toArray(Column[]::new);

    return groupedDf.agg(aggCols[0], copyOfRange(aggCols, 1, aggCols.length));
}
</snippet>

    <p>
        Note that our example only requires the <code>sum()</code> aggregation function.
    </p>

    <h2 id="sorting">Sorting</h2>

    <p>
        The <code>EnterpriseGetRowsRequest</code> contains the following attribute to determine which columns to sort by:
    </p>

    <snippet>
        private List&lt;SortModel> sortModel;
    </snippet>

    <p>
        The <code>SortModel</code> contains the <code>colId</code> (i.e. 'athlete') and the <code>sort</code> type (i.e. 'asc')
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/request/SortModel.java

public class SortModel implements Serializable {
    private String colId;
    private String sort;
    ...
}
</snippet>

    <p>
        The <code>Dataset.orderBy()</code> function accepts an array of Spark <code>Column</code> objects that specify
        the sort order as shown below:
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

private Dataset&lt;Row> orderBy(Dataset&lt;Row> df) {
    Stream&lt;String> groupCols = rowGroups.stream()
        .limit(groupKeys.size() + 1);

    Stream&lt;String> valCols = valueColumns.stream()
        .map(ColumnVO::getField);

    List&lt;String> allCols = concat(groupCols, valCols).collect(toList());

    Column[] cols = sortModel.stream()
        .map(model -> Pair.of(model.getColId(), model.getSort().equals("asc")))
        .filter(p -> !isGrouping || allCols.contains(p.getKey()))
        .map(p -> p.getValue() ? col(p.getKey()).asc() : col(p.getKey()).desc())
        .toArray(Column[]::new);

    return df.orderBy(cols);
}
</snippet>

    <h2 id="infinite-scrolling">Infinite Scrolling</h2>

    <p>
        The <code>EnterpriseGetRowsRequest</code> contains the following attributes to determine the range to return:
    </p>

<snippet>
    private int startRow, endRow;
</snippet>

    <p>
        The <code>OlympicMedalsService</code> uses this information when limiting the results.

    <p>
        As Spark SQL doesn't provide <code>LIMIT OFFSET</code> capabilities like most SQL databases, we will need to do
        a bit of work in order to efficiently limit the results whilst ensuring we don't exceed local memory.
    </p>

    <p>
        The strategy used in the code below is to convert the supplied Data Frame into a Resilient Distributed Dataset
        (RDD) in order to introduce a row index using <code>zipWithIndex()</code>. The row index can then be used to
        filter the rows according to the requested range.
    </p>

<snippet>
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

private DataResult paginate(Dataset&lt;Row> df, int startRow, int endRow) {
    // save schema to recreate data frame
    StructType schema = df.schema();

    // obtain row count
    long rowCount = df.count();

    // convert data frame to RDD and introduce a row index so we can filter results by range
    JavaPairRDD&lt;Row, Long> zippedRows = df.toJavaRDD().zipWithIndex();

    // filter rows by row index for the requested range (startRow, endRow)
    JavaRDD&lt;Row> filteredRdd =
        zippedRows.filter(pair -> pair._2 >= startRow && pair._2 <= endRow)
                  .map(pair -> pair._1);

    // collect paginated results into a list of json objects
    List&lt;String> paginatedResults = sparkSession.sqlContext()
        .createDataFrame(filteredRdd, schema)
        .toJSON()
        .collectAsList();

    // calculate last row
    long lastRow = endRow >= rowCount ? rowCount : -1;

    return new DataResult(paginatedResults, lastRow, getSecondaryColumns(df));
}
</snippet>

    <p>
        The RDD is then converted back into a Data Frame using the original schema previously stored. Once the rows
        have been filtered we can then safely collect the reduced results as a list of JSON objects. This ensures we
        don't run out of memory by bringing back all the results.
    </p>

    <p>
        Finally we determine the <code>lastRow</code> and retrieve the secondary columns which contain will be required
        by the client code to generate <code>ColDefs</code> when in pivot mode.
    </p>

    <h2 id="conclusion">Conclusion</h2>

    <p>
        In this guide we presented a reference implementation for integrating the Enterprise Row Model with a Java
        service connected to Apache Spark. This included all necessary configuration and install instructions.
    </p>

    <p>
        A high level overview was given to illustrate how the distributed DataFrame is transformed in the example
        application before providing details of how to achieve the following server-side operations:

        <ul>
            <li>Filtering</li>
            <li>Grouping</li>
            <li>Pivoting</li>
            <li>Aggregation</li>
            <li>Sorting</li>
            <li>Infinite Scrolling</li>
        </ul>

    </p>

<?php include '../documentation-main/documentation_footer.php'; ?>