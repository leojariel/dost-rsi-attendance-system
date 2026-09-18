<?php

declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

$privateConfigPath = __DIR__ . '/config_orig.php';
if (!is_file($privateConfigPath)) {
 throw new RuntimeException(
  'Missing private configuration. Copy config_orig.example.php to config_orig.php and set the real credentials.'
 );
}

$privateConfig = require $privateConfigPath;
if (!is_array($privateConfig)) {
 throw new RuntimeException('Private configuration must return an array.');
}

$requiredConfig = [
 'db_host',
 'db_name',
 'db_user',
 'db_pass',
 'smtp_host',
 'smtp_port',
 'smtp_user',
 'smtp_pass',
 'mail_from',
 'mail_from_name',
 'public_base',
];

foreach ($requiredConfig as $configKey) {
 if (!array_key_exists($configKey, $privateConfig)) {
  throw new RuntimeException('Missing private configuration value: ' . $configKey);
 }
}

define('DB_HOST', (string)$privateConfig['db_host']);
define('DB_NAME', (string)$privateConfig['db_name']);
define('DB_USER', (string)$privateConfig['db_user']);
define('DB_PASS', (string)$privateConfig['db_pass']);

define('SMTP_HOST', (string)$privateConfig['smtp_host']);
define('SMTP_PORT', (int)$privateConfig['smtp_port']);
define('SMTP_USER', (string)$privateConfig['smtp_user']);
define('SMTP_PASS', (string)$privateConfig['smtp_pass']);
define('MAIL_FROM', (string)$privateConfig['mail_from']);
define('MAIL_FROM_NAME', (string)$privateConfig['mail_from_name']);

const SIGNATURE_DIR = __DIR__ . '/../storage/signatures';
const QR_DIR        = __DIR__ . '/../storage/qr';
define('PUBLIC_BASE', (string)$privateConfig['public_base']);

function db(): PDO
{
 static $pdo = null;
 if ($pdo === null) {
  $pdo = new PDO(
   'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
   DB_USER,
   DB_PASS,
   [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
   ]
  );
 }
 return $pdo;
}

function json_out(array $data, int $code = 200): void
{
 http_response_code($code);
 header('Content-Type: application/json; charset=utf-8');
 echo json_encode($data);
 exit;
}

function json_in(): array
{
 $raw = file_get_contents('php://input');
 $data = json_decode($raw, true);
 return is_array($data) ? $data : [];
}

function uuid_v4(): string
{
 $d = random_bytes(16);
 $d[6] = chr(ord($d[6]) & 0x0f | 0x40);
 $d[8] = chr(ord($d[8]) & 0x3f | 0x80);
 return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($d), 4));
}

function token_hex(int $bytes = 32): string
{
 return bin2hex(random_bytes($bytes));
}
