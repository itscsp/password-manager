<?php

if (!defined('ABSPATH')) {
    exit;
}

class User_API
{
    private $master_password;

    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_api_routes'));
    }

    public function register_api_routes()
    {
        register_rest_route('password-manager/v1', '/start-registration', array(
            'methods' => 'POST',
            'callback' => array($this, 'start_registration'),
        ));

        register_rest_route('password-manager/v1', '/verify-email', array(
            'methods' => 'GET',
            'callback' => array($this, 'verify_email'),
        ));

        register_rest_route('password-manager/v1', '/complete-registration', array(
            'methods' => 'POST',
            'callback' => array($this, 'complete_registration'),
        ));

        register_rest_route('password-manager/v1', '/login', array(
            'methods' => 'POST',
            'callback' => array($this, 'login_user'),
        ));


        register_rest_route('password-manager/v1', '/logout', array(
            'methods' => 'POST',
            'callback' => array($this, 'logout_user'),
            'permission_callback' => array($this, 'handle_token_validation')
        ));
    }


    public function start_registration($request)
    {
        $email = sanitize_email($request['email']);

        if (!is_email($email)) {
            return new WP_REST_Response(array('message' => 'Invalid email address.'), 400);
        }

        if (email_exists($email)) {
            return new WP_REST_Response(array('message' => 'Email already exists.'), 409);
        }

        // Generate a 6-digit numeric verification token
        $verification_token = str_pad(mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        set_transient('pm_verification_token_' . $email, $verification_token, 3600); // 1 hour expiration

        $token = $verification_token;
        $mailID = $email;

        // Load the email template
        $template_path = PM_PLUGIN_DIR . '/email-templates/welcome-email.html';
        $template = file_get_contents($template_path);

        if ($template === false) {
            return new WP_REST_Response(array('message' => 'Email template not found.'), 500);
        }

        // Create the image tag
        $logo_url = get_site_url() . '/wp-content/plugins/password-manager/email-templates/logo.png';
        $logo_img_tag = '<img src="' . esc_url($logo_url) . '" alt="Company Logo">';

        // Replace placeholders with actual values
        $template = str_replace('[token]', $token, $template);
        $template = str_replace('[mailid]', $mailID, $template);
        $template = str_replace('[logo_img_tag]', $logo_img_tag, $template);

        $headers = array('Content-Type: text/html; charset=UTF-8');

        // Set the "From" name and email
        add_filter('wp_mail_from', function ($original_email_address) {
            return 'onepass@chethanspoojary.com';
        });
        add_filter('wp_mail_from_name', function ($original_email_from) {
            return '*|OnePass';
        });

        wp_mail(
            $email,
            'Email Verification',
            $template,
            $headers
        );

        return new WP_REST_Response(array('message' => 'Verification email sent. Please check your email.'), 200);
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


    public function verify_email($request)
    {
        $token = sanitize_text_field($request['token']);
        $email = sanitize_email($request['email']);

        $saved_token = get_transient('pm_verification_token_' . $email);

        if ($saved_token !== $token) {
            return new WP_REST_Response(array('message' => 'Invalid or expired verification token.'), 400);
        }

        // Redirect to the frontend registration page with the email and token as query parameters
        // wp_redirect(PM_FRONTEND_URL . '/complete-registration?email=' . urlencode($email) . '&token=' . urlencode($token));
        return new WP_REST_Response(array('message' => "Email Verfied"), 200);
    }



    public function complete_registration($request)
    {
        // Sanitize input data
        $name = sanitize_text_field($request['name']);
        $token = sanitize_text_field($request['token']);
        $master_password = sanitize_text_field($request['master_password']);
        $confirm_master_password = sanitize_text_field($request['confirm_master_password']);
        $email = sanitize_email($request['email']);
        $username = $email; // Assign email as username

        // Check if passwords match
        if ($master_password !== $confirm_master_password) {
            return new WP_REST_Response(array('message' => 'Passwords do not match.'), 400);
        }

        // Retrieve and validate the saved token
        $saved_token = get_transient('pm_verification_token_' . $email);
        if ($saved_token !== $token) {
            return new WP_REST_Response(array('message' => 'Invalid or expired verification token.'), 400);
        }

        // Check if the username or email already exists
        if (username_exists($username) || email_exists($email)) {
            return new WP_REST_Response(array('message' => 'Username or email already exists.'), 409);
        }

        // Generate a secure password for the user
        $password = wp_generate_password(32, false);

        // Hash the master password for storage
        $hashed_master_password = PM_Helper::hash_password($master_password);

        // Generate a salt and encryption key based on the master password
        $salt = bin2hex(random_bytes(16));
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        // Generate and encrypt a secret key
        $secret_key = PM_Helper::generate_random_secret_key();
        $encrypted_secret_key = PM_Helper::encrypt_data($secret_key, $encryption_key);

        // Create the WordPress user
        $user_id = wp_create_user($username, $password, $email);

        // Check for errors during user creation
        if (is_wp_error($user_id)) {
            return new WP_REST_Response(array('message' => $user_id->get_error_message()), 500);
        }

        // Assign the user role and store additional user data
        $user = new WP_User($user_id);
        $user->set_role('password_owner');
        update_user_meta($user_id, 'first_name', $name);

        // Store hashed password, encrypted secret key, and salt in user meta
        update_user_meta($user_id, 'pm_hashed_master_password', $hashed_master_password);
        update_user_meta($user_id, 'pm_encrypted_secret_key', $encrypted_secret_key);
        update_user_meta($user_id, 'pm_salt', $salt);

        // Clean up the transient token after successful registration
        delete_transient('pm_verification_token_' . $email);

        // Return a successful response
        return new WP_REST_Response(array('message' => 'User registered successfully.', 'user_id' => $user_id), 200);
    }



    public function login_user($request)
    {
        $username = sanitize_text_field($request['username']);
        $master_password = sanitize_text_field($request['master_password']); // Strong master password

        // Authenticate user by username
        $user = get_user_by('login', $username);
        if (!$user || is_wp_error($user)) {
            return new WP_REST_Response(array('message' => 'Invalid username.'), 403);
        }

        // Retrieve the stored hashed master password, encrypted secret key, and salt
        $hashed_master_password = get_user_meta($user->ID, 'pm_hashed_master_password', true);

        // Verify the provided master password
        if (!PM_Helper::verify_password($master_password, $hashed_master_password)) {
            return new WP_REST_Response(array('message' => 'Invalid master password.'), 403);
        }

        // Generate a session token
        $session_token = PM_Helper::generate_session_token($user->ID);

        // Get the first name from user meta
        $first_name = get_user_meta($user->ID, 'first_name', true);

        // Return the username, first name, and session token
        return new WP_REST_Response(
            array(
                'message' => 'User logged in successfully.',
                'username' => $username,
                'first_name' => $first_name,
                'token' => $session_token,
            ),
            200
        );
    }



    /**
     * Handle user logout.
     */
    public function logout_user($request)
    {
        $headers = getallheaders();
        if (isset($headers['x-session-token'])) {

            $session_token = sanitize_text_field($headers['x-session-token']);


            // Step 4: Split the session token into two halves
            $token_parts = explode('||', $session_token);

            // Step 6: Use the first half of the session token for further processing
            $secret_key = $token_parts[0];
            error_log('Token'.$secret_key);

            $user_id = PM_Helper::get_user_id_from_token($secret_key);
            if ($user_id) {
                delete_user_meta($user_id, 'pm_session_token');
                delete_user_meta($user_id, 'pm_session_token_expiration');
                return new WP_REST_Response(array('message' => 'User logged out successfully.'), 200);
            }
        }
        return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
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
}

new User_API();
