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
        register_rest_route('password-manager/v1', '/add-password', array(
            'methods' => 'POST',
            'callback' => array($this, 'add_password'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        register_rest_route('password-manager/v1', '/get-passwords', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_passwords'),
            'permission_callback' => array($this, 'handle_token_validation')

        ));

        register_rest_route('password-manager/v1', '/update-password/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array($this, 'update_password'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        register_rest_route('password-manager/v1', '/delete-password/(?P<id>\d+)', array(
            'methods' => 'DELETE',
            'callback' => array($this, 'delete_password'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        register_rest_route('password-manager/v1', '/get-password/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_password'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));

        register_rest_route('password-manager/v1', '/search-passwords', array(
            'methods' => 'GET',
            'callback' => array($this, 'search_passwords')
        ));

        // New route to check the user session
        register_rest_route('password-manager/v1', '/check-session', array(
            'methods' => 'GET',
            'callback' => array($this, 'check_session'),
            'permission_callback' => array($this, 'validate_session') // Optional if you want to validate session before checking
        ));
    }

    public function handle_token_validation($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if ($user_id) {

            $this->master_password = PM_Helper::get_master_password($request);
            return $this->master_password !== false;
        }
        return false;
    }

    public function validate_session($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }
        return true;
    }

    // New API method to check session validity
    public function check_session($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if ($user_id) {
            return new WP_REST_Response(array('message' => 'Session is valid.', 'status' => 'valid'), 200);
        } else {
            return new WP_REST_Response(array('message' => 'Session has expired or is invalid.', 'status' => 'invalid'), 403);
        }
    }


    public function add_password($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        $master_password = $this->master_password;
        $salt = get_user_meta($user_id, 'pm_salt', true);
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $url = sanitize_text_field($request['url']);
        $note = sanitize_textarea_field($request['note']);

        if (!PM_Helper::is_valid_url($url)) {
            return new WP_REST_Response(array('message' => 'Invalid URL format.'), 400);
        }

        if (!PM_Helper::is_valid_note_length($note)) {
            return new WP_REST_Response(array('message' => 'Note cannot exceed 250 characters.'), 400);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $existing_entry = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM $table_name WHERE url = %s AND user_id = %d",
            $url,
            $user_id
        ));

        $encrypted_username = PM_Helper::encrypt_data($username, $encryption_key);
        $encrypted_password = PM_Helper::encrypt_data($password, $encryption_key);
        $encrypted_note = PM_Helper::encrypt_data($note, $encryption_key);

        if ($existing_entry) {
            // Update the existing entry
            $wpdb->update(
                $table_name,
                array(
                    'username' => $encrypted_username,
                    'password' => $encrypted_password,
                    'note' => $encrypted_note,
                    'url' => $url,

                ),
                array(
                    'id' => $existing_entry->id
                )
            );

            return new WP_REST_Response(array('message' => 'Password updated successfully.'), 200);
        } else {
            // Insert a new entry
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
    }



    public function update_password($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        $password_id = $request['id'];
        $master_password = $this->master_password;

        $salt = get_user_meta($user_id, 'pm_salt', true);
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);
        $username = sanitize_text_field($request->get_param('username'));
        $password = sanitize_text_field($request->get_param('password'));
        $url = $request->get_param('url');
        $note = sanitize_textarea_field($request->get_param('note'));


        // Log incoming request data
        error_log("Request Data: " . print_r($request->get_params(), true));

        // Log the sanitized data
        error_log("Sanitized Data: " . print_r([
            'username' => $username,
            'password' => $password,
            'url' => $url,
            'note' => $note,
        ], true));

        if (!PM_Helper::is_valid_url($url)) {
            return new WP_REST_Response(array('message' => 'Invalid URL format.'), 400);
        }

        if (!PM_Helper::is_valid_note_length($note)) {
            return new WP_REST_Response(array('message' => 'Note cannot exceed 250 characters.'), 400);
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Encrypt data and log it
        $encrypted_username = PM_Helper::encrypt_data($username, $encryption_key);
        $encrypted_password = PM_Helper::encrypt_data($password, $encryption_key);
        $encrypted_note = PM_Helper::encrypt_data($note, $encryption_key);

        error_log("Encrypted Data: " . print_r([
            'username' => $encrypted_username,
            'password' => $encrypted_password,
            'note' => $encrypted_note,
        ], true));

        $wpdb->update(
            $table_name,
            array(
                'username' => $encrypted_username,
                'password' => $encrypted_password,
                'url' => $url,
                'note' => $encrypted_note,
            ),
            array('id' => $password_id)
        );

        return new WP_REST_Response(array('message' => 'Password updated successfully.'), 200);
    }


    public function delete_password($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        $password_id = $request['id'];

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $wpdb->delete($table_name, array('id' => $password_id));

        return new WP_REST_Response(array('message' => 'Password deleted successfully.'), 200);
    }

    public function get_passwords($request)
    {
        // Validate session token and get the user ID
        $user_id = PM_Helper::validate_session_token($request);
        $master_password = $this->master_password;

        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        // Retrieve the user's salt and generate the encryption key
        $salt = get_user_meta($user_id, 'pm_salt', true);
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        // Fetch the password data from the database
        $results = $wpdb->get_results(
            $wpdb->prepare("SELECT id, url, username FROM $table_name WHERE user_id = %d", $user_id),
            ARRAY_A
        );

        // Decrypt the username for each entry
        foreach ($results as &$entry) {
            $entry['username'] = PM_Helper::decrypt_data($entry['username'], $encryption_key);
        }

        return new WP_REST_Response($results, 200);
    }


    public function get_password($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        $password_id = $request['id'];
        $master_password = $this->master_password;

        $salt = get_user_meta($user_id, 'pm_salt', true);
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $result = $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM $table_name WHERE id = %d", $password_id),
            ARRAY_A
        );

        if (!$result) {
            return new WP_REST_Response(array('message' => 'Password not found.'), 404);
        }

        $result['username'] = PM_Helper::decrypt_data($result['username'], $encryption_key);
        $result['password'] = PM_Helper::decrypt_data($result['password'], $encryption_key);
        $result['note'] = PM_Helper::decrypt_data($result['note'], $encryption_key);

        return new WP_REST_Response($result, 200);
    }

    public function search_passwords($request)
    {
        $user_id = PM_Helper::validate_session_token($request);
        if (!$user_id) {
            return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
        }

        $search_term = sanitize_text_field($request['q']);

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $results = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT id, url FROM $table_name WHERE user_id = %d AND (url LIKE %s OR username LIKE %s)",
                $user_id,
                '%' . $wpdb->esc_like($search_term) . '%',
                '%' . $wpdb->esc_like($search_term) . '%'
            ),
            ARRAY_A
        );

        return new WP_REST_Response($results, 200);
    }
}

new Password_API();
