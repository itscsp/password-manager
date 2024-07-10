<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class User_API {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_api_routes' ) );
    }

    public function register_api_routes() {
        register_rest_route('password-manager/v1', '/register', array(
            'methods' => 'POST',
            'callback' => array($this, 'register_user'),
        ));

        register_rest_route('password-manager/v1', '/login', array(
            'methods' => 'POST',
            'callback' => array($this, 'login_user'),
        ));

        register_rest_route('password-manager/v1', '/verify-email', array(
            'methods' => 'GET',
            'callback' => array($this, 'verify_email'),
        ));
    }

    public function register_user($request) {
        $username = sanitize_text_field($request['username']);
        $email = sanitize_email($request['email']);
        $password = sanitize_text_field($request['password']);
        $role = 'subscriber'; // Define the role here, e.g., 'subscriber'

        if (username_exists($username) || email_exists($email)) {
            return new WP_REST_Response(array('message' => 'Username or email already exists.'), 409);
        }

        $user_id = wp_create_user($username, $password, $email);

        if (is_wp_error($user_id)) {
            return new WP_REST_Response(array('message' => $user_id->get_error_message()), 500);
        }

        // Set the user role
        $user = new WP_User($user_id);
        $user->set_role($role);

        // Generate a verification token and save it as user meta
        $verification_token = wp_generate_password(32, false);
        update_user_meta($user_id, 'pm_verification_token', $verification_token);
        update_user_meta($user_id, 'pm_email_verified', 0);

        // Send verification email
        $verification_url = add_query_arg(array(
            'token' => $verification_token,
            'user_id' => $user_id,
        ), site_url(PM_FRONTEND_URL.'/user/verify'));

        wp_mail(
            $email,
            'Email Verification',
            "Please click the following link to verify your email address: $verification_url"
        );

        return new WP_REST_Response(array('message' => 'User registered successfully. Please check your email to verify your account.', 'user_id' => $user_id), 201);
    }

    public function login_user($request) {
        $username = sanitize_text_field($request['username']);
        $password = sanitize_text_field($request['password']);

        $user = wp_authenticate($username, $password);

        if (is_wp_error($user)) {
            return new WP_REST_Response(array('message' => 'Invalid username or password.'), 403);
        }

        // Check if the user's email is verified
        $email_verified = get_user_meta($user->ID, 'pm_email_verified', true);
        if ($email_verified != 1) {
            return new WP_REST_Response(array('message' => 'Email not verified.'), 403);
        }

        // Generate and return a token or session identifier here
        // For simplicity, we'll return a success message

        return new WP_REST_Response(array('message' => 'User logged in successfully.'), 200);
    }

    public function verify_email($request) {
        $token = sanitize_text_field($request['token']);
        $user_id = sanitize_text_field($request['user_id']);

        $saved_token = get_user_meta($user_id, 'pm_verification_token', true);

        if ($saved_token === $token) {
            update_user_meta($user_id, 'pm_email_verified', 1);
            delete_user_meta($user_id, 'pm_verification_token');
            return new WP_REST_Response(array('message' => 'Email verified successfully.'), 200);
        } else {
            return new WP_REST_Response(array('message' => 'Invalid verification token.'), 400);
        }
    }
}

new User_API();
