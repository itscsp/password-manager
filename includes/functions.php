<?php
function add_cors_headers()
{
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: X-Session-Token, Authorization, Content-Type, X-Requested-With");
}

add_action('rest_api_init', 'add_cors_headers');

function handle_preflight()
{
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']) && $_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'] == 'POST') {
            header("Access-Control-Allow-Origin: *");
            header("Access-Control-Allow-Methods: POST, OPTIONS");
            header("Access-Control-Allow-Headers: X-Session-Token, Authorization, Content-Type, X-Requested-With");
            exit;
        }
    }
}

add_action('rest_api_init', 'handle_preflight', 15);

?>