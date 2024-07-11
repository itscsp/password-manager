<?php

if ( ! defined( 'ABSPATH' )) {
    exit;
}


class User_API{

    public function __construct()
    {
        add_action( 'rest_api_init', array($this, 'register_api_routes') );
    }

    public function register_api_routes(){
        register_rest_route('password-manager/v1', '/start-registration', array(
            'methods' => 'POST',
            'callback' => array($this, 'start_registration'),
        ));
    } 

    public function start_registration($request) {
        $email = sanitize_email($request['email']);

        if(!is_email($email)){
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
        ), PM_FRONTEND_URL.'/user/verify');// Email Verification: /wp-json/password-manager/v1/verify-email
        
        wp_mail(
            $email,
            'Email Verification',
            "Please click the following link to verify your email address: $verification_url"
        );

        return new WP_REST_Response(array('message' => 'Verification email sent. Please check your email.'), 200);
    }

}

new User_API();