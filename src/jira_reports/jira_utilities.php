<?php
date_default_timezone_set('Europe/London');

const JIRA_ENDPOINT = 'https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=';
const PIPELINE_SECTIONS = array(
    'current_release' => JIRA_ENDPOINT . '11730+order+by+priority+DESC+%2C+status+ASC',
    'bugs' => JIRA_ENDPOINT . '11721+ORDER+BY+cf[10515]+ASC+%2C+priority+DESC',
    'feature_requests' => JIRA_ENDPOINT . '11723+ORDER+BY+cf[10515]+ASC+%2C+priority+DESC',
    'issue_by_epic' => JIRA_ENDPOINT . '11726+order+by+cf%5B10005%5D+desc+%2C+priority+desc',
    'epic_by_priority' => JIRA_ENDPOINT . '11727+order+by+cf[10005]+asc+%2C+priority+desc',
    'parked' => JIRA_ENDPOINT . '11732'
);

function remoteJiraRequest($report_type, $startAt, $maxResults, $username, $password)
{
    $jiraFilterUrl = PIPELINE_SECTIONS[$report_type];

    $url = $jiraFilterUrl . '&startAt=' . $startAt . '&maxResults=' . $maxResults;
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_USERPWD, "$username:$password");
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($curl, CURLOPT_FOLLOWLOCATION, 1);
    curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 0);
    return (curl_exec($curl));
}

function localJiraRequest($report_type)
{
    $file = "../mock_jira_data/" . $report_type . ".json";
    $handle = fopen($file, 'r') or die('Cannot open file:  ' . $file);
    $data = fread($handle, filesize($file));
    fclose($handle);

    return $data;
}

function jiraRequest($report_type, $startAt, $maxResults, $jira_config)
{
    if ($jira_config->{'local-dev'}) {
        return localJiraRequest($report_type);
    } else {
        // favour credentials file if it exists - only applicable when deployed
        $prod_file = dirname(__FILE__) . "/prod/credentials.json";
        if (file_exists($prod_file)) {
            // live
            $credentials = json_decode(file_get_contents($prod_file));
            $username = $credentials->{'username'};
            $password = $credentials->{'password'};
        } else {
            // for testing live jira data locally
            $username = $jira_config->{'username'};
            $password = $jira_config->{'password'};
        }

        $data = remoteJiraRequest($report_type, $startAt, $maxResults, $username, $password);

        return $data;
    }
}

/**
 * @param $report_type
 * @param $data
 */
function updateLocalData($report_type, $data)
{
    $file = "../mock_jira_data/" . $report_type . ".json";
    $handle = fopen($file, 'w') or die('Cannot open file:  ' . $file);
    fwrite($handle, $data);
    fclose($handle);
}

function getCacheFile($report_type)
{
    // /jira_reports/cache
    return dirname(__FILE__) . "/cache/" . $report_type . '.json';
}

function cacheEntryValid($report_type, $jira_config)
{
    clearstatcache();

    $cache_file = getCacheFile($report_type);
    $cache_lifetime_minutes = $jira_config->{"cache-lifetime-minutes"};
    return file_exists($cache_file) && (filemtime($cache_file) > (time() - 60 * $cache_lifetime_minutes));
}

function getFromCache($report_type)
{
    return file_get_contents(getCacheFile($report_type));
}

function updateCache($report_type, $data)
{
    file_put_contents(getCacheFile($report_type), $data, LOCK_EX);
}

// retrieve the jira data - depending on config and cache state this can come from:
// 1: local file storage (for local dev)
// 2: cache file (live data, but up to ( $jira_config->{"cache-lifetime-minutes"} ) mins old)
// 3: from atlassian (ie live data)
function retrieveJiraFilterData($report_type)
{
    $jira_config = json_decode(file_get_contents(dirname(__FILE__) . "/jira_config.json"));

    $maxResults = 100;

    if ($jira_config->{'local-dev'}) {
        // initial query gets the first "page" of data, as well as the total number of issues to retrieve
        $issue_list = jiraRequest($report_type, 0, $maxResults, $jira_config);
        $tempArray = json_decode($issue_list, true);

        $dataAsJson = json_encode($tempArray);
        if ($jira_config->{'update-mock-data'}) {
            updateLocalData($report_type, $dataAsJson);
        }
    } else {
        // cache valid? retrieve from cache
        if(cacheEntryValid($report_type, $jira_config)) {
            $dataAsJson = getFromCache($report_type);
        } else {
            // other get live data and update cache for next time
            $dataAsJson = getLiveJiraFilterData($report_type, $maxResults, $jira_config);
            updateCache($report_type, $dataAsJson);
        }
    }

    // convert back to regular object (mainly in order to be able to use existing jira_report.php)
    return json_decode($dataAsJson);
}

// live data - from atlassian servers
function getLiveJiraFilterData($report_type, $maxResults, $jira_config)
{
    // initial query gets the first "page" of data, as well as the total number of issues to retrieve
    $issue_list = jiraRequest($report_type, 0, $maxResults, $jira_config);
    $tempArray = json_decode($issue_list, true);

    // this block iterates over the number of "pages" to retrieve, maxResults at a time
    // note: although maxResults is a variable here, Jira actually sets a max of a hundred, so
    // don't try increase this value for performance reasons - it'll just be ignored
    $pages = ceil($tempArray['total'] / 100);
    for ($page = 1; $page < $pages; $page++) {
        $issue_list = jiraRequest($report_type, ($maxResults * $page), $maxResults, $jira_config);
        $currentPageData = json_decode($issue_list, true);

        for ($x = 0; $x <= count($currentPageData); $x++) {
            array_push($tempArray['issues'], $currentPageData['issues'][$x]);
        }
    }

    $dataAsJson = json_encode($tempArray);
    return $dataAsJson;
}

function mapIssueType($issueType)
{
    switch ($issueType) {
        case "Task":
            return "Feature Request";
            break;
    }
    return $issueType;
}

function mapPriority($priority)
{
    $result = "2 - 4 Releases";
    switch ($priority) {
        case "Highest":
        case "High":
            $result = "1 - 2 Releases";
            break;
        case "Medium":
            $result = "1 - 3 Releases";
            break;
    }

    return $result;
}

function toDate($str_value)
{
    $date = new DateTime($str_value, new DateTimeZone('GMT'));
    return $date->format('j M Y');
}

function classForStatusAndResolution($status, $resolution)
{
    $class = "aui-lozenge-success";
    switch ($status) {
        case "In Progress":
            $class = "aui-lozenge-current";
            break;
        case "Backlog":
            $class = "aui-lozenge-complete";
            break;
        case "Done":
            $class = $resolution == 'Done' ? $class : "aui-lozenge-error";
    }

    return $class;
}

function getStatusForStatusAndResolution($status, $resolution)
{
    $result = $status;
    switch ($status) {
        case "Done":
            $result = $resolution == 'Done' ? $result : $resolution;
    }

    return $result;
}

function getValueForTargetEta($sprintEta, $nextSprint)
{
    return "+" . ($sprintEta - $nextSprint + 1);
}

?>