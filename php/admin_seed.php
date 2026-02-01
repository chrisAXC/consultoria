<?php
require_once __DIR__ . '/db.php';

$pdo = db();

$email = "admin@consultoria.com";
$pass  = "1234"; // cámbiala si quieres
$nombre = "Admin";

$hash = password_hash($pass, PASSWORD_BCRYPT);

// Si existe, actualiza hash. Si no existe, inserta.
$stmt = $pdo->prepare("SELECT id_admin FROM admin_users WHERE email=? LIMIT 1");
$stmt->execute([$email]);
$row = $stmt->fetch();

if ($row) {
  $upd = $pdo->prepare("UPDATE admin_users SET password_hash=?, nombre=? WHERE id_admin=?");
  $upd->execute([$hash, $nombre, $row['id_admin']]);
  echo "Admin actualizado: $email / $pass";
} else {
  $ins = $pdo->prepare("INSERT INTO admin_users (nombre,email,password_hash) VALUES (?,?,?)");
  $ins->execute([$nombre, $email, $hash]);
  echo "Admin creado: $email / $pass";
}
