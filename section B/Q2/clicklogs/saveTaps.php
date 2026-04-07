<?php

header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$sessionId = '';
$devicePlatform = '';
$taps = null;

$jsonBody = $raw !== '' ? json_decode($raw, true) : null;
if (is_array($jsonBody) && isset($jsonBody['taps']) && is_array($jsonBody['taps'])) {
    $sessionId = trim((string) ($jsonBody['sessionId'] ?? ''));
    $devicePlatform = trim((string) ($jsonBody['devicePlatform'] ?? ''));
    $taps = $jsonBody['taps'];
} else {
    $sessionId = isset($_POST['id']) ? trim((string) $_POST['id']) : '';
    $devicePlatform = isset($_POST['var']) ? trim((string) $_POST['var']) : '';
    $tapsRaw = isset($_POST['taps']) ? (string) $_POST['taps'] : '';
    if ($tapsRaw !== '') {
        $taps = json_decode($tapsRaw, true);
    }
}

if (!is_array($taps)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing or invalid taps array']);
    exit;
}

if ($sessionId === '' && !empty($taps[0]['sessionId'])) {
    $sessionId = trim((string) $taps[0]['sessionId']);
}
if ($devicePlatform === '' && !empty($taps[0]['devicePlatform'])) {
    $devicePlatform = trim((string) $taps[0]['devicePlatform']);
}

if ($sessionId === '' || $devicePlatform === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Missing sessionId or devicePlatform (top-level or on each tap)']);
    exit;
}

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'Cannot create data directory']);
        exit;
    }
}

$logFile = $dataDir . DIRECTORY_SEPARATOR . 'taps.jsonl';
$fp = fopen($logFile, 'ab');
if ($fp === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Cannot open log file']);
    exit;
}

$written = 0;
foreach ($taps as $tap) {
    if (!is_array($tap)) {
        continue;
    }

    $seq = isset($tap['tapSequenceNumber']) ? (int) $tap['tapSequenceNumber'] : null;
    $start = isset($tap['startTimestamp']) ? (int) $tap['startTimestamp'] : null;
    $end = isset($tap['endTimestamp']) ? (int) $tap['endTimestamp'] : null;
    $interfaceType = isset($tap['interfaceType']) && $tap['interfaceType'] !== ''
        ? (string) $tap['interfaceType']
        : '';
    $ifaceSeq = isset($tap['interfaceSequence']) ? (int) $tap['interfaceSequence'] : null;

    if ($seq === null || $start === null || $end === null || $interfaceType === '') {
        continue;
    }

    $durationMs = isset($tap['durationMs']) ? (int) $tap['durationMs'] : max(0, $end - $start);

    $record = [
        'sessionId' => $sessionId,
        'devicePlatform' => $devicePlatform,
        'tapSequenceNumber' => $seq,
        'startTimestamp' => $start,
        'endTimestamp' => $end,
        'durationMs' => $durationMs,
        'interfaceType' => $interfaceType,
        'interfaceSequence' => $ifaceSeq,
        'receivedAt' => (int) round(microtime(true) * 1000),
    ];

    $line = json_encode($record, JSON_UNESCAPED_UNICODE) . "\n";
    if (fwrite($fp, $line) !== false) {
        $written++;
    }
}

fclose($fp);

if ($written === 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'No valid tap records to save']);
    exit;
}

echo json_encode(['ok' => true, 'written' => $written]);
