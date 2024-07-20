<?php

if (!defined('ABSPATH')) {
    exit;
}

class User_API
{
    private $master_key;

    public function __construct()
    {
        $this->master_key = 'Qf2P£oz@m?x27``cJ_,voJZF(wvi*4j3b2]e'; // Ensure you have set this in your server environment
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
            'permission_callback' => array($this, 'validate_token')
        ));

        register_rest_route('password-manager/v1', '/logout', array(
            'methods' => 'POST',
            'callback' => array($this, 'logout_user'),
            'permission_callback' => array($this, 'validate_token')
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

        wp_mail(
            $email,
            'Email Verification',
            "Please click the following link to verify your email address: $verification_url"
        );

        return new WP_REST_Response(array('message' => 'Verification email sent. Please check your email.'), 200);
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
        return new WP_REST_Response(array('message' => PM_FRONTEND_URL . '/complete-registration?email=' . urlencode($email) . '&token=' . urlencode($token)),200);
        exit;
    }

    public function complete_registration($request)
    {
        $email = sanitize_email($request['email']);
        $token = sanitize_text_field($request['token']);
        $name = sanitize_text_field($request['name']);
        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $confirm_password = sanitize_text_field($request['confirm_password']);

        if ($password !== $confirm_password) {
            return new WP_REST_Response(array('message' => 'Passwords do not match.'), 400);
        }

        $saved_token = get_transient('pm_verification_token_' . $email);

        if ($saved_token !== $token) {
            return new WP_REST_Response(array('message' => 'Invalid or expired verification token.'), 400);
        }

        if (username_exists($username) || email_exists($email)) {
            return new WP_REST_Response(array('message' => 'Username or email already exists.'), 409);
        }

        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return new WP_REST_Response(array('message' => $user_id->get_error_message()), 500);
        }

        // Set the user role and additional information
        $user = new WP_User($user_id);
        $user->set_role('password_owner');
        update_user_meta($user_id, 'first_name', $name);

        // Generate and send the secret key via email
        $secret_key = wp_generate_password(32, true, true);
        $encrypted_secret_key = $this->encrypt_key($secret_key);
        update_user_meta($user_id, 'pm_secret_key', $encrypted_secret_key);
        wp_mail($email, 'Your Secret Key', "Here is your secret key: $secret_key");

        delete_transient('pm_verification_token_' . $email);

        return new WP_REST_Response(array('message' => 'User registered successfully. Please check your email for the secret key.', 'user_id' => $user_id), 201);
    }

    private function encrypt_key($key)
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-gcm'));
        $tag = null;
        $encrypted_key = openssl_encrypt($key, 'aes-256-gcm', $this->master_key, OPENSSL_RAW_DATA, $iv, $tag);
        return base64_encode($encrypted_key . '::' . $iv . '::' . $tag);
    }

    private function decrypt_key($encrypted_key)
    {
        list($encrypted_data, $iv, $tag) = explode('::', base64_decode($encrypted_key), 3);
        return openssl_decrypt($encrypted_data, 'aes-256-gcm', $this->master_key, OPENSSL_RAW_DATA, $iv, $tag);
    }

    public function login_user($request)
    {
        $username = sanitize_text_field($request['username']);
        $provided_secret_key = sanitize_text_field($request['secret_key']);
        $password = sanitize_text_field($request['password']);

        $user = get_user_by('login', $username);

        if (!$user) {
            return new WP_REST_Response(array('message' => 'Invalid username.'), 403);
        }

        // Check the password
        $user = wp_authenticate($username, $password);
        if (is_wp_error($user)) {
            return new WP_REST_Response(array('message' => 'Invalid password.'), 403);
        }

        // Retrieve and decrypt the stored secret key
        $encrypted_secret_key = get_user_meta($user->ID, 'pm_secret_key', true);
        $stored_secret_key = $this->decrypt_key($encrypted_secret_key);

        // Compare the provided secret key with the stored secret key
        if ($provided_secret_key !== $stored_secret_key) {
            return new WP_REST_Response(array('message' => 'Invalid secret key.'), 403);
        }

        // Generate a session token
        $session_token = $this->generate_session_token($user->ID);

        // Return the session token
        return new WP_REST_Response(array('message' => 'User logged in successfully.', 'token' => $session_token), 200);
    }

    public function refresh_session($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = $this->get_user_id_from_token($session_token);
            if ($user_id) {
                // Validate the session token
                $stored_session_token = get_user_meta($user_id, 'pm_session_token', true);
                $session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);

                if ($stored_session_token !== $session_token || time() > $session_token_expiration) {
// If token is invalid or expired, log the user out
                    $this->logout_user($request);
                    return new WP_REST_Response(array('message' => 'Invalid or expired session token.'), 403);
                }

                // Renew the session token expiration
                update_user_meta($user_id, 'pm_session_token_expiration', time() + 600); // 10 minutes expiration

                return new WP_REST_Response(array('message' => 'Session refreshed.', 'session_token' => $session_token), 200);
            }
        }

        return new WP_REST_Response(array('message' => 'Unauthorized'), 401);
    }

    private function generate_session_token($user_id)
    {
        $session_token = wp_generate_password(32, false);
        update_user_meta($user_id, 'pm_session_token', $session_token);
        update_user_meta($user_id, 'pm_session_token_expiration', time() + 600); // 10 minutes expiration
        return $session_token;
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

    public function validate_token($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = $this->get_user_id_from_token($session_token);
            if ($user_id) {
                // Validate the session token
                $stored_session_token = get_user_meta($user_id, 'pm_session_token', true);
                $session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);

                if ($stored_session_token === $session_token && time() <= $session_token_expiration) {
                    return true;
                } else{
                    $this->logout_user($request);
                }
            }
        }
        return false;
    }

    public function logout_user($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = $this->get_user_id_from_token($session_token);
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