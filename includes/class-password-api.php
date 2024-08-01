<?php

if (!defined('ABSPATH')) {
    exit;
}

class Password_API
{

    private $master_password;

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
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        // Add new route for retrieving passwords
        register_rest_route('password-manager/v1', '/get-passwords', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_passwords'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        // Add new route for updating passwords
        register_rest_route('password-manager/v1', '/update-password/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_password'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        // Add new route for deleting passwords
        register_rest_route('password-manager/v1', '/delete-password/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_password'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        // Add new route for retrieving individual password
        register_rest_route('password-manager/v1', '/get-password/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_password'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        // Add new route for searching passwords
        register_rest_route('password-manager/v1', '/search-passwords', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_passwords'),
        ));
    }


    public function handle_token_validation($request)
    {

        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = PM_Helper::get_user_id_from_token($session_token);
            if ($user_id) {
                // Retrieve the 'x-session-token' header
                $headers = $request->get_header('X-Session-Token');

                $secret_key = sanitize_text_field($request['token']);


                // Log the session token
                // error_log('Received session token: ' . $secret_key);

                // Check if session token is missing
                if (empty($secret_key)) {
                    // error_log('Missing session token.');
                    // return new WP_REST_Response(array('message' => 'Missing session token.'), 400);
                    return false;
                }

                // Retrieve session token from request body
                error_log('Retrieved session token from request body: ' . $secret_key);

                if (empty($secret_key)) {
                    // error_log('Missing session token in request body.');
                    // return new WP_REST_Response(array('message' => 'Missing session token in request body.'), 400);
                    return false;
                }

                // Check if session token format is valid
                if (strpos($secret_key, '|') === false) {
                    // error_log('Invalid session token format: ' . $secret_key);
                    // return new WP_REST_Response(array('message' => 'Invalid session token format.'), 400);
                    return false;
                }

                // Split the session token into key, iv, and encrypted data
                list($key, $iv, $encrypted_data) = explode('|', $secret_key);

                // // Log the split values
                // error_log('Key: ' . $key);
                // error_log('IV: ' . $iv);
                // error_log('Encrypted Data: ' . $encrypted_data);

                try {
                    // Decrypt the master password
                    $master_password = $this->get_decrypt_data($key, $iv, $encrypted_data);
                    // error_log('Master Password Decrypted.' . $master_password);

                    // Check if decryption failed
                    if ($master_password === false) {
                        // error_log('Decryption failed.');
                        // return new WP_REST_Response(array('message' => 'Decryption failed.'), 403);
                        return false;
                    }

                    // Retrieve the stored hashed master password
                    $hashed_master_password = get_user_meta($user_id, 'pm_hashed_master_password', true);
                    // error_log('Hashed master password from user meta: ' . $hashed_master_password);

                    // Verify the provided master password
                    if (!PM_Helper::verify_password($master_password, $hashed_master_password)) {
                        // error_log('Invalid master password.');
                        // return new WP_REST_Response(array('message' => 'Invalid master password.'), 403);
                        return false;
                    }

                    // If all checks pass, allow the request to proceed
                    // error_log('Token validation successful. Request authorized.');
                    $this->master_password = $master_password;
                    return true;
                } catch (Exception $e) {
                    // error_log('Error during decryption: ' . $e->getMessage());
                    // return new WP_REST_Response(array('message' => 'Error during decryption: ' . $e->getMessage()), 500);
                    return false;
                }
            } else {
                // return new WP_REST_Response(array('message' => 'User Not valid.'), 403);
                return false;
            }
        }
    }

    /**
     * Convert base64 to bytes.
     */
    private function base64_to_bytes($base64)
    {
        return base64_decode($base64);
    }

    /**
     * Decrypt data using AES-256-CBC.
     */
    public function get_decrypt_data($key, $iv, $encrypted_data)
    {
        $key_bytes = hex2bin($key); // Convert hex key to bytes
        $iv_bytes = $this->base64_to_bytes($iv); // Convert base64 IV to bytes
        $encrypted_data_bytes = $this->base64_to_bytes($encrypted_data); // Convert base64 encrypted data to bytes

        // Decrypt the data
        $decrypted_data = openssl_decrypt(
            $encrypted_data_bytes,
            'aes-256-cbc',
            $key_bytes,
            OPENSSL_RAW_DATA,
            $iv_bytes
        );

        if ($decrypted_data === false) {
            throw new Exception('Decryption failed');
        }

        return $decrypted_data;
    }

    public function add_password($request)
    {
        error_log('Your adding password now');

        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key

        $salt = get_user_meta($user_id, 'pm_salt', true);
        $master_password =  $this->master_password;
        error_log('Global Masster Password' . $this->master_password);


        // Generate the encryption key from the master password and salt
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        // Validate URL and note length
        if (!PM_Helper::is_valid_url($url)) {
            return new WP_REST_Response(array('message' => 'Invalid URL format.'), 400);
        }

        if (!PM_Helper::is_valid_note_length($note)) {
            return new WP_REST_Response(array('message' => 'Note cannot exceed 250 characters.'), 400);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Check if the username and URL already exist for this user
        $existing_entry = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE url = %s",
            $url
        ));

        if ($existing_entry) {
            return new WP_REST_Response(array('message' => 'Username and site URL already exist. Please update them.'), 409);
        }

        // Encrypt the data using the encryption key
        $encrypted_username = PM_Helper::encrypt_data($username, $encryption_key);
        $encrypted_password = PM_Helper::encrypt_data($password, $encryption_key);
        $encrypted_note = PM_Helper::encrypt_data($note, $encryption_key);

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
        $master_password = $this->master_password; // Need to get this from the user

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_encrypted_secret_key', true);
        $salt = get_user_meta($user_id, 'pm_salt', true);

        // Generate the encryption key from the master password and salt
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        // Validate URL and note length
        if (!PM_Helper::is_valid_url($url)) {
            return new WP_REST_Response(array('message' => 'Invalid URL format.'), 400);
        }

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

        // Encrypt the data using the encryption key
        $encrypted_username = PM_Helper::encrypt_data($username, $encryption_key);
        $encrypted_password = PM_Helper::encrypt_data($password, $encryption_key);
        $encrypted_note = PM_Helper::encrypt_data($note, $encryption_key);

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
        $master_password = $this->master_password; // Need to get this from the user

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_encrypted_secret_key', true);
        $salt = get_user_meta($user_id, 'pm_salt', true);

        // Generate the encryption key from the master password and salt
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $results = $wpdb->get_results($wpdb->prepare("SELECT * FROM $table_name WHERE user_id = %d", $user_id), ARRAY_A);

        foreach ($results as &$result) {

            $result['username'] = PM_Helper::decrypt_data($result['username'], $encryption_key);
            $result['password'] = PM_Helper::decrypt_data($result['password'], $encryption_key);
            $result['note'] = PM_Helper::decrypt_data($result['note'], $encryption_key);
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
        $master_password = $this->master_password; // Need to get this from the user

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token. Please login.'), 403);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_encrypted_secret_key', true);
        $salt = get_user_meta($user_id, 'pm_salt', true);

        // Generate the encryption key from the master password and salt
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

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
        $result['username'] = PM_Helper::decrypt_data($result['username'], $encryption_key);
        $result['password'] = PM_Helper::decrypt_data($result['password'], $encryption_key);
        $result['note'] = PM_Helper::decrypt_data($result['note'], $encryption_key);

        return new WP_REST_Response($result, 200);
    }

