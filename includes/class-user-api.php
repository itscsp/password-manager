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
            'permission_callback' => array('PM_Helper', 'validate_token')
        ));

        register_rest_route('password-manager/v1', '/logout', array(
            'methods' => 'POST',
            'callback' => array('PM_Helper', 'logout_user'),
            'permission_callback' => array('PM_Helper', 'validate_token')
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
        $email = sanitize_email($request['email']);
        $token = sanitize_text_field($request['token']);
        $name = sanitize_text_field($request['name']);
        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);
        $confirm_password = sanitize_text_field($request['confirm_password']);
        $master_key = sanitize_text_field($request['master_key']); // 6-digit master key

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

        // Generate the secret key
        $secret_key = wp_generate_password(32, true, true);

        // Hash the secret key with the master key
        $hashed_secret_key = PM_Helper::hash_data($secret_key, $master_key);
        update_user_meta($user_id, 'pm_secret_key', $hashed_secret_key);


        // Load the email template
        $template_path = PM_PLUGIN_DIR . '/email-templates/user-secreat-key.html';
        $template = file_get_contents($template_path);

        if ($template === false) {
            return new WP_REST_Response(array('message' => 'Email template not found.'), 500);
        }

        // Create the image tag
        $logo_url = plugins_url('email-templates/logo.png', __FILE__); // Correctly get the URL of the logo
        $logo_img_tag = '<img src="' . esc_url($logo_url) . '" alt="Company Logo">';

        // Replace placeholders with actual values
        $template = str_replace('[secret_key]', $secret_key, $template);
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
            'Your Secret Key',
            $template,
            $headers
        );
        delete_transient('pm_verification_token_' . $email);

        return new WP_REST_Response(array('message' => 'User registered successfully. Please check your email for the secret key.', 'user_id' => $user_id), 201);
    }

    // public function login_user($request)
    // {
    //     $username = sanitize_text_field($request['username']);
    //     $provided_secret_key = sanitize_text_field($request['secret_key']);
    //     $password = sanitize_text_field($request['password']);

    //     $user = get_user_by('login', $username);

    //     if (!$user) {
    //         return new WP_REST_Response(array('message' => 'Invalid username.'), 403);
    //     }

    //     // Check the password
    //     $user = wp_authenticate($username, $password);
    //     if (is_wp_error($user)) {
    //         return new WP_REST_Response(array('message' => 'Invalid password.'), 403);
    //     }

    //     // Retrieve and decrypt the stored secret key
    //     $encrypted_secret_key = get_user_meta($user->ID, 'pm_secret_key', true);
    //     $stored_secret_key = PM_Helper::decrypt_key($encrypted_secret_key);

    //     // Compare the provided secret key with the stored secret key
    //     if ($provided_secret_key !== $stored_secret_key) {
    //         return new WP_REST_Response(array('message' => 'Invalid secret key.'), 403);
    //     }

    //     // Generate a session token
    //     $session_token = PM_Helper::generate_session_token($user->ID);

    //     // Return the session token
    //     return new WP_REST_Response(array('message' => 'User logged in successfully.', 'token' => $session_token), 200);
    // }

    public function login_user($request)
    {
        $username = sanitize_text_field($request['username']);
        $provided_secret_key = sanitize_text_field($request['secret_key']);
        $master_key = sanitize_text_field($request['master_key']); // 6-digit master key
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

        // Retrieve the stored hashed secret key
        $hashed_secret_key = get_user_meta($user->ID, 'pm_secret_key', true);

        // Compare the provided hashed secret key with the stored hashed secret key
        if (!PM_Helper::verify_hash($provided_secret_key, $master_key, $hashed_secret_key)) {
            return new WP_REST_Response(array('message' => 'Invalid secret key or master key.'), 403);
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
