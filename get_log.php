<?php
header('Content-Type: application/json');

$rows = array_map('str_getcsv', explode("\n", trim(file_get_contents('log.csv'))));

if ($rows[0][0] === NULL) {
    echo json_encode(array());
    exit;
}

for ($i = 0; $i < sizeof($rows); $i++) {
    $rows[$i][1] = (int) $rows[$i][1];
    $rows[$i][2] = (int) $rows[$i][2];
    $rows[$i][3] = (int) $rows[$i][3];
}
echo json_encode($rows);
