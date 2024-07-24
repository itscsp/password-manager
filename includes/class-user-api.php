<?php

if (!defined('ABSPATH')) {
    exit;
}

class User_API
{
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

        register_rest_route('password-manager/v1', '/refresh-session', array(
            'methods' => 'POST',
            'callback' => array($this, 'refresh_session'),
            'permission_callback' => array($this, 'handle_token_validation')
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

        $verification_token = wp_generate_password(32, false);
        set_transient('pm_verification_token_' . $email, $verification_token, 3600); // 1 hour expiration

        $verification_url = add_query_arg(array(
            'token' => $verification_token,
            'email' => $email,
        ), site_url('/wp-json/password-manager/v1/verify-email'));

        // Load the email template
        $template_path = PM_PLUGIN_DIR . '/email-templates/welcome-email.html';
        $template = file_get_contents($template_path);

        if ($template === false) {
            return new WP_REST_Response(array('message' => 'Email template not found.'), 500);
        }

        // Create the image tag
        $logo_url = plugins_url('email-templates/logo.png', __FILE__); // Correctly get the URL of the logo
        $logo_img_tag = '<img src="' . esc_url($logo_url) . '" alt="Company Logo">';

        // Replace placeholders with actual values
        $template = str_replace('[verification_url]', esc_url($verification_url), $template);
        $template = str_replace('[logo_img_tag]', $logo_img_tag, $template);

        $headers = array('Content-Type: text/html; charset=UTF-8');
        //   Set the "From" name and email
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
        if (PM_Helper::validate_token($request)) {
            // Token is valid
            return true;
        } else {
            // Token is invalid or expired
            return new WP_Error('rest_forbidden', 'Invalid or expired session token.', array('status' => 403));
        }
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
        return new WP_REST_Response(array('message' => PM_FRONTEND_URL . '/complete-registration?email=' . urlencode($email) . '&token=' . urlencode($token)), 200);
    }



    public function complete_registration($request)
    {
        $name = sanitize_text_field($request['name']);
        $token = sanitize_text_field($request['token']);
        $master_password = sanitize_text_field($request['master_password']);
        $confirm_master_password = sanitize_text_field($request['confirm_master_password']);

        $email = sanitize_email($request['email']);
        $username = $email; // We are assigning master email as username

        if ($master_password !== $confirm_master_password) {
            return new WP_REST_Response(array('message' => 'Passwords do not match.'), 400);
        }

        $saved_token = get_transient('pm_verification_token_' . $email);

        if ($saved_token !== $token) {
            return new WP_REST_Response(array('message' => 'Invalid or expired verification token.'), 400);
        }

        if (username_exists($username) || email_exists($email)) {
            return new WP_REST_Response(array('message' => 'Username or email already exists.'), 409);
        }
        $password = wp_generate_password(32, false);
        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return new WP_REST_Response(array('message' => $user_id->get_error_message()), 500);
        }

        // Set the user role and additional information
        $user = new WP_User($user_id);
        $user->set_role('password_owner');
        update_user_meta($user_id, 'first_name', $name);

        // Hash the master password for future validation
        $hashed_master_password = PM_Helper::hash_password($master_password);

        // Generate the salt and encryption key from the master password
        $salt = bin2hex(random_bytes(16));
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);

        // Generate the secret key and encrypt it
        $secret_key = PM_Helper::generate_random_secret_key();
        $encrypted_secret_key = PM_Helper::encrypt_data($secret_key, $encryption_key);

        // Store the hashed master password, encrypted secret key, and salt in user meta
        update_user_meta($user_id, 'pm_hashed_master_password', $hashed_master_password);
        update_user_meta($user_id, 'pm_encrypted_secret_key', $encrypted_secret_key);
        update_user_meta($user_id, 'pm_salt', $salt);
        delete_transient('pm_verification_token_' . $email);

        return new WP_REST_Response(array('message' => 'User registered successfully.', 'user_id' => $user_id), 201);
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
        $encrypted_secret_key = get_user_meta($user->ID, 'pm_encrypted_secret_key', true);
        $salt = get_user_meta($user->ID, 'pm_salt', true);

        // Verify the provided master password
        if (!PM_Helper::verify_password($master_password, $hashed_master_password)) {
            return new WP_REST_Response(array('message' => 'Invalid master password.'), 403);
        }

