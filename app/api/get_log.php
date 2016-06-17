<?php

require('../config.php');

header('Content-Type: application/json');

$log_rows = array_map('str_getcsv', explode("\n", trim(file_get_contents(STORAGE_FILEPATH))));

if ($log_rows[0][0] === NULL) {
    echo json_encode(array());
    exit;
}

$num_log_rows = sizeof($log_rows);
$entries = array();
for ($i = 0; $i < $num_log_rows; $i++) {
    $entries[$i][KEY_DATETIME] =    $log_rows[$i][0];
    $entries[$i][KEY_SYS] =   (int) $log_rows[$i][1];
    $entries[$i][KEY_DIA] =   (int) $log_rows[$i][2];
    $entries[$i][KEY_PULSE] = (int) $log_rows[$i][3];
}

$num_last_recorded_days = 21;

$last_index = sizeof($entries) - 1;
$last_recorded_entry = $entries[$last_index];
$last_recorded_entry_date_str = explode(' ', $last_recorded_entry[KEY_DATETIME])[0];
$last_recorded_entry_date = date_create($last_recorded_entry_date_str);
$first_valid_entry_date = $last_recorded_entry_date;
$num_days_to_subtract = $num_last_recorded_days - 1;
date_sub($first_valid_entry_date, date_interval_create_from_date_string("$num_days_to_subtract days"));

$i = $last_index;
$filtered_entries_reversed = array();

while ($i >= 0 && date_create($entries[$i][KEY_DATETIME]) >= $first_valid_entry_date) {
    array_push($filtered_entries_reversed, $entries[$i]);
    $i--;
}
$filtered_entries = array_reverse($filtered_entries_reversed);

echo json_encode($filtered_entries);
