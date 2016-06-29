<?php

require_once('../config.php');
require_once('authenticate.php');

if (! isset($_POST[KEY_DATETIME]) || ! is_string($_POST[KEY_DATETIME])) {
    header('HTTP/1.1 400 Bad Request');
    exit;
}

$log_data = file_get_contents(STORAGE_FILEPATH);

$lines = explode("\n", $log_data);
$new_lines = array();
foreach ($lines as $line) {
    if (strpos($line, $_POST[KEY_DATETIME]) !== FALSE) {
        continue;
    }
    $new_lines[] = $line;
}
$log_data_new = implode("\n", $new_lines);

file_put_contents(STORAGE_FILEPATH, $log_data_new, LOCK_EX);
