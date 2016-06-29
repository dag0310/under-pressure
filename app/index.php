<!doctype html>
<?php require_once('config.php'); ?>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    <title><?=APP_NAME?></title>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <!-- Icon -->
    <link rel="apple-touch-icon" sizes="57x57" href="images/icon/apple-touch-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="images/icon/apple-touch-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="images/icon/apple-touch-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="images/icon/apple-touch-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="images/icon/apple-touch-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="images/icon/apple-touch-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="images/icon/apple-touch-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="images/icon/apple-touch-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="images/icon/apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" href="images/icon/favicon-32x32.png" sizes="32x32">
    <link rel="icon" type="image/png" href="images/icon/favicon-194x194.png" sizes="194x194">
    <link rel="icon" type="image/png" href="images/icon/favicon-96x96.png" sizes="96x96">
    <link rel="icon" type="image/png" href="images/icon/android-chrome-192x192.png" sizes="192x192">
    <link rel="icon" type="image/png" href="images/icon/favicon-16x16.png" sizes="16x16">
    <link rel="manifest" href="images/icon/manifest.json">
    <link rel="shortcut icon" href="images/icon/favicon.ico">
    <meta name="apple-mobile-web-app-title" content="<?=APP_NAME?>">
    <meta name="application-name" content="<?=APP_NAME?>">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="images/icon/mstile-144x144.png">
    <meta name="msapplication-config" content="images/icon/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">

    <!-- Stylesheets -->
    <link rel="stylesheet" href="vendor/jquery-toast-plugin/jquery.toast.min.css">
    <link rel="stylesheet" href="vendor/morris/morris.css">
    <link rel="stylesheet" href="vendor/addtohomescreen/addtohomescreen.css">
    <link rel="stylesheet" href="css/main.css">
</head>
<body>
    <div id="chart"></div>

    <form id="log" method="post" action="<?=API_ENDPOINTS_POSTLOG?>">
        <input type="number" name="<?=KEY_SYS?>" placeholder="SYS">
        <input type="number" name="<?=KEY_DIA?>" placeholder="DIA">
        <input type="number" name="<?=KEY_PULSE?>" placeholder="Pulse">
        <br>
        <button type="submit">Log</button>
    </form>

    <div id="table" class="section"></div>

    <div id="user" class="section">
        <form id="logged-in-panel">
            <h1>User area</h1>
            Logged in user: <span class="username"></span>
            <br><br>
            <button type="submit">Logout</button>
        </form>
        <form id="logged-out-panel">
            <h1><?=APP_NAME?></h1>
            <input type="text" name="username" placeholder="Username">
            <br>
            <input type="password" name="password" placeholder="Password">
            <br>
            <button type="submit">Login / Register</button>
        </form>
    </div>

    <!-- Scripts -->
    <script src="vendor/jquery.min.js"></script>
    <script src="vendor/jquery-toast-plugin/jquery.toast.min.js"></script>
    <script src="vendor/raphael-min.js"></script>
    <script src="vendor/morris/morris.min.js"></script>
    <script src="vendor/addtohomescreen/addtohomescreen.min.js"></script>
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
                        postLog: '<?=API_ENDPOINTS_POSTLOG?>'
                    }
                }
            };
            Main.init(CONFIG);
            addToHomescreen();
        });
    </script>
</body>
</html>
