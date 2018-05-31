<?php 
require 'loader.php';

try {
  $params = ['index' => 'places'];
  $response = $client->indices()->delete($params);
  print_r($response);
} catch(\Exception $e) {
  echo 'err: ' . $e->getMessage();
}