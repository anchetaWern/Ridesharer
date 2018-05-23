<?php 
use Elasticsearch\ClientBuilder;

require 'vendor/autoload.php';

$hosts = [
  [
    'host' => 'elasticsearch'
  ]
];

$client = ClientBuilder::create()->setHosts($hosts)->build();


try {
  $indexParams['index']  = 'places';

  $myTypeMapping = [
    '_source' => [
      'enabled' => true
    ],
    'properties' => [
      'from_coords' => [
        'type' => 'geo_point'
      ],
      'to_coords' => [
        'type' => 'geo_point'
      ],
      'current_coords' => [
        'type' => 'geo_point'
      ],
      'from_bounds.top_left.coords' => [
        'type' => 'geo_point'
      ],
      'from_bounds.bottom_right.coords' => [
        'type' => 'geo_point'
      ],
      'to_bounds.top_left.coords' => [
        'type' => 'geo_point'
      ],
      'to_bounds.bottom_right.coords' => [
        'type' => 'geo_point'
      ]
    ]
  ];

  $indexParams['body']['mappings']['location'] = $myTypeMapping;
  $response = $client->indices()->create($indexParams);
  print_r($response);
  
} catch(\Exception $e) {
  echo 'err: ' . $e->getMessage();
}