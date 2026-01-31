<?php
function json_response($data, int $status=200): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  echo json_encode($data, JSON_UNESCAPED_UNICODE);
  exit;
}

function start_session(): void {
  if (session_status() === PHP_SESSION_NONE) session_start();
}

function require_post(): void {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok'=>false,'error'=>'Método no permitido'], 405);
  }
}

function require_get(): void {
  if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response(['ok'=>false,'error'=>'Método no permitido'], 405);
  }
}

function clean($v): string { return trim((string)$v); }

function require_admin(): array {
  start_session();
  if (empty($_SESSION['admin'])) json_response(['ok'=>false,'error'=>'No autorizado'], 401);
  return $_SESSION['admin'];
}

function make_folio(int $len=10): string {
  $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  $out = '';
  for ($i=0; $i<$len; $i++) $out .= $chars[random_int(0, strlen($chars)-1)];
  return $out;
}
