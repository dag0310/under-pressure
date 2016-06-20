<?php

require_once('../config.php');

function unauthorized() {
    header('WWW-Authenticate: Basic realm="' . APP_NAME . '"');
    header('HTTP/1.0 401 Unauthorized');
    die ('Unauthorized');
}

if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
    list($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']) = explode(':', base64_decode(substr($_SERVER['HTTP_AUTHORIZATION'], 6)));
}

if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
    unauthorized();
}

$user = trim(strtolower($_SERVER['PHP_AUTH_USER']));
$password = $_SERVER['PHP_AUTH_PW'];

$users_filepath = STORAGE_PATH . 'users.json';
$users = json_decode(file_get_contents($users_filepath), true);
$valid_users = array_keys($users);

$user_exists = (in_array($user, $valid_users));

if (!$user_exists && strlen($user) > 0 && strlen($password) >= 6) {
    $users[$user] = password_hash($password, PASSWORD_BCRYPT);
    file_put_contents($users_filepath, json_encode($users), LOCK_EX);
}

$validated = $user_exists && password_verify($password, $users[$user]);

if (!$validated) {
    unauthorized();
}

define('STORAGE_FILEPATH', STORAGE_PATH . "users/$user.csv");
