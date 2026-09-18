# DOST 8th RSI Forum Attendance System

A PHP-based registration, QR attendance, and administrative management system for the DOST 8th Research, Statistics, and Innovation Forum.

## About

The system provides a public registration page for event attendees and an administrative page for managing registrations, scanning QR passes, viewing attendance status, and generating attendance certificates.

The application is designed for local development and deployment through a PHP-compatible web server such as Laragon with MySQL or MariaDB.

## Features

- Public attendee registration form
- Data privacy consent and required-field validation
- E-signature capture during registration
- Server-side validation of registration data
- Duplicate email detection
- Secure random attendee UUIDs and QR tokens
- QR pass generation and email delivery through PHPMailer
- Administrative login and attendee management
- Attendee search, editing, and deletion controls
- QR code attendance scanning through the device camera
- Confirmed and absent attendee views
- Attendance status updates stored in the database
- Certificate preview, generation, and printing for confirmed attendees
- Responsive interface using Tailwind CSS
- Local configuration support for database and SMTP credentials

## Requirements

- Windows with Laragon, or another PHP web server environment
- PHP with PDO MySQL support
- MySQL or MariaDB
- Composer
- Node.js and npm
- A modern browser with camera access support for QR scanning
- HTTPS or localhost access for browser camera permissions

## Installation

### 1. Place the project in the web root

For Laragon, place the project at:

```text
C:\laragon\www\dost-rsi-attendance-system
```

Start Apache and MySQL from the Laragon control panel.

### 2. Install PHP dependencies

From the project directory, run:

```powershell
composer install
```

This installs PHPMailer and the Endroid QR Code library into `vendor/`.

### 3. Install frontend dependencies

```powershell
npm install
```

Build the generated Tailwind CSS file:

```powershell
npm run build
```

During development, use the watcher instead:

```powershell
npm run dev
```

### 4. Create the database

Create a MySQL or MariaDB database named `rsi_forum` unless a different name is configured. The database must contain the tables expected by the API, including the `attendees` table used by registration, listing, and scanning.

The required attendee fields include:

- `id`
- `uuid`
- `qr_token`
- `first_name`
- `middle_name`
- `last_name`
- `gender`
- `age_range`
- `classification`
- `email`
- `visitor_type`
- `affiliation`
- `region`
- `signature_path`
- `status`
- `confirmed_at`
- `created_at`

Ensure that the database schema uses the same column names and data types expected by the API files.

### 5. Configure private credentials

Copy the configuration template:

```powershell
Copy-Item .\public\api\config_orig.example.php .\public\api\config_orig.php
```

Open `public/api/config_orig.php` and set the real values for:

- Database host, database name, username, and password
- SMTP host, port, username, and app password
- Sender email and sender name
- Public application URL

`config_orig.php` is excluded by `.gitignore` and must never be committed. The tracked `config.php` loads these values without containing the real credentials.

### 6. Open the application

Public registration:

```text
http://localhost/dost-rsi-attendance-system/public/register.php
```

Administrative page:

```text
http://localhost/dost-rsi-attendance-system/public/admin.php
```

## Registration Behavior

After a valid attendee registration and e-signature submission, the system displays a success overlay with the message:

> You're on the list.

Selecting the Close button removes only the overlay. It does not clear the registration form fields. This allows the attendee or staff member to review or correct the fields without losing the entered information.

The QR pass is generated and sent using the configured SMTP account after the registration is stored successfully.

## QR Scanner Behavior

The scanner is available from the administrative page. When a valid QR code is scanned, the system currently confirms the attendee directly after the database lookup. It does not display a separate confirmation modal before marking the attendee as confirmed.

On the first camera use in some browsers, the scanner may require this sequence:

1. Click Stop.
2. Click Start.
3. Allow camera permission when the browser prompts for it.

After permission is granted, the scanner should be usable normally. Camera access may require localhost or HTTPS, depending on the browser.

## Certificates

The administrative page can preview and print certificate layouts for confirmed attendees.

The certificate generator is not final and may still be improved. In particular, attendee e-signatures are not yet embedded into the generated certificates. Additional design, data, signature placement, and print-layout work may be added later.

## Security Notes

- Never commit `public/api/config_orig.php`.
- Never commit database exports, attendee signatures, QR images, SMTP credentials, passwords, private keys, or certificates.
- Rotate credentials that have previously been exposed in source control.
- Use an SMTP app password rather than a primary email account password when supported.
- Use HTTPS in production.
- Restrict access to the administrative page and protect production credentials outside the web root where possible.
- Review PHP error logging and avoid displaying errors to users in production.

## Extensibility

The system can be extended with additional features, including:

- Role-based administrator permissions
- Stronger server-side admin authentication
- Confirmation dialogs before attendance status changes
- Improved camera startup and permission handling
- Attendance reports and export tools
- Certificate templates and branding controls
- Attendee e-signatures embedded in certificates
- Email delivery logs and retry handling
- Event and activity selection management
- Audit logs for administrative actions
- Automated database migrations and schema setup
- Automated tests for registration, scanning, email, and certificate workflows

## Project Structure

```text
public/
  admin.php              Administrative dashboard
  register.php           Public registration page
  api/                   PHP API endpoints and configuration
  css/                   Generated CSS output
  storage/               Runtime QR and signature files
src/
  js/                    Frontend JavaScript
  css/                   Tailwind input CSS
composer.json            PHP dependency definitions
composer.lock            Locked PHP dependency versions
package.json             Frontend scripts and dependencies
package-lock.json        Locked npm dependency versions
.gitignore               Ignored secrets, generated files, and local data
```

## Current Status

The core registration, QR attendance, email, and certificate workflows are functional. The certificate generator, camera initialization behavior, scanner confirmation flow, and administrative security can continue to be refined as project requirements develop.
