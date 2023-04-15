<!doctype html>
<?php
require_once('config.php');

$supported_locales = array('en', 'de');
$locale = strtolower(substr($_SERVER['HTTP_ACCEPT_LANGUAGE'], 0, 2));
if (! in_array($locale, $supported_locales, true)) {
    $locale = $supported_locales[0];
}
$translations_raw = json_decode(file_get_contents('translations.json'), true);
$translations = array();
foreach ($translations_raw as $key => $value) {
    $translations[$key] = $value[$locale];
}
?>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <title><?=APP_NAME?></title>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <!-- Icon -->
    <link rel="apple-touch-icon" sizes="57x57" href="images/icon/apple-touch-icon-57x57.png?v=2">
    <link rel="apple-touch-icon" sizes="60x60" href="images/icon/apple-touch-icon-60x60.png?v=2">
    <link rel="apple-touch-icon" sizes="72x72" href="images/icon/apple-touch-icon-72x72.png?v=2">
    <link rel="apple-touch-icon" sizes="76x76" href="images/icon/apple-touch-icon-76x76.png?v=2">
    <link rel="apple-touch-icon" sizes="114x114" href="images/icon/apple-touch-icon-114x114.png?v=2">
    <link rel="apple-touch-icon" sizes="120x120" href="images/icon/apple-touch-icon-120x120.png?v=2">
    <link rel="apple-touch-icon" sizes="144x144" href="images/icon/apple-touch-icon-144x144.png?v=2">
    <link rel="apple-touch-icon" sizes="152x152" href="images/icon/apple-touch-icon-152x152.png?v=2">
    <link rel="apple-touch-icon" sizes="180x180" href="images/icon/apple-touch-icon-180x180.png?v=2">
    <link rel="icon" type="image/png" href="images/icon/favicon-32x32.png?v=2" sizes="32x32">
    <link rel="icon" type="image/png" href="images/icon/favicon-194x194.png?v=2" sizes="194x194">
    <link rel="icon" type="image/png" href="images/icon/favicon-96x96.png?v=2" sizes="96x96">
    <link rel="icon" type="image/png" href="images/icon/android-chrome-192x192.png?v=2" sizes="192x192">
    <link rel="icon" type="image/png" href="images/icon/favicon-16x16.png?v=2" sizes="16x16">
    <link rel="manifest" href="images/icon/manifest.json?v=2">
    <link rel="mask-icon" href="images/icon/safari-pinned-tab.svg?v=2" color="#5bbad5">
    <link rel="shortcut icon" href="images/icon/favicon.ico?v=2">
    <meta name="msapplication-TileColor" content="#da532c">
    <meta name="msapplication-TileImage" content="images/icon/mstile-144x144.png?v=2">
    <meta name="msapplication-config" content="images/icon/browserconfig.xml?v=2">
    <meta name="theme-color" content="#ffffff">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="vendor/jquery-toast-plugin/jquery.toast.min.css">
    <link rel="stylesheet" href="vendor/morris/morris.css">
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <div id="chart"></div>

    <form id="log" method="post" action="<?=API_ENDPOINTS_POSTLOG?>">
        <input type="number" name="<?=KEY_SYS?>" placeholder="<?=$translations['sys']?>">
        <input type="number" name="<?=KEY_DIA?>" placeholder="<?=$translations['dia']?>">
        <input type="number" name="<?=KEY_PULSE?>" placeholder="<?=$translations['pulse']?>">
        <br>
        <button type="submit"><?=$translations['log']?></button>
    </form>

    <div id="table" class="section"></div>

    <div id="user" class="section">
        <form id="logged-in-panel">
            <h1><?=$translations['user_area']?></h1>
            <?=$translations['logged_in']?>: <span class="username"></span>
            <br><br>
            <button type="submit"><?=$translations['log_out']?></button>
        </form>
        <form id="logged-out-panel">
            <h1><?=APP_NAME?></h1>
            <input type="text" name="username" placeholder="<?=$translations['username']?>">
            <br>
            <input type="password" name="password" placeholder="<?=$translations['password']?>">
            <br>
            <button type="submit"><?=$translations['log_in']?> / <?=$translations['register']?></button>
        </form>
    </div>

    <!-- Scripts -->
    <script src="vendor/jquery.min.js"></script>
    <script src="vendor/jquery-toast-plugin/jquery.toast.min.js"></script>
    <script src="vendor/raphael-min.js"></script>
    <script src="vendor/morris/morris.min.js"></script>
    <script src="vendor/fastclick-1.0.6.min.js"></script>
    <script src="js/helper.js"></script>
    <script src="js/main.js"></script>
    <script>
        $(function () {
            var CONFIG = {
                numShowLastRecordedDays: <?=NUM_SHOW_LAST_RECORDED_DAYS?>,
                keys: {
                    dateTime: '<?=KEY_DATETIME?>',
                    sys: '<?=KEY_SYS?>',
                    dia: '<?=KEY_DIA?>',
                    pulse: '<?=KEY_PULSE?>'
                },
                api: {
                    endPoints: {
                        getLog: '<?=API_ENDPOINTS_GETLOG?>',
                        postLog: '<?=API_ENDPOINTS_POSTLOG?>',
                        putLog: '<?=API_ENDPOINTS_PUTLOG?>',
                        deleteLog: '<?=API_ENDPOINTS_DELETELOG?>'
                    }
                }
            };
            var TRANSLATIONS = {<?php foreach ($translations as $key => $value) { echo "$key:'$value',"; } ?>};

            Main.init(CONFIG, TRANSLATIONS);
			FastClick.attach(document.body);
        });
    </script>
</body>
</html>
