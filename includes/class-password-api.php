<?php

if (!defined('ABSPATH')) {
    exit;
}

class Password_API
{
    private $encryption_key = 'your_encryption_key_here';

    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_api_routes'));
    }

    public function register_api_routes()
    {
        // Add new route for storing passwords
        register_rest_route('password-manager/v1', '/add-password', array(
            'methods' => 'POST',
            'callback' => array($this, 'add_password'),
            'permission_callback' => array($this, 'validate_token')
        ));

        // Add new route for retrieving passwords
        register_rest_route('password-manager/v1', '/get-passwords', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_passwords'),
            'permission_callback' => array($this, 'validate_token')
        ));
    }

    public function add_password($request)
    {
        $user_id = get_current_user_id();
        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        $encrypted_password = openssl_encrypt($password, 'aes-128-cbc', $this->encryption_key, 0, $this->encryption_key);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'username' => $username,
                'password' => $encrypted_password,
                'url' => $url,
                'note' => $note,
            )
        );

        return new WP_REST_Response(array('message' => 'Password added successfully.'), 201);
    }

    public function get_passwords($request)
    {
        $user_id = get_current_user_id();

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d", $user_id), ARRAY_A);

        foreach ($results as &$result) {
            $result['password'] = openssl_decrypt($result['password'], 'aes-128-cbc', $this->encryption_key, 0, $this->encryption_key);
        }

        return new WP_REST_Response($results, 200);
    }

    public function validate_token($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = get_user_id_from_token($session_token);
            if ($user_id) {
                return true;
            }
        }
        return false;
    }
}

new Password_API();
