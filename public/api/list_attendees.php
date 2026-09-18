<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';

$status = $_GET['status'] ?? 'all';

$allowed = ['all', 'confirmed', 'absent'];
if (!in_array($status, $allowed, true)) {
 json_out(['ok' => false, 'error' => 'Invalid status filter.'], 422);
}

try {
 $pdo = db();

 if ($status === 'all') {
  $stmt = $pdo->query(
   'SELECT id, uuid, first_name, middle_name, last_name, gender, age_range,
                    classification, email, visitor_type, affiliation, region,
                    signature_path, status, confirmed_at, created_at
             FROM attendees
             ORDER BY id ASC'
  );
 } else {
  $stmt = $pdo->prepare(
   'SELECT id, uuid, first_name, middle_name, last_name, gender, age_range,
                    classification, email, visitor_type, affiliation, region,
                    signature_path, status, confirmed_at, created_at
             FROM attendees
             WHERE status = ?
             ORDER BY confirmed_at DESC, id DESC'
  );
  $stmt->execute([$status]);
 }

 $rows = $stmt->fetchAll();

 json_out(['ok' => true, 'attendees' => $rows]);
} catch (Throwable $e) {
 error_log('List attendees error: ' . $e->getMessage());
 json_out(['ok' => false, 'error' => 'Server error.'], 500);
}
