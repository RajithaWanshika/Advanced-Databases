<?php

header('Content-Type: application/javascript; charset=UTF-8');

function tap_log_load_env(string $path): array
{
    $out = [];
    if (!is_readable($path)) {
        return $out;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return $out;
    }
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') {
            continue;
        }
        $eq = strpos($line, '=');
        if ($eq === false) {
            continue;
        }
        $k = trim(substr($line, 0, $eq));
        $v = trim(substr($line, $eq + 1));
        $len = strlen($v);
        if ($len >= 2) {
            $q0 = $v[0];
            $q1 = $v[$len - 1];
            if (($q0 === '"' && $q1 === '"') || ($q0 === "'" && $q1 === "'")) {
                $v = substr($v, 1, -1);
            }
        }
        $out[$k] = $v;
    }
    return $out;
}

$env = tap_log_load_env(__DIR__ . DIRECTORY_SEPARATOR . '.env');
$config = [
    'apiKey' => $env['FIREBASE_API_KEY'] ?? '',
    'authDomain' => $env['FIREBASE_AUTH_DOMAIN'] ?? '',
    'projectId' => $env['FIREBASE_PROJECT_ID'] ?? '',
    'storageBucket' => $env['FIREBASE_STORAGE_BUCKET'] ?? '',
    'messagingSenderId' => $env['FIREBASE_MESSAGING_SENDER_ID'] ?? '',
    'appId' => $env['FIREBASE_APP_ID'] ?? '',
    'measurementId' => $env['FIREBASE_MEASUREMENT_ID'] ?? '',
];

echo 'window.FIREBASE_TAP_LOG_CONFIG = ' . json_encode($config, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . ';';
