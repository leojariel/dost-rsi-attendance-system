<?php

declare(strict_types=1);

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/config.php';

use Endroid\QrCode\QrCode;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\Writer\PngWriter;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

function send_qr_email(string $email, string $name, string $token): void
{
 // Ensure QR cache dir exists
 if (!is_dir(QR_DIR)) {
  mkdir(QR_DIR, 0775, true);
 }

 // The QR encodes a URL that, when opened, could route to a check page.
 // For now, it encodes the raw token — the scanner reads it either way.
 $payload = PUBLIC_BASE . '/api/scan.php?t=' . $token;

 try {
  $qr = new QrCode(
   data: $payload,
   encoding: new Encoding('UTF-8'),
   errorCorrectionLevel: ErrorCorrectionLevel::Medium,
   size: 800,
   margin: 8,
  );

  $writer = new PngWriter();
  $result = $writer->write($qr);

  $qrFile = QR_DIR . '/' . $token . '.png';
  $result->saveToFile($qrFile);
 } catch (Throwable $e) {
  error_log('QR generation failed: ' . $e->getMessage());
  return;
 }

 $mail = new PHPMailer(true);
 $mail = new PHPMailer(true);
 $mail->Timeout     = 8;      // give up after 8 seconds
 $mail->SMTPDebug   = 0;
 $mail->SMTPKeepAlive = false;
 try {
  $mail->isSMTP();
  $mail->Host       = SMTP_HOST;
  $mail->SMTPAuth   = true;
  $mail->Username   = SMTP_USER;
  $mail->Password   = SMTP_PASS;
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port       = SMTP_PORT;

  $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
  $mail->addAddress($email, $name);

  $mail->isHTML(true);
  $mail->Subject = 'Your QR Pass for 8th Research, Statistics, and Innovation Forum';
  $mail->Body = qr_email_html($name);
  $mail->AltBody = qr_email_plain($name);

  $mail->addEmbeddedImage($qrFile, 'qrcode', 'qr-pass.png');
  $mail->send();
 } catch (MailException $e) {
  error_log('Mail send failed for ' . $email . ': ' . $mail->ErrorInfo);
 } catch (Throwable $e) {
  error_log('Mail send fatal for ' . $email . ': ' . $e->getMessage());
 }
}

function qr_email_html(string $name): string
{
 $safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
 return <<<HTML
<!doctype html>
<html>
<body style="margin:0;padding:32px;background:#ebf5f8;font-family:'Source Serif 4',Georgia,serif;color:#0b1214;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(124,134,138,0.3);padding:40px;">
    <p style="font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;color:#00adec;margin:0 0 8px;">
      DOST · 8th RSI Forum
    </p>
    <h1 style="font-family:'Inter',sans-serif;font-weight:300;font-size:24px;color:#002735;margin:0 0 24px;">
      Your registration is confirmed
    </h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hello {$safeName},</p>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px;">
      Thank you for registering for the <strong>8th Research, Statistics, and Innovation Forum</strong>.
      Please present the QR code below at the entrance on event day.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <img src="cid:qrcode" alt="QR Pass" width="260" height="260" style="display:inline-block;border:1px solid rgba(124,134,138,0.3);">
    </div>
    <table style="font-size:13px;color:#35393a;line-height:1.7;margin:24px 0;">
      <tr><td style="padding-right:16px;color:#7c868a;vertical-align:top;">Date</td><td>October 12–14, 2026</td></tr>
      <tr><td style="padding-right:16px;color:#7c868a;vertical-align:top;">Time</td><td>08:00 AM – 05:00 PM</td></tr>
      <tr><td style="padding-right:16px;color:#7c868a;vertical-align:top;">Venue</td><td>Quezon Convention Center<br>Lucena City, Quezon</td></tr>
    </table>
    <p style="font-size:13px;color:#7c868a;line-height:1.6;margin:24px 0 0;border-top:1px solid rgba(124,134,138,0.2);padding-top:20px;">
      This QR is unique to you. Do not share it.
    </p>
  </div>
</body>
</html>
HTML;
}

function qr_email_plain(string $name): string
{
 return "Hello {$name},\n\n"
  . "Your registration for the 8th Research, Statistics, and Innovation Forum is confirmed.\n\n"
  . "Please check the HTML version of this email for your QR pass.\n\n"
  . "Date: October 12-14, 2026, 08:00 AM - 05:00 PM\n"
  . "Venue: Quezon Convention Center, Lucena City, Quezon\n";
}
