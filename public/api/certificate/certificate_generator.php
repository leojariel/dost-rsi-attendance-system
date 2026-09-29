<?php

function generateCertificateForAttendee(PDO $pdo, int $attendeeId): array
{
    // Get attendee
    $stmt = $pdo->prepare("
        SELECT *
        FROM attendees
        WHERE id = ?
        LIMIT 1
    ");

    $stmt->execute([$attendeeId]);

    $attendee = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$attendee) {
        throw new Exception("Attendee not found.");
    }

    if ($attendee['status'] !== 'confirmed') {
        throw new Exception("Attendee is not confirmed.");
    }

    // Certificate template
    $templatePath = __DIR__ .
        '/../../assets/certificates/certificate_template.png';

    if (!file_exists($templatePath)) {
        throw new Exception("Certificate template not found.");
    }

    // Font
    $fontPath = __DIR__ .
        '/../../assets/certificates/fonts/Agrandir-ThinItalic.otf';

    if (!file_exists($fontPath)) {
        throw new Exception("Certificate font not found.");
    }

    // Load template
    $image = imagecreatefrompng($templatePath);

    if (!$image) {
        throw new Exception("Unable to load certificate template.");
    }

    // Full name
    $fullName = trim(
        $attendee['first_name'] . ' ' .
        ($attendee['middle_name'] ?? '') . ' ' .
        $attendee['last_name']
    );

    // Text settings
    $fontSize = 58;

    $textColor = imagecolorallocate(
        $image,
        0,
        39,
        53
    );

    $nameX = 115;
    $nameY = 730;

    imagettftext(
        $image,
        $fontSize,
        0,
        $nameX,
        $nameY,
        $textColor,
        $fontPath,
        $fullName
    );

    // Output directory
    $outputDir = __DIR__ .
        '/../../generated/certificates';

    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0777, true);
    }

    // IMPORTANT:
    // deterministic filename based on attendee ID
    $fileName = 'certificate_' .
        $attendee['id'] .
        '.png';

    $outputPath = $outputDir .
        '/' .
        $fileName;

    // Save PNG
    if (!imagepng($image, $outputPath)) {
        imagedestroy($image);

        throw new Exception(
            "Unable to save certificate."
        );
    }

    imagedestroy($image);

    // Public URL/path
    $certificatePath =
        "/dost-rsi-attendance-system/public/generated/certificates/" .
        $fileName;

    // Save path to database
    $update = $pdo->prepare("
        UPDATE attendees
        SET certificate_path = ?
        WHERE id = ?
    ");

    $update->execute([
        $certificatePath,
        $attendee['id']
    ]);

    return [
        'path' => $certificatePath,
        'file_name' => $fileName
    ];
}