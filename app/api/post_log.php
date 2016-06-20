<?php

require_once('../config.php');
require_once('authenticate.php');

$redirect_path = '../';

if (! is_numeric($_POST[KEY_SYS]) OR ! is_numeric($_POST[KEY_DIA]) OR ! is_numeric($_POST[KEY_PULSE])) {
    header("Location: $redirect_path");
    exit;
}

$log_entry = implode(',', [$_POST[KEY_DATETIME], $_POST[KEY_SYS], $_POST[KEY_DIA], $_POST[KEY_PULSE]]);

file_put_contents(STORAGE_FILEPATH, "$log_entry\n", FILE_APPEND | LOCK_EX);

header("Location: $redirect_path");
exit;
