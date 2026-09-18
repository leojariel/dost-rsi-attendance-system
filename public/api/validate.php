<?php

declare(strict_types=1);
require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
 json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$in = json_in();

// Whitelists — the frontend can send anything, we only accept these.
$GENDERS = ['male', 'female', 'other'];
$AGE_RANGES = ['1-14', '15-30', '31-59', '60+'];
$CLASSIFICATIONS = [
 'business',
 'government',
 'homemaker',
 'media',
 'others',
 'private',
 'student',
];
$VISITOR_TYPES = [
 'exhibitor',
 'organizer',
 'participant',
 'speaker',
 'volunteer',
];
$REGION_IDS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17'];

$errors = [];

function field(array $in, string $key): string
{
 return trim((string)($in[$key] ?? ''));
}

// ─── Privacy consent ──────────────────────────────
if (empty($in['privacyConsent'])) {
 $errors['privacyConsent'] = 'You must agree to the data privacy consent.';
}

// ─── Names ────────────────────────────────────────
$firstName  = field($in, 'firstName');
$middleName = field($in, 'middleName');
$lastName   = field($in, 'lastName');

if ($firstName === '') {
 $errors['firstName'] = 'First name is required.';
} elseif (mb_strlen($firstName) > 80) {
 $errors['firstName'] = 'First name is too long.';
} elseif (!preg_match('/^[\p{L}\s.\'-]+$/u', $firstName)) {
 $errors['firstName'] = 'First name contains invalid characters.';
}

if (mb_strlen($middleName) > 80) {
 $errors['middleName'] = 'Middle name is too long.';
}

if ($lastName === '') {
 $errors['lastName'] = 'Last name is required.';
} elseif (mb_strlen($lastName) > 80) {
 $errors['lastName'] = 'Last name is too long.';
} elseif (!preg_match('/^[\p{L}\s.\'-]+$/u', $lastName)) {
 $errors['lastName'] = 'Last name contains invalid characters.';
}

// ─── Gender ───────────────────────────────────────
$gender = field($in, 'gender');
if ($gender === '') {
 $errors['gender'] = 'Gender is required.';
} elseif (!in_array($gender, $GENDERS, true)) {
 $errors['gender'] = 'Invalid gender selection.';
}

// ─── Age range ────────────────────────────────────
$ageRange = field($in, 'ageRange');
if ($ageRange === '') {
 $errors['ageRange'] = 'Age range is required.';
} elseif (!in_array($ageRange, $AGE_RANGES, true)) {
 $errors['ageRange'] = 'Invalid age range.';
}

// ─── Classification ───────────────────────────────
$classification = field($in, 'classification');
if ($classification === '') {
 $errors['classification'] = 'Classification is required.';
} elseif (!in_array($classification, $CLASSIFICATIONS, true)) {
 $errors['classification'] = 'Invalid classification.';
}

// ─── Email ────────────────────────────────────────
$email = field($in, 'contactEmail');
if ($email === '') {
 $errors['contactEmail'] = 'Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
 $errors['contactEmail'] = 'Invalid email format.';
} elseif (mb_strlen($email) > 160) {
 $errors['contactEmail'] = 'Email is too long.';
}

// ─── Visitor type ─────────────────────────────────
$visitorType = field($in, 'visitorType');
if ($visitorType === '') {
 $errors['visitorType'] = 'Visitor type is required.';
} elseif (!in_array($visitorType, $VISITOR_TYPES, true)) {
 $errors['visitorType'] = 'Invalid visitor type.';
}

// ─── Affiliation ──────────────────────────────────
$affiliation = field($in, 'affiliation');
if ($affiliation === '') {
 $errors['affiliation'] = 'Affiliation is required.';
} elseif (mb_strlen($affiliation) > 160) {
 $errors['affiliation'] = 'Affiliation is too long.';
}

// ─── Region ───────────────────────────────────────
$region = field($in, 'region');
if ($region === '') {
 $errors['region'] = 'Region is required.';
} elseif (!in_array($region, $REGION_IDS, true)) {
 $errors['region'] = 'Invalid region.';
}

// ─── Duplicate email check (only if email is otherwise valid) ──
if (!isset($errors['contactEmail']) && $email !== '') {
 try {
  $stmt = db()->prepare('SELECT id FROM attendees WHERE email = ? LIMIT 1');
  $stmt->execute([$email]);
  if ($stmt->fetch()) {
   $errors['contactEmail'] = 'This email is already registered.';
  }
 } catch (Throwable $e) {
  error_log('DB error in validate.php: ' . $e->getMessage());
  json_out(['ok' => false, 'error' => 'Server error.'], 500);
 }
}

// ─── Result ───────────────────────────────────────
if (!empty($errors)) {
 json_out(['ok' => false, 'errors' => $errors], 422);
}

json_out(['ok' => true]);
