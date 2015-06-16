<?php
if (! is_numeric($_POST['sys']) OR ! is_numeric($_POST['dia']) OR ! is_numeric($_POST['pulse'])) {
    header('Location: index.php');
    exit;
}

$log_entry = implode(',', [date('Y-m-d H:i:s'), $_POST['sys'], $_POST['dia'], $_POST['pulse']]);

file_put_contents('log.csv', "$log_entry\n", FILE_APPEND | LOCK_EX);

header('Location: index.php');
exit;