        // Generate the encryption key from the master password and salt
        $encryption_key = PM_Helper::generate_encryption_key($master_password, $salt);
        error_log('Encryption key generated: ' . bin2hex($encryption_key)); // Debugging statement

        // Decrypt the stored secret key using the derived encryption key
        $decrypted_secret_key = PM_Helper::decrypt_data($encrypted_secret_key, $encryption_key);
        error_log('Decrypted secret key: ' . $decrypted_secret_key); // Debugging statement

        // If decryption failed, consider the login attempt as failed
        if ($decrypted_secret_key === false) {
            error_log('Decryption failed for user ID: ' . $user->ID); // Debugging statement
            return new WP_REST_Response(array('message' => 'Invalid secret key or decryption failed.'), 403);
        }

        // Generate a session token
        $session_token = PM_Helper::generate_session_token($user->ID);

        // Return the session token
        return new WP_REST_Response(array('message' => 'User logged in successfully.', 'token' => $session_token), 200);
    }




    public function refresh_session($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = PM_Helper::get_user_id_from_token($session_token);
            if ($user_id) {
                // Validate the session token
                $stored_session_token = get_user_meta($user_id, 'pm_session_token', true);
                $session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);

                if ($stored_session_token !== $session_token || time() > $session_token_expiration) {
                    return new WP_REST_Response(array('message' => 'Invalid or expired session token.'), 403);
                }

                // Renew the session token expiration
                update_user_meta($user_id, 'pm_session_token_expiration', time() + 600); // 10 minutes expiration

                return new WP_REST_Response(array('message' => 'Session refreshed.', 'session_token' => $session_token), 200);
            }
        }

        return new WP_REST_Response(array('message' => 'Unauthorized'), 401);
    }

    public function reset_master_password($request)
    {
        $username = sanitize_text_field($request['username']);
        $backup_code = sanitize_text_field($request['backup_code']);
        $new_master_password = sanitize_text_field($request['new_master_password']);

        // Authenticate user by username
        $user = get_user_by('login', $username);
        if (!$user || is_wp_error($user)) {
            return new WP_REST_Response(array('message' => 'Invalid username.'), 403);
        }

        // Retrieve the stored backup codes
        $stored_backup_codes = json_decode(get_user_meta($user->ID, 'pm_backup_codes', true), true);

        // Verify the backup code
        if (!in_array($backup_code, $stored_backup_codes)) {
            return new WP_REST_Response(array('message' => 'Invalid backup code.'), 403);
        }

        // Remove the used backup code
        $stored_backup_codes = array_diff($stored_backup_codes, [$backup_code]);
        update_user_meta($user->ID, 'pm_backup_codes', json_encode($stored_backup_codes));

        // Hash the new master password
        $hashed_master_password = PM_Helper::hash_password($new_master_password);

        // Generate a new salt and encryption key from the new master password
        $salt = bin2hex(random_bytes(16));
        $encryption_key = PM_Helper::generate_encryption_key($new_master_password, $salt);

        // Retrieve the current encrypted secret key
        $encrypted_secret_key = get_user_meta($user->ID, 'pm_encrypted_secret_key', true);

        // Decrypt the secret key using the old encryption key
        $old_encryption_key = PM_Helper::generate_encryption_key($new_master_password, $salt);
        $secret_key = PM_Helper::decrypt_data($encrypted_secret_key, $old_encryption_key);

        // Encrypt the secret key using the new encryption key
        $new_encrypted_secret_key = PM_Helper::encrypt_data($secret_key, $encryption_key);

        // Store the new hashed master password, encrypted secret key, and salt in user meta
        update_user_meta($user->ID, 'pm_hashed_master_password', $hashed_master_password);
        update_user_meta($user->ID, 'pm_encrypted_secret_key', $new_encrypted_secret_key);
        update_user_meta($user->ID, 'pm_salt', $salt);

        return new WP_REST_Response(array('message' => 'Master password reset successfully.'), 200);
    }



    public function logout_user($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = PM_Helper::get_user_id_from_token($session_token);
            if ($user_id) {
                delete_user_meta($user_id, 'pm_session_token');
                delete_user_meta($user_id, 'pm_session_token_expiration');
                return new WP_REST_Response(array('message' => 'User logged out successfully.'), 200);
            }
        }
        return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
    }
}

new User_API();
