<?php
/**
 * Spotify Client Credentials Token Proxy
 * ---------------------------------------
 * Keeps SPOTIFY_CLIENT_SECRET server-side so it is never exposed
 * to the browser. The React app calls this endpoint on load to get
 * an app-level access token — no user login required.
 *
 * Fill in your credentials below, then upload this file to Hostinger.
 * They live only on the server; the built JS bundle never contains them.
 */

define('SPOTIFY_CLIENT_ID',     'YOUR_CLIENT_ID_HERE');
define('SPOTIFY_CLIENT_SECRET', 'YOUR_CLIENT_SECRET_HERE');

// ── CORS ──────────────────────────────────────────────────────────────────────
// Allow your live domain + local dev origin.
$allowed = [
    'https://golden-hour.enriquesolis.me',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: $origin");
}
header('Content-Type: application/json');

// ── Fetch token from Spotify ───────────────────────────────────────────────────
$credentials = base64_encode(SPOTIFY_CLIENT_ID . ':' . SPOTIFY_CLIENT_SECRET);

$context = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => implode("\r\n", [
            "Authorization: Basic $credentials",
            'Content-Type: application/x-www-form-urlencoded',
        ]),
        'content' => 'grant_type=client_credentials',
        'ignore_errors' => true,
    ],
]);

$raw = file_get_contents('https://accounts.spotify.com/api/token', false, $context);

if ($raw === false) {
    http_response_code(502);
    echo json_encode(['error' => 'Could not reach Spotify']);
    exit;
}

$data = json_decode($raw, true);

if (empty($data['access_token'])) {
    http_response_code(500);
    echo json_encode(['error' => $data['error'] ?? 'No token returned']);
    exit;
}

// Return only what the client needs — never forward the full Spotify response
echo json_encode(['access_token' => $data['access_token']]);
