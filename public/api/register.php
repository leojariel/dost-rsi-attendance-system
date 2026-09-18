<?php

declare(strict_types=1);
ob_start();
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
 json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$in = json_in();

// ── Whitelists (same as validate.php) ─────────────────────────
$GENDERS = ['male', 'female', 'other'];
$AGE_RANGES = ['1-14', '15-30', '31-59', '60+'];
$CLASSIFICATIONS = ['business', 'government', 'homemaker', 'media', 'others', 'private', 'student'];
$VISITOR_TYPES = ['exhibitor', 'organizer', 'participant', 'speaker', 'volunteer'];
$REGION_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];

$errors = [];

function field(array $in, string $key): string
{
 return trim((string)($in[$key] ?? ''));
}

// ── Re-validate all fields (never trust the frontend) ─────────
if (empty($in['privacyConsent'])) {
 $errors['privacyConsent'] = 'You must agree to the data privacy consent.';
}

$firstName  = field($in, 'firstName');
$middleName = field($in, 'middleName');
$lastName   = field($in, 'lastName');

if ($firstName === '') {
 $errors['firstName'] = 'First name is required.';
} elseif (mb_strlen($firstName) > 80 || !preg_match('/^[\p{L}\s.\'-]+$/u', $firstName)) {
 $errors['firstName'] = 'First name is invalid.';
}

if (mb_strlen($middleName) > 80) {
 $errors['middleName'] = 'Middle name is too long.';
}

if ($lastName === '') {
 $errors['lastName'] = 'Last name is required.';
} elseif (mb_strlen($lastName) > 80 || !preg_match('/^[\p{L}\s.\'-]+$/u', $lastName)) {
 $errors['lastName'] = 'Last name is invalid.';
}

$gender = field($in, 'gender');
if (!in_array($gender, $GENDERS, true)) {
 $errors['gender'] = 'Invalid gender selection.';
}

$ageRange = field($in, 'ageRange');
if (!in_array($ageRange, $AGE_RANGES, true)) {
 $errors['ageRange'] = 'Invalid age range.';
}

$classification = field($in, 'classification');
if (!in_array($classification, $CLASSIFICATIONS, true)) {
 $errors['classification'] = 'Invalid classification.';
}

$email = field($in, 'contactEmail');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 160) {
 $errors['contactEmail'] = 'Invalid email.';
}

$visitorType = field($in, 'visitorType');
if (!in_array($visitorType, $VISITOR_TYPES, true)) {
 $errors['visitorType'] = 'Invalid visitor type.';
}

$affiliation = field($in, 'affiliation');
if ($affiliation === '' || mb_strlen($affiliation) > 160) {
 $errors['affiliation'] = 'Invalid affiliation.';
}

$region = field($in, 'region');
if (!in_array($region, $REGION_IDS, true)) {
 $errors['region'] = 'Invalid region.';
}

// ── Signature validation ──────────────────────────────────────
$signature = (string)($in['signature'] ?? '');
$signatureBin = null;

if ($signature === '') {
 $errors['signature'] = 'Signature is required.';
} elseif (!preg_match('#^data:image/png;base64,#i', $signature)) {
 $errors['signature'] = 'Signature format is invalid.';
} else {
 $b64 = substr($signature, strpos($signature, ',') + 1);
 $signatureBin = base64_decode($b64, true);
 if ($signatureBin === false || strlen($signatureBin) < 500) {
  $errors['signature'] = 'Signature appears empty.';
 } elseif (strlen($signatureBin) > 2 * 1024 * 1024) {
  $errors['signature'] = 'Signature is too large (max 2 MB).';
 }
}

// ── Duplicate email ───────────────────────────────────────────
if (!isset($errors['contactEmail']) && $email !== '') {
 try {
  $stmt = db()->prepare('SELECT id FROM attendees WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  if ($stmt->fetch()) {
   $errors['contactEmail'] = 'This email is already registered.';
  }
 } catch (Throwable $e) {
  error_log('DB error in register.php: ' . $e->getMessage());
  json_out(['ok' => false, 'error' => 'Server error.'], 500);
 }
}

if (!empty($errors)) {
 json_out(['ok' => false, 'errors' => $errors], 422);
}

// ── Everything valid. Insert. ─────────────────────────────────
$uuid  = uuid_v4();
$token = token_hex(32); // 64-char hex string

// Save signature PNG
$sigDir = SIGNATURE_DIR;
if (!is_dir($sigDir)) {
 mkdir($sigDir, 0775, true);
}
$sigFile = $sigDir . '/' . $uuid . '.png';
if (file_put_contents($sigFile, $signatureBin) === false) {
 json_out(['ok' => false, 'error' => 'Could not save signature.'], 500);
}
$sigRelPath = 'signatures/' . $uuid . '.png';

// Insert row
try {
 $stmt = db()->prepare(
  'INSERT INTO attendees
          (uuid, qr_token, first_name, middle_name, last_name, gender, age_range,
           classification, email, visitor_type, affiliation, region, signature_path)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
 );
 $stmt->execute([
  $uuid,
  $token,
  $firstName,
  $middleName,
  $lastName,
  $gender,
  $ageRange,
  $classification,
  $email,
  $visitorType,
  $affiliation,
  $region,
  $sigRelPath,
 ]);
} catch (Throwable $e) {
 error_log('Insert failed: ' . $e->getMessage());
 // Clean up the orphan signature file
 if (is_file($sigFile)) @unlink($sigFile);
 json_out(['ok' => false, 'error' => 'Could not save registration.'], 500);
}

// Build the response body first so we can send proper headers.
$response = json_encode([
 'ok'      => true,
 'uuid'    => $uuid,
 'message' => 'Registration complete. A QR pass will be sent to your email.',
]);

http_response_code(200);
header('Content-Type: application/json; charset=utf-8');
header('Content-Length: ' . strlen($response));
header('Connection: close');

// Discard any buffered output that might have crept in, then send our JSON.
while (ob_get_level() > 0) ob_end_clean();
echo $response;

// Try to close the connection to the browser NOW.
// On PHP-FPM this truly finishes the HTTP response.
if (function_exists('fastcgi_finish_request')) {
 fastcgi_finish_request();
} else {
 // mod_php fallback: send everything and hope Apache closes.
 flush();
}

// From here on, whatever we do cannot affect the browser response.
ignore_user_abort(true);
set_time_limit(15);

require_once __DIR__ . '/send_qr.php';
send_qr_email($email, $firstName . ' ' . $lastName, $token);
exit;
