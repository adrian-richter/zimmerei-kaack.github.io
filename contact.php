<?php
// contact.php — schlanke PHP-Mail für Zimmerei Kaack
// Leg diese Datei neben index.html.
// Hinweis: Für zuverlässigen Versand richte SPF/DMARC für die Absenderdomain ein
// und nutze idealerweise SMTP (PHPMailer). Diese Version verwendet PHP mail().

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

function field($k){ return trim($_POST[$k] ?? ''); }

$name     = field('name');
$email    = field('email');
$message  = field('message');
$honeypot = field('website'); // Honeypot (sollte leer bleiben)
$privacy  = isset($_POST['privacy']);
$subject  = field('_subject') ?: 'Neue Anfrage über Website';

// Basic Validation
if ($honeypot !== '') { // Bot -> tue so, als wäre ok
  echo json_encode(['ok' => true]);
  exit;
}
if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || $message === '' || !$privacy) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Invalid input']);
  exit;
}

// Header-Injection verhindern
$bad = ["\r", "\n", "%0a", "%0d"]; 
$name   = str_replace($bad, '', $name);
$email  = str_replace($bad, '', $email);
$subject= str_replace($bad, '', $subject);

$to = 'info@zimmerei-kaack.de'; // <- Zieladresse anpassen, falls nötig

$body  = "Neue Website-Anfrage (zimmerei-kaack.de)\n\n";
$body .= "Name:    {$name}\n";
$body .= "E-Mail:  {$email}\n\n";
$body .= "Nachricht:\n{$message}\n";

$domain = $_SERVER['HTTP_HOST'] ?? 'zimmerei-kaack.de';
$from   = 'no-reply@' . $domain;

$headers = [];
$headers[] = 'From: Zimmerei Kaack <' . $from . '>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$ok = @mail($to, $subject, $body, implode("\r\n", $headers));

if ($ok) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Send failed']);
}
