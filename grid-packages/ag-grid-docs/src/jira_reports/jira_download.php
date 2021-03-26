<?php
ini_set('memory_limit', '1024M');
error_reporting(E_ERROR | E_PARSE);

date_default_timezone_set('Europe/London');

const INDEFINITE_LIFETIME=-1;

const JIRA_ENDPOINT = 'https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=';
const PIPELINE_SECTIONS = array(
    'current_release' => JIRA_ENDPOINT . '11730+order+by+priority+DESC+%2C+status+ASC',
    'bugs' => JIRA_ENDPOINT . '11721+ORDER+BY+cf[10515]+ASC+%2C+priority+DESC',
    'feature_requests' => JIRA_ENDPOINT . '11723+ORDER+BY+cf[10515]+ASC+%2C+priority+DESC',
    'issue_by_epic' => JIRA_ENDPOINT . '11726+order+by+cf%5B10005%5D+desc+%2C+priority+desc',
    'epic_by_priority' => JIRA_ENDPOINT . '11727+order+by+cf[10005]+asc+%2C+priority+desc',
    'parked' => JIRA_ENDPOINT . '11732',
    'changelog' => JIRA_ENDPOINT . '11743+order+by+fixversion+desc',
    'kanban' => JIRA_ENDPOINT . '11716+order+by+fixversion+desc'
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

function jiraRequest($report_type, $startAt, $maxResults, $jira_config)
{
    // favour credentials file if it exists - only applicable when deployed
    $prod_file = dirname(__FILE__) . "/prod/credentials.json";
    if (file_exists($prod_file)) {
        // live
        $credentials = json_decode(file_get_contents($prod_file));
        $username = $credentials->{'username'};
        $password = $credentials->{'password'};
    } else die();

    $data = remoteJiraRequest($report_type, $startAt, $maxResults, $username, $password);

    return $data;
}

function getCacheLifetimeMinutes($report_type, $jira_config)
{
    $cache_lifetime_minutes = $jira_config->{"cache-lifetime-minutes"};
    if(isset($jira_config->{"overrides"}->{$report_type}) && isset($jira_config->{"overrides"}->{$report_type}->{"cache-lifetime-minutes"}))
    {
        $cache_lifetime_minutes = $jira_config->{"overrides"}->{$report_type}->{"cache-lifetime-minutes"};
    }

    return $cache_lifetime_minutes;
}

function getCacheFile($report_type)
{
    // /jira_reports/cache
    return dirname(__FILE__) . "/cache/" . $report_type . '.json';
}

function updateCache($report_type, $data)
{
    file_put_contents(getCacheFile($report_type), $data, LOCK_EX);
}

// retrieve the jira data from atlassian (ie live data) and save it
function updateJiraReportData($report_type)
{
    $jira_config = json_decode(file_get_contents(dirname(__FILE__) . "/jira_config.json"));

    $maxResults = 100;

    $dataAsJson = getLiveJiraFilterData($report_type, $maxResults, $jira_config);

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

        for ($x = 0; $x <= count($currentPageData['issues']); $x++) {
            array_push($tempArray['issues'], $currentPageData['issues'][$x]);
        }
    }

    $dataAsJson = json_encode($tempArray);
    return $dataAsJson;
}

$file = dirname(__FILE__) . "/cache/" . 'changelog2.json';
$json_decoded = json_decode(file_get_contents($file));

$issues = array();
foreach($json_decoded->issues as $issue) {
    $entry = array('key' => $issue->key);
    $entry += array('fixVersion' => $issue->{'fields'}->{'fixVersions'}[0]->{'name'});
    $entry += array('summary' => $issue->{'fields'}->{'summary'});
    $entry += array('moreInfoContent' => $issue->{'fields'}->{'customfield_10522'});
    $entry += array('deprecationNotes' => $issue->{'fields'}->{'customfield_10520'});
    $entry += array('breakingChangesNotes' => $issue->{'fields'}->{'customfield_10521'});

    array_push($issues, $entry);
}

updateCache('changelog', json_encode($issues));
?>
