<?php

require('constants.php');

if (! is_numeric($_POST[KEY_SYS]) OR ! is_numeric($_POST[KEY_DIA]) OR ! is_numeric($_POST[KEY_PULSE])) {
    header('Location: index.php');
    exit;
}

$log_entry = implode(',', [$_POST[KEY_DATETIME], $_POST[KEY_SYS], $_POST[KEY_DIA], $_POST[KEY_PULSE]]);

file_put_contents(STORAGE_FILEPATH, "$log_entry\n", FILE_APPEND | LOCK_EX);

header('Location: index.php');
exit;
