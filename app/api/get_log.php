<?php

require('../config.php');

header('Content-Type: application/json');

$log_rows = array_map('str_getcsv', explode("\n", trim(file_get_contents(STORAGE_FILEPATH))));

if ($log_rows[0][0] === NULL) {
    echo json_encode(array());
    exit;
}

$log_rows_size = sizeof($log_rows);
$result = array();
for ($i = 0; $i < $log_rows_size; $i++) {
    $result[$i][KEY_DATETIME] =    $log_rows[$i][0];
    $result[$i][KEY_SYS] =   (int) $log_rows[$i][1];
    $result[$i][KEY_DIA] =   (int) $log_rows[$i][2];
    $result[$i][KEY_PULSE] = (int) $log_rows[$i][3];
}

echo json_encode($result);
