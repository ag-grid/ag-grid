---
title: "Server-Side Operations With Java & Spark"
enterprise: true
---

Learn how to perform server-side operations using Apache Spark with a complete reference implementation.

In recent years analysts and data scientists are requesting browser based applications for big data analytics. This data is often widely dispersed in different systems and large file storage volumes.


This guide will show how to combine Apache Spark's powerful server side transformations with AG Grid's [Server-Side Row Model](/server-side-model/) to create interactive reports for big data analytics.

We will develop an Olympic Medals application that demonstrates how data can be lazy-loaded as required, even when performing group, filter, sort and pivot operations.


<image-caption src="server-side-operations-spark/resources/spark-enterprise-app.png" alt="Spark" constrained="true"></image-caption>

[[note]]
| The reference implementation covered in this guide is for demonstration purposes only. If you use this in production it comes with no warranty or support.

The source code can be found here: [https://github.com/ag-grid/ag-grid-server-side-apache-spark-example](https://github.com/ag-grid/ag-grid-server-side-apache-spark-example)


## Overview

Apache Spark has quickly become a popular choice for iterative data processing and reporting in a big data context. This is largely due to its ability to cache distributed datasets in memory for faster execution times.


### DataFrames

The Apache Spark SQL library contains a distributed collection called a [DataFrame](https://spark.apache.org/docs/latest/sql-programming-guide.html#datasets-and-dataframes) which represents data as a table with rows and named columns. Its distributed nature means large datasets can span many computers to increase storage and parallel execution.


In our example we will create a DataFrame from a single CSV file and cache it in memory for successive
    transformations. In real-world applications data will typically be sourced from many input systems and files.


### Transformations

With our application data loaded into a DataFrame we can then use API calls to perform data transformations. It's important to note that transformations just specify the processing that will occur when triggered by an action such as _count_ or _collect_.

The following diagram illustrates the pipeline of transformations we will be performing in our application:

<image-caption src="server-side-operations-spark/resources/spark-transformations.png" alt="Spark" constrained="true"></image-caption>

Each of these individual transformations will be described in detail throughout this guide.

Before proceeding with this guide be sure to review the [Row Model Overview](/server-side-operations-oracle/#overview) as it provides some context for choosing the Server-Side Row Model for big data applications.


## Prerequisites

It is assumed the reader is already familiar with Java, Maven, Spring Boot and Apache Spark.

This example was tested using the following versions:

- ag-grid-enterprise (v18.0.0)
- Java(TM) SE Runtime Environment (build 1.8.0_162-b12)
- Java HotSpot(TM) 64-Bit Server VM (build 25.162-b12, mixed mode)
- Apache Maven (3.5.2)
- Apache Spark Core 2.11(v2.2.1)
- Apache Spark SQL 2.11(v2.2.1)

## Download and Install

Clone the example project using:


```bash
git clone https://github.com/ag-grid/ag-grid-server-side-apache-spark-example.git
```

Navigate into the project directory:


```bash
cd ag-grid-server-side-apache-spark-example
```

Install project dependencies and build project using:


```bash
mvn clean install
```

To confirm all went well you should see the following maven output:

<image-caption src="server-side-operations-spark/resources/mvn-success.png" alt="MVN" constrained="true"></image-caption>

## Spark Configuration

The example application is configured to run in local mode as shown below:


```java
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

SparkConf sparkConf = new SparkConf()
    .setAppName("OlympicMedals")
    .setMaster("local[*]")
    .set("spark.sql.shuffle.partitions", "2");
```

By default the `spark.sql.shuffle.partitions` is set to 200. This will result in performance degradation when in local mode. It has been arbitrarily set to 2 partitions, however when in cluster mode this should be increased to enable parallelism and prevent out of memory exceptions.

## Setup Data

The project includes a small dataset contained within the following CSV file: `src/main/resources/data/result.csv`

The `OlympicMedalDataLoader` utility has been provided to generate a larger dataset however:

```java
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
```

When executed it will append an additional 10 million records to `results.csv`, however you can modify this by changing the `BATCH_SIZE`.

## Run the App

From the project root run:

```bash
mvn spring-boot:run
```

If successful you should see something like this:

<image-caption src="server-side-operations-spark/resources/tomcat-started.png" alt="Tomcat" constrained="true"></image-caption>

To test the application point your browser to [http://localhost:9090](http://localhost:9090)

## Server-Side Get Rows Request

Our Java service will use the following request:

```java
// src/main/java/com/ag/grid/enterprise/spark/demo/request/ServerSideGetRowsRequest.java

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
```

We will discuss this in detail throughout this guide, however for more details see: [Server-Side Datasource](/server-side-model-datasource/).

## Service Controller

Our service shall contain a single endpoint `/getRows` which accepts the request defined above:


```java
// src/main/java/com/ag/grid/enterprise/spark/demo/controller/OlympicMedalsController.java

@RestController
public class OlympicMedalsController {

    @Autowired
    private OlympicMedalDao medalDao;

    @RequestMapping(method = RequestMethod.POST, value = "/getRows")
    public ResponseEntity<String> getRows(@RequestBody ServerSideGetRowsRequest request) {
        DataResult data = medalDao.getData(request);
        return new ResponseEntity<>(asJsonResponse(data), HttpStatus.OK);
    }

    ...
}
```

The `OlympicMedalsController` makes use of the [Spring Controller](https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-controller) to handle HTTP and JSON Serialisation.


## Data Access

The `OlympicMedalDao` contains most of the application code. It interacts directly with Spark and uses the APIs to perform the various data transformations.


Upon initialisation it creates a Spark session using the configuration discussed above. It then reads in the data from `result.csv` to create a DataFrame which is cached for subsequent transformations.


```java
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

    Dataset<Row> dataFrame = this.sparkSession.read()
        .option("header", "true")
        .option("inferSchema", "true")
        .csv("src/main/resources/data/result.csv");

    dataFrame.cache();

    dataFrame.createOrReplaceTempView("medals");
}
```

A view containing the medals data is created using `dataFrame.createOrReplaceTempView("medals")`. This is lazily evaluated but the backing dataset has been previously cached using `dataFrame.cache()`.


As a DataFrame is a structured collection we have supplied the `inferSchema=true` option to allow Spark to infer the schema using the first few rows contained in `result.csv`.


The rest of this class will be discussed in the remaining sections.


## Filtering

Our example will make use of the grid's `NumberFilter` and `SetFilter` [Column Filters](/filtering/). The corresponding server-side classes are as follows:

```java
// src/main/java/com/ag/grid/enterprise/spark/demo/filter/NumberColumnFilter.java

public class NumberColumnFilter extends ColumnFilter {
    private String type;
    private Integer filter;
    private Integer filterTo;
    ...
}
```

```java
// src/main/java/com/ag/grid/enterprise/spark/demo/filter/SetColumnFilter.java

public class SetColumnFilter extends ColumnFilter {
    private List<String> values;
    ...
}
```

These filters are supplied per column in the `ServerSideGetRowsRequest` via the following property:

```java
Map<String, ColumnFilter> filterModel;
```

As these filters differ in structure it is necessary to perform some specialised deserialisation using the Type Annotations provided by the [Jackson Annotations](https://github.com/FasterXML/jackson-annotations) project.


When the `filterModel` property is deserialized, we will need to select the appropriate concrete `ColumnFilter` as shown below:

```java
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
```

Here we are using the `filterType` property to determine which concrete filter class needs to be associated with the `ColumnFilter` entries in the `filterModel` map.

The filters are supplied to the DataFrame using standard SQL syntax as shown below:

```java
// src/main/java/com/ag/grid/enterprise/spark/demo/dao/OlympicMedalDao.java

Stream<String> columnFilters = filterModel.entrySet()
    .stream()
    .map(applyColumnFilters);

Stream<String> groupToFilter = zip(groupKeys.stream(), rowGroups.stream(),
    (key, group) -> group + " = '" + key + "'");

String filters = concat(columnFilters, groupToFilter).collect(joining(" AND "));

df.filter(filters);
```

## Grouping

Grouping is performed using `Dataset.groupBy()` as shown below:

```java
// src/main/java/com/ag/grid/enterprise/spark/demo/dao/OlympicMedalDao.java

private Dataset<Row> groupBy(Dataset<Row> df) {
    if (!isGrouping) return df;

    Column[] groups = rowGroups.stream()
        .limit(groupKeys.size() + 1)
        .map(functions::col)
        .toArray(Column[]::new);

    return agg(pivot(df.groupBy(groups)));
}
```

The result of a `groupBy()` transformation is a `RelationalGroupedDataset` collection. This is supplied to the `pivot` and `agg` functions.

## Pivoting

Spark SQL provides a convenient pivot function to create pivot tables, however as it currently only supports pivots on a single column our example will only allow pivoting on the sport column. This is enabled on the `ColDef.enablePivot=true` in the client code.


```java
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

private RelationalGroupedDataset pivot(RelationalGroupedDataset groupedDf) {
    if (!isPivotMode) return groupedDf;

    // spark sql only supports a single pivot column
    Optional<String> pivotColumn = pivotColumns.stream()
        .map(ColumnVO::getField)
        .findFirst();

    return pivotColumn.map(groupedDf::pivot).orElse(groupedDf);
}
```

The result of a `pivot()` transformation is also a `RelationalGroupedDataset`.


From the DataFrame we will use the inferred schema to determine the generated secondary columns:


```java
private List<String> getSecondaryColumns(Dataset<Row> df) {
    return stream(df.schema().fieldNames())
        .filter(f -> !rowGroups.contains(f)) // filter out group fields
        .collect(toList());
}
```

These will need to be returned to the grid in the following property:

```java
List<String> secondaryColumnFields;
```

Our client code will then use these secondary column fields to generate the corresponding `ColDefs` like so:


```js
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
```

In order for the grid to show these newly created columns an explicit API call is required:


```js
gridOptions.columnApi.setSecondaryColumns(secondaryColDefs);
```

## Aggregation

Aggregations are performed using `RelationalGroupedDataset.agg()` as shown below:


```java
// src/main/java/com/ag/grid/enterprise/spark/demo/dao/OlympicMedalDao.java

private Dataset<Row> agg(RelationalGroupedDataset groupedDf) {
    if (valueColumns.isEmpty()) return groupedDf.count();

    Column[] aggCols = valueColumns
        .stream()
        .map(ColumnVO::getField)
        .map(field -> sum(field).alias(field))
        .toArray(Column[]::new);

    return groupedDf.agg(aggCols[0], copyOfRange(aggCols, 1, aggCols.length));
}
```

Note that our example only requires the `sum()` aggregation function.


## Sorting

The `ServerSideGetRowsRequest` contains the following attribute to determine which columns to sort by:


```java
private List<SortModel> sortModel;
```

The `SortModel` contains the `colId` (i.e. 'athlete') and the `sort` type (i.e. 'asc')

```java
// src/main/java/com/ag/grid/enterprise/spark/demo/request/SortModel.java

public class SortModel implements Serializable {
    private String colId;
    private String sort;
    ...
}
```

The `Dataset.orderBy()` function accepts an array of Spark `Column` objects that specify the sort order as shown below:


```java
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

private Dataset<Row> orderBy(Dataset<Row> df) {
    Stream<String> groupCols = rowGroups.stream()
        .limit(groupKeys.size() + 1);

    Stream<String> valCols = valueColumns.stream()
        .map(ColumnVO::getField);

    List<String> allCols = concat(groupCols, valCols).collect(toList());

    Column[] cols = sortModel.stream()
        .map(model -> Pair.of(model.getColId(), model.getSort().equals("asc")))
        .filter(p -> !isGrouping || allCols.contains(p.getKey()))
        .map(p -> p.getValue() ? col(p.getKey()).asc() : col(p.getKey()).desc())
        .toArray(Column[]::new);

    return df.orderBy(cols);
}
```

## Infinite Scrolling

The `ServerSideGetRowsRequest` contains the following attributes to determine the range to return:


```java
private int startRow, endRow;
```

The `OlympicMedalsService` uses this information when limiting the results.


As Spark SQL doesn't provide `LIMIT OFFSET` capabilities like most SQL databases, we will need to do a bit of work in order to efficiently limit the results whilst ensuring we don't exceed local memory.


The strategy used in the code below is to convert the supplied Data Frame into a Resilient Distributed Dataset (RDD) in order to introduce a row index using `zipWithIndex()`. The row index can then be used to filter the rows according to the requested range.


```java
// src/main/java/com/ag/grid/enterprise/spark/demo/service/OlympicMedalsService.java

private DataResult paginate(Dataset<Row> df, int startRow, int endRow) {
    // save schema to recreate data frame
    StructType schema = df.schema();

    // obtain row count
    long rowCount = df.count();

    // convert data frame to RDD and introduce a row index so we can filter results by range
    JavaPairRDD<Row, Long> zippedRows = df.toJavaRDD().zipWithIndex();

    // filter rows by row index for the requested range (startRow, endRow)
    JavaRDD<Row> filteredRdd =
        zippedRows.filter(pair -> pair._2 >= startRow && pair._2 <= endRow)
                  .map(pair -> pair._1);

    // collect paginated results into a list of json objects
    List<String> paginatedResults = sparkSession.sqlContext()
        .createDataFrame(filteredRdd, schema)
        .toJSON()
        .collectAsList();

    // calculate last row
    long lastRow = endRow >= rowCount ? rowCount : -1;

    return new DataResult(paginatedResults, lastRow, getSecondaryColumns(df));
}
```

The RDD is then converted back into a Data Frame using the original schema previously stored. Once the rows have been filtered we can then safely collect the reduced results as a list of JSON objects. This ensures we don't run out of memory by bringing back all the results.

Finally we determine the `lastRow` and retrieve the secondary columns which contain will be required by the client code to generate `ColDefs` when in pivot mode.

## Conclusion

In this guide we presented a reference implementation for integrating the Server-Side Row Model with a Java service connected to Apache Spark. This included all necessary configuration and install instructions.

A high level overview was given to illustrate how the distributed DataFrame is transformed in the example application before providing details of how to achieve the following server-side operations:

- Filtering
- Grouping
- Pivoting
- Aggregation
- Sorting
- Infinite Scrolling
