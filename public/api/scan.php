<?php

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/certificate/generate.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['ok' => false, 'error' => 'Method not allowed'], 405);
}

$in = json_in();

$raw = trim((string)($in['token'] ?? ''));
$action = trim((string)($in['action'] ?? 'lookup'));

if ($raw === '') {
    json_out(['ok' => false, 'error' => 'Missing token.'], 422);
}

// Accept either a raw hex token or a URL containing ?t=<token>
$token = $raw;

if (preg_match('/[?&]t=([a-f0-9]{64})/i', $raw, $m)) {
    $token = $m[1];
}

if (!preg_match('/^[a-f0-9]{64}$/i', $token)) {
    json_out(['ok' => false, 'error' => 'Invalid QR code.'], 422);
}

try {
    $pdo = db();

    $stmt = $pdo->prepare(
        'SELECT * FROM attendees WHERE qr_token = ? LIMIT 1'
    );

    $stmt->execute([$token]);

    $row = $stmt->fetch();

    if (!$row) {
        json_out([
            'ok' => false,
            'error' => 'Attendee not found.'
        ], 404);
    }

    /*
     * STEP 1: LOOKUP
     *
     * The QR scan only retrieves the attendee.
     * It does NOT confirm attendance.
     */
    if ($action === 'lookup') {

        if ($row['status'] === 'confirmed') {
            json_out([
                'ok' => false,
                'error' => 'Already confirmed.',
                'attendee' => [
                    'id'             => (int)$row['id'],
                    'name'           => trim($row['first_name'] . ' ' . $row['last_name']),
                    'confirmed_at'   => $row['confirmed_at'],
                ],
            ], 409);
        }

        json_out([
            'ok' => true,
            'attendee' => [
                'id'             => (int)$row['id'],
                'uuid'           => $row['uuid'],
                'first_name'     => $row['first_name'],
                'middle_name'    => $row['middle_name'],
                'last_name'      => $row['last_name'],
                'gender'         => $row['gender'],
                'age_range'      => $row['age_range'],
                'classification' => $row['classification'],
                'affiliation'    => $row['affiliation'],
                'region'         => $row['region'],
                'visitor_type'   => $row['visitor_type'],
                'email'          => $row['email'],
                'status'         => $row['status'],
            ],
        ]);
    }

    /*
     * STEP 2: CONFIRM
     *
     * Only this action changes the database.
     */
    if ($action === 'confirm') {

        if ($row['status'] === 'confirmed') {
            json_out([
                'ok' => false,
                'error' => 'Already confirmed.',
                'attendee' => [
                    'id'           => (int)$row['id'],
                    'name'         => trim($row['first_name'] . ' ' . $row['last_name']),
                    'confirmed_at' => $row['confirmed_at'],
                ],
            ], 409);
        }

        // Confirm attendance
        $upd = $pdo->prepare(
            'UPDATE attendees
            SET status = "confirmed", confirmed_at = NOW()
            WHERE id = ?'
        );

        $upd->execute([$row['id']]);


        // Generate certificate automatically
        $certificate = generateCertificate(
            $pdo,
            (int)$row['id']
        );


        // Get the actual confirmation timestamp
        $confirmedStmt = $pdo->prepare(
            'SELECT confirmed_at
            FROM attendees
            WHERE id = ?
            LIMIT 1'
        );

        $confirmedStmt->execute([$row['id']]);

        $confirmedAt = $confirmedStmt->fetchColumn();


        // Return confirmation + certificate
        json_out([
            'ok' => true,
            'message' => 'Attendance confirmed.',
            'attendee' => [
                'id'             => (int)$row['id'],
                'uuid'           => $row['uuid'],
                'first_name'     => $row['first_name'],
                'middle_name'    => $row['middle_name'],
                'last_name'      => $row['last_name'],
                'gender'         => $row['gender'],
                'age_range'      => $row['age_range'],
                'classification' => $row['classification'],
                'affiliation'    => $row['affiliation'],
                'region'         => $row['region'],
                'visitor_type'   => $row['visitor_type'],
                'confirmed_at'   => $confirmedAt,
            ],
            'certificate' => $certificate,
        ]);
    }

    json_out([
        'ok' => false,
        'error' => 'Invalid action.'
    ], 422);

} catch (Throwable $e) {

    error_log('Scan error: ' . $e->getMessage());

    json_out([
        'ok' => false,
        'error' => 'Server error.'
    ], 500);
}