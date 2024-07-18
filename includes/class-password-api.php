<?php

if (!defined('ABSPATH')) {
    exit;
}

class Password_API
{
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
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $secret_key = isset($headers['X-Secret-Key']) ? sanitize_text_field($headers['X-Secret-Key']) : '';
        $user_id = $this->get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        if (empty($secret_key)) {
            return new WP_REST_Response(array('message' => 'Secret key is required.'), 403);
        }

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Check if the username and URL already exist for this user
        $existing_entry = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d AND username = %s AND url = %s",
            $user_id, $username, $url
        ));

        if ($existing_entry) {
            return new WP_REST_Response(array('message' => 'Username and site URL already exist. Please update them.'), 409);
        }

        // Encrypt the password using AES-GCM
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-128-gcm'));
        $tag = null;
        $encrypted_password = openssl_encrypt($password, 'aes-128-gcm', $secret_key, OPENSSL_RAW_DATA, $iv, $tag);

        // Store the encrypted password, IV, and tag together
        $encrypted_password = base64_encode($encrypted_password . '::' . $iv . '::' . $tag);

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
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $secret_key = isset($headers['X-Secret-Key']) ? sanitize_text_field($headers['X-Secret-Key']) : '';
        $user_id = $this->get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        if (empty($secret_key)) {
            return new WP_REST_Response(array('message' => 'Secret key is required.'), 403);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d", $user_id), ARRAY_A);

        foreach ($results as &$result) {
            list($encrypted_data, $iv, $tag) = explode('::', base64_decode($result['password']), 3);
            $result['password'] = openssl_decrypt($encrypted_data, 'aes-128-gcm', $secret_key, OPENSSL_RAW_DATA, $iv, $tag);
        }

        return new WP_REST_Response($results, 200);
    }

    public function validate_token($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = $this->get_user_id_from_token($session_token);
            if ($user_id) {
                return true;
            }
        }
        return false;
    }

    private function get_user_id_from_token($token)
    {
        global $wpdb;
        $user_id = $wpdb->get_var($wpdb->prepare(
            "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value = %s",
            'pm_session_token',
            $token
        ));

        return $user_id ? intval($user_id) : null;
    }
}

new Password_API();
