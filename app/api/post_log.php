<?php

require_once('../config.php');
require_once('authenticate.php');

if (! is_numeric($_POST[KEY_SYS]) || ! is_numeric($_POST[KEY_DIA]) || ! is_numeric($_POST[KEY_PULSE])) {
    header('HTTP/1.1 400 Bad Request');
    exit;
}

$log_entry = implode(',', [$_POST[KEY_DATETIME], $_POST[KEY_SYS], $_POST[KEY_DIA], $_POST[KEY_PULSE]]);

file_put_contents(STORAGE_FILEPATH, "$log_entry\n", FILE_APPEND | LOCK_EX);
