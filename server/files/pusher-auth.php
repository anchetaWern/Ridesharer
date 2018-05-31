<?php 
require 'vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

$app_id = getenv('PUSHER_APP_ID');
$app_key = getenv('PUSHER_APP_KEY');
$app_secret = getenv('PUSHER_APP_SECRET');
$app_cluster = getenv('PUSHER_APP_CLUSTER');


header('Content-Type: application/json');

$options = ['cluster' => $app_cluster, 'encrypted' => true];
$pusher = new Pusher\Pusher($app_key, $app_secret, $app_id, $options);

$channel = $_POST['channel_name'];
$socket_id = $_POST['socket_id'];

echo $pusher->socket_auth($channel, $socket_id);