    public function search_passwords($request)
    {
        $headers = getallheaders();
        $session_token = isset($headers['X-Session-Token']) ? sanitize_text_field($headers['X-Session-Token']) : '';
        $user_id = PM_Helper::get_user_id_from_token($session_token);
        $master_password = sanitize_text_field($request['master_password']); // Need to get this from the user

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        $search_term = isset($request['url']) ? sanitize_text_field($request['url']) : '';

        if (empty($search_term)) {
            return new WP_REST_Response(array('message' => 'URL parameter is required.'), 400);
        }

        // Retrieve and decrypt the secret key
        $encrypted_secret_key = get_user_meta($user_id, 'pm_encrypted_secret_key', true);
        $salt = get_user_meta($user_id, 'pm_salt', true);

        // Generate the encryption key from the master password and salt
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Assuming $user_id is retrieved from session token validation and $search_term is sanitized.
        $search_term = sanitize_text_field($request->get_param('search_term')); // Replace 'search_term' with the actual parameter name if different
        // Search using the provided URL or string
        $like_url = '%' . $wpdb->esc_like($search_term) . '%';
        $exact_url = $wpdb->esc_like($search_term); // Escape for safe comparison

        // Modified query to include user_id
        $query = "SELECT url, username, password, note FROM $table_name WHERE user_id = %d AND (url LIKE %s OR url = %s)";
        $query_params = array($user_id, $like_url, $exact_url);

        $results = $wpdb->get_results($wpdb->prepare($query, $query_params), ARRAY_A);

        // Make sure to decrypt the retrieved data if needed
        foreach ($results as &$result) {
            // Assuming you have methods to decrypt data
            $result['username'] = PM_Helper::decrypt_data($result['username'], $encryption_key);
            $result['password'] = PM_Helper::decrypt_data($result['password'], $encryption_key);
            $result['note'] = PM_Helper::decrypt_data($result['note'], $encryption_key);
        }

        if (empty($results)) {
            return new WP_REST_Response(array('message' => 'No passwords found for the provided search term.'), 200);
        } else {
            return new WP_REST_Response($results, 200);
        }
    }
}

new Password_API();
