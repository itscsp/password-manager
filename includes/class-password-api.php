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
            'permission_callback' => array('PM_Helper', 'validate_token')
        ));

        // Add new route for retrieving passwords
        register_rest_route('password-manager/v1', '/get-passwords', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_passwords'),
            'permission_callback' => array('PM_Helper', 'validate_token')
        ));

        // Add new route for updating passwords
        register_rest_route('password-manager/v1', '/update-password/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_password'),
            'permission_callback' => array('PM_Helper', 'validate_token')
        ));

        // Add new route for deleting passwords
        register_rest_route('password-manager/v1', '/delete-password/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_password'),
            'permission_callback' => array('PM_Helper', 'validate_token')
        ));

        // Add new route for retrieving individual password
        register_rest_route('password-manager/v1', '/get-password/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_password'),
            'permission_callback' => array('PM_Helper', 'validate_token')
        ));

        register_rest_route('password-manager/v1', '/search-passwords', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_passwords'),
            'permission_callback' => array('PM_Helper', 'validate_token')
        ));
    }

    public function add_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = PM_Helper::decrypt_key($encrypted_secret_key);

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        // Validate URL and note length
        if (!PM_Helper::is_valid_url($url)) {
            return new WP_REST_Response(array('message' => 'Invalid URL format.'), 400);
        }

        $url = preg_replace('/^https?:\/\/(.+?)(?:$|\/)/i', '$1', $url);

        if (strlen($note) > 250) {
            return new WP_REST_Response(array('message' => 'Note cannot exceed 250 characters.'), 400);
        }

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

        // Encrypt the data using the secret key
        $encrypted_username = PM_Helper::encrypt_data($username, $secret_key);
        $encrypted_password = PM_Helper::encrypt_data($password, $secret_key);
        $encrypted_note = PM_Helper::encrypt_data($note, $secret_key);

        $wpdb->insert(
            $table_name,
            array(
                'user_id' => $user_id,
                'username' => $encrypted_username,
                'password' => $encrypted_password,
                'url' => $url,
                'note' => $encrypted_note,
            )
        );

        return new WP_REST_Response(array('message' => 'Password added successfully.'), 201);
    }


    public function update_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);
        $password_id = $request['id'];

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = PM_Helper::decrypt_key($encrypted_secret_key);

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        // Validate URL and note length
        if (!PM_Helper::is_valid_url($url)) {
            return new WP_REST_Response(array('message' => 'Invalid URL format.'), 400);
        }

        $url = preg_replace('/^https?:\/\/(.+?)(?:$|\/)/i', '$1', $url);


        if (!PM_Helper::is_valid_note_length($note)) {
            return new WP_REST_Response(array('message' => 'Note cannot exceed 250 characters.'), 400);
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

        // Encrypt the data using the secret key
        $encrypted_username = PM_Helper::encrypt_data($username, $secret_key);
        $encrypted_password = PM_Helper::encrypt_data($password, $secret_key);
        $encrypted_note = PM_Helper::encrypt_data($note, $secret_key);

        $wpdb->update(
            $table_name,
            array(
                'username' => $encrypted_username,
                'password' => $encrypted_password,
                'url' => $url,
                'note' => $encrypted_note,
            ),
            array(
                'id' => $password_id,
                'user_id' => $user_id
            )
        );

        return new WP_REST_Response(array('message' => 'Password updated successfully.'), 200);
    }

    public function get_passwords($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = PM_Helper::decrypt_key($encrypted_secret_key);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d", $user_id), ARRAY_A);

        foreach ($results as &$result) {
            $result['username'] = PM_Helper::decrypt_data($result['username'], $secret_key);
        }

        $response = new WP_REST_Response($results, 200);
        $response->header('Cache-Control', 'no-cache, no-store, must-revalidate');
        $response->header('Pragma', 'no-cache');
        $response->header('Expires', '0');

        return $response;
    }


    public function delete_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);
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

    public function get_password($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);
        $password_id = $request['id'];

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token. Please login.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_secret_key', true);
        $secret_key = PM_Helper::decrypt_key($encrypted_secret_key);

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

        // Decrypt the data
        $result['username'] = PM_Helper::decrypt_data($result['username'], $secret_key);
        $result['password'] = PM_Helper::decrypt_data($result['password'], $secret_key);
        $result['note'] = PM_Helper::decrypt_data($result['note'], $secret_key);

        return new WP_REST_Response($result, 200);
    }
    public function search_passwords($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        $search_term = isset($request['url']) ? sanitize_text_field($request['url']) : '';

        if (empty($search_term)) {
            return new WP_REST_Response(array('message' => 'URL parameter is required.'), 400);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Search using the provided URL or string
        $like_url = '%' . $wpdb->esc_like($search_term) . '%';
        $exact_url = $wpdb->esc_like($search_term); // Escape for safe comparison
        $query = "SELECT * FROM $table_name WHERE user_id = %d AND (url LIKE %s OR url = %s)";
        $query_params = array($user_id, $like_url, $exact_url);

        $results = $wpdb->get_results($wpdb->prepare($query, $query_params), ARRAY_A);

        // Debugging: Log the query
        error_log($wpdb->last_query);

        if (empty($results)) {
            return new WP_REST_Response(array('message' => 'No passwords found for the provided search term.'), 200);
        } else {
            return new WP_REST_Response($results, 200);
        }
    }
}

new Password_API();
