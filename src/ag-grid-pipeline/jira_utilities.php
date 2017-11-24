<?php
date_default_timezone_set('Europe/London');

const JIRA_ENDPOINT = 'https://ag-grid.atlassian.net/rest/api/2/search?jql=filter=';
const PIPELINE_SECTIONS = array(
    'current_release' => JIRA_ENDPOINT . '11730+order+by+status+desc',
    'bugs' => JIRA_ENDPOINT . '11721+order+by+priority+desc',
    'feature_requests' => JIRA_ENDPOINT . '11723+order+by+priority+desc',
    'issue_by_epic' => JIRA_ENDPOINT . '11726+order+by+cf%5B10005%5D+desc+%2C+priority+desc',
    'epic_by_priority' => JIRA_ENDPOINT . '11727+order+by+cf[10005]+asc+%2C+priority+desc'
);

function jiraRequest($jiraFilterUrl, $startAt, $maxResults)
{
    $username = '';
    $password = '';

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

function retrieveJiraFilterData($jiraFilterUrl)
{
    $maxResults = 100;

    // initial query gets the first "page" of data, as well as the total number of issues to retrieve
    $issue_list = jiraRequest($jiraFilterUrl, 0, $maxResults);
    $tempArray = json_decode($issue_list, true);

    // this block iterates over the number of "pages" to retrieve, maxResults at a time
    // note: although maxResults is a variable here, Jira actually sets a max of a hundred, so
    // dont try increase this value for performance reasons - it'll just be ignored
    $pages = ceil($tempArray['total'] / 100);
    for ($page = 1; $page < $pages; $page++) {
        echo ($maxResults * $page) . '<- startAt<br/>';

        $issue_list = jiraRequest($jiraFilterUrl, ($maxResults * $page), $maxResults);
        $currentPageData = json_decode($issue_list, true);

        for ($x = 0; $x < count($currentPageData); $x++) {
            array_push($tempArray['issues'], $currentPageData['issues'][$x]);
        }
    }

    // convert back to regular object (mainly in order to be able to use existing jira_report.php)
    return json_decode(json_encode($tempArray));
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

function mapReporter($reporter)
{
    if ($reporter === "") {
        return "ag-Grid";
    }
    switch ($reporter) {
        case "Client Request (email, telephone, etc)":
            return "Enterprise Request";
            break;
    }
    return $reporter;
}

function mapStatus($status)
{
    if ($status === 'Selected for Development') {
        return 'Backlog';
    }
    return $status;
}

function toDate($str_value)
{
    $date = new DateTime($str_value, new DateTimeZone('GMT'));
    return $date->format('j M Y');
}

?>