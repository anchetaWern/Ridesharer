<?php 
use Elasticsearch\ClientBuilder;

require 'vendor/autoload.php';

$dotenv = new Dotenv\Dotenv(__DIR__);
$dotenv->load();

$elasticsearch_host = getenv('ELASTICSEARCH_HOST');

$hosts = [
  [
    'host' => $elasticsearch_host
  ]
];

$client = ClientBuilder::create()->setHosts($hosts)->build();
