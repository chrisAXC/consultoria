<?php
require_once __DIR__ . '/util.php';
require_get();
start_session();

if (empty($_SESSION['admin'])) json_response(['ok'=>true,'logged'=>false]);
json_response(['ok'=>true,'logged'=>true,'admin'=>$_SESSION['admin']]);
