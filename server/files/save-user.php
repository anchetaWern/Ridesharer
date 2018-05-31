<?php 
require 'loader.php';

$data = json_decode(file_get_contents("php://input"), true);
$username = $data['username'];

$params = [
  'index' => 'places',
  'type' => 'users'
];

$params['body']['query']['match']['username'] = $username;

try {
  $search_response = $client->search($params);
 
  if($search_response['hits']['total'] == 0){
 
    $index_response = $client->index([
      'index' => 'places',
      'type' => 'users',
      'id' => $username,
      'body' => [
        'username' => $username
      ]
    ]);

  }

  echo 'ok';
  
} catch(\Exception $e) {
  echo 'err: ' . $e->getMessage();
}