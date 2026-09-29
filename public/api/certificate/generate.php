<?php

declare(strict_types=1);

require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../../../vendor/autoload.php';


/**
 * Generate a PDF certificate for a confirmed attendee.
 *
 * The certificate design is based on a PNG template.
 * The attendee name is written onto the template first,
 * then the resulting image is placed into an A4 landscape PDF.
 *
 * @param PDO $pdo
 * @param int $attendeeId
 * @return array
 * @throws Exception
 */
function generateCertificate(PDO $pdo, int $attendeeId): array
{
    // =========================================================
    // GET ATTENDEE
    // =========================================================

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


    // =========================================================
    // CHECK ATTENDANCE STATUS
    // =========================================================

    if ($attendee['status'] !== 'confirmed') {
        throw new Exception(
            "Certificate can only be generated for confirmed attendees."
        );
    }


    // =========================================================
    // CERTIFICATE TEMPLATE
    // =========================================================

    $templatePath = __DIR__ .
        '/../../assets/certificates/certificate_template.png';

    if (!file_exists($templatePath)) {
        throw new Exception(
            "Certificate template not found."
        );
    }


    // =========================================================
    // FONT
    // =========================================================

    $fontPath = __DIR__ .
        '/../../assets/certificates/fonts/Agrandir-ThinItalic.otf';

    if (!file_exists($fontPath)) {
        throw new Exception(
            "Certificate font not found."
        );
    }


    // =========================================================
    // LOAD PNG TEMPLATE
    // =========================================================

    $image = imagecreatefrompng($templatePath);

    if (!$image) {
        throw new Exception(
            "Unable to load certificate template."
        );
    }


    // =========================================================
    // BUILD FULL NAME
    // =========================================================

    $fullName = trim(
        $attendee['first_name'] . ' ' .
        ($attendee['middle_name'] ?? '') . ' ' .
        $attendee['last_name']
    );


    // =========================================================
    // NAME SETTINGS
    // =========================================================

    $fontSize = 58;

    $textColor = imagecolorallocate(
        $image,
        0,
        39,
        53
    );

    $nameX = 115;
    $nameY = 730;


    // =========================================================
    // DRAW ATTENDEE NAME
    // =========================================================

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


    // =========================================================
    // OUTPUT DIRECTORY
    // =========================================================

    $outputDir = __DIR__ .
        '/../../generated/certificates';

    if (!is_dir($outputDir)) {

        if (!mkdir($outputDir, 0777, true)) {

            imagedestroy($image);

            throw new Exception(
                "Unable to create certificate directory."
            );
        }
    }


    // =========================================================
    // TEMPORARY PNG
    // =========================================================

    $tempFileName =
        'certificate_' .
        $attendee['id'] .
        '_temp.png';

    $tempPngPath =
        $outputDir .
        '/' .
        $tempFileName;


    // Save temporary PNG
    if (!imagepng($image, $tempPngPath)) {

        imagedestroy($image);

        throw new Exception(
            "Unable to create temporary certificate image."
        );
    }

    imagedestroy($image);


    // =========================================================
    // FINAL PDF
    // =========================================================

    $pdfFileName =
        'certificate_' .
        $attendee['id'] .
        '.pdf';

    $pdfPath =
        $outputDir .
        '/' .
        $pdfFileName;


    // =========================================================
    // CREATE A4 LANDSCAPE PDF
    // =========================================================

    $pdf = new FPDF('L', 'mm', 'A4');

    $pdf->SetAutoPageBreak(false);

    $pdf->AddPage();

    // Remove margins
    $pdf->SetMargins(0, 0, 0);


    // A4 landscape dimensions
    $pageWidth = 297;
    $pageHeight = 210;


    // Place certificate image across entire page
    $pdf->Image(
        $tempPngPath,
        0,
        0,
        $pageWidth,
        $pageHeight,
        'PNG'
    );


    // Save PDF
    $pdf->Output(
        'F',
        $pdfPath
    );


    // =========================================================
    // REMOVE TEMPORARY PNG
    // =========================================================

    if (file_exists($tempPngPath)) {
        unlink($tempPngPath);
    }


    // =========================================================
    // PUBLIC URL
    // =========================================================

    $publicPath =
        '/dost-rsi-attendance-system/public/generated/certificates/' .
        $pdfFileName;


    // =========================================================
    // RETURN CERTIFICATE INFORMATION
    // =========================================================

    return [
        'id' => (int)$attendee['id'],
        'file_name' => $pdfFileName,
        'path' => $publicPath,
        'type' => 'pdf',
    ];
}


/*
|--------------------------------------------------------------------------
| DIRECT API REQUEST
|--------------------------------------------------------------------------
|
| This allows generate.php to be called directly for testing.
|
*/

/*
 * Standalone API endpoint
 *
 * Only execute this block when generate.php itself
 * is directly requested.
 *
 * When scan.php includes this file, this block will NOT run.
 */
if (
    basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'generate.php'
    && $_SERVER['REQUEST_METHOD'] === 'POST'
) {

    header('Content-Type: application/json');

    try {

        $input = json_decode(
            file_get_contents('php://input'),
            true
        );

        $attendeeId = (int)(
            $input['attendee_id'] ?? 0
        );

        if (!$attendeeId) {
            throw new Exception(
                "Attendee ID is required."
            );
        }

        $certificate = generateCertificate(
            db(),
            $attendeeId
        );

        echo json_encode([
            'ok' => true,
            'certificate' => $certificate
        ]);

    } catch (Throwable $e) {

        http_response_code(400);

        echo json_encode([
            'ok' => false,
            'error' => $e->getMessage()
        ]);
    }

    exit;
}