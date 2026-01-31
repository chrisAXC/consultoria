<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/util.php';

require_post();
start_session();

$email = clean($_POST['email'] ?? '');
$pass  = clean($_POST['password'] ?? '');

if ($email === '' || $pass === '') {
  json_response(['ok'=>false,'error'=>'Email y contraseña requeridos.'], 400);
}

$pdo = db();
$stmt = $pdo->prepare("SELECT id_admin, email, password_hash, nombre FROM admin_users WHERE email=? LIMIT 1");
$stmt->execute([$email]);
$a = $stmt->fetch();

if (!$a || !password_verify($pass, $a['password_hash'])) {
  json_response(['ok'=>false,'error'=>'Credenciales incorrectas.'], 401);
}

$_SESSION['admin'] = [
  'id_admin'=>$a['id_admin'],
  'email'=>$a['email'],
  'nombre'=>$a['nombre']
];

json_response(['ok'=>true]);
