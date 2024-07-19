<?php

if (!defined('ABSPATH')) {
    exit;
}

class Password_API
{
    private $master_key;

    public function __construct()
    {
        $this->master_key = 'Qf2P£oz@m?x27``cJ_,voJZF(wvi*4j3b2]e'; // Ensure you have set this in your server environment
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

        // Add new route for retrieving individual password
        register_rest_route('password-manager/v1', '/get-password/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_password'),
            'permission_callback' => array($this, 'validate_token')
        ));

        // Add new route for updating passwords
        register_rest_route('password-manager/v1', '/update-password/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_password'),
            'permission_callback' => array($this, 'validate_token')
        ));

        // Add new route for deleting passwords
        register_rest_route('password-manager/v1', '/delete-password/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_password'),
            'permission_callback' => array($this, 'validate_token')
        ));
    }

    public function add_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = $this->get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = $this->decrypt_key($encrypted_secret_key);

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Check if the username and URL already exist for this user
        $existing_entry = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE user_id = %d AND username = %s AND url = %s",
            $user_id,
            $username,
            $url
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
        $user_id = $this->get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = $this->decrypt_key($encrypted_secret_key);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d", $user_id), ARRAY_A);

        foreach ($results as &$result) {
            list($encrypted_data, $iv, $tag) = explode('::', base64_decode($result['password']), 3);
            $result['password'] = openssl_decrypt($encrypted_data, 'aes-128-gcm', $secret_key, OPENSSL_RAW_DATA, $iv, $tag);
        }

        $response = new WP_REST_Response($results, 200);
        $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->header('Pragma', 'no-cache');
        $response->header('Expires', '0');

        return $response;
    }


    public function get_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = $this->get_user_id_from_token($session_token);
        $password_id = $request['id'];

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = $this->decrypt_key($encrypted_secret_key);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Fetch the password entry
        $result = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d AND user_id = %d",
            $password_id,
            $user_id
        ), ARRAY_A);

        if (!$result) {
            return new WP_REST_Response(array('message' => 'Password entry not found.'), 404);
        }

        // Decrypt the password
        list($encrypted_data, $iv, $tag) = explode('::', base64_decode($result['password']), 3);
        $result['password'] = openssl_decrypt($encrypted_data, 'aes-128-gcm', $secret_key, OPENSSL_RAW_DATA, $iv, $tag);

        return new WP_REST_Response($result, 200);
    }


    public function update_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = $this->get_user_id_from_token($session_token);
        $password_id = $request['id'];

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = $this->decrypt_key($encrypted_secret_key);

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Check if the password entry exists
        $existing_entry = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d AND user_id = %d",
            $password_id,
            $user_id
        ));

        if (!$existing_entry) {
            return new WP_REST_Response(array('message' => 'Password entry not found.'), 404);
        }

        // Encrypt the password using AES-GCM
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-128-gcm'));
        $tag = null;
        $encrypted_password = openssl_encrypt($password, 'aes-128-gcm', $secret_key, OPENSSL_RAW_DATA, $iv, $tag);

        // Store the encrypted password, IV, and tag together
        $encrypted_password = base64_encode($encrypted_password . '::' . $iv . '::' . $tag);

        $wpdb->update(
            $table_name,
            array(
                'username' => $username,
                'password' => $encrypted_password,
                'url' => $url,
                'note' => $note,
            ),
            array(
                'id' => $password_id,
                'user_id' => $user_id
            )
        );

        return new WP_REST_Response(array('message' => 'Password updated successfully.'), 200);
    }

    public function delete_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = $this->get_user_id_from_token($session_token);
        $password_id = $request['id'];

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Check if the password entry exists
        $existing_entry = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE id = %d AND user_id = %d",
            $password_id,
            $user_id
        ));

        if (!$existing_entry) {
            return new WP_REST_Response(array('message' => 'Password entry not found.'), 404);
        }

        $wpdb->delete(
            $table_name,
            array(
                'id' => $password_id,
                'user_id' => $user_id
            )
        );

        return new WP_REST_Response(array('message' => 'Password deleted successfully.'), 200);
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

    private function decrypt_key($encrypted_key)
    {
        list($encrypted_data, $iv, $tag) = explode('::', base64_decode($encrypted_key), 3);
        return openssl_decrypt($encrypted_data, 'aes-256-gcm', $this->master_key, OPENSSL_RAW_DATA, $iv, $tag);
    }
}

new Password_API();
