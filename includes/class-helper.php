<?php

if (!defined('ABSPATH')) {
    exit;
}

class PM_Helper
{
    private static $master_key;

    public static function init()
    {
        self::$master_key = getenv('MASTER_KEY'); // Ensure you have set this in your server environment
    }

    public static function encrypt_key($key)
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-gcm'));
        $tag = null;
        $encrypted_key = openssl_encrypt($key, 'aes-256-gcm', self::$master_key, OPENSSL_RAW_DATA, $iv, $tag);
        return base64_encode($encrypted_key . '::' . $iv . '::' . $tag);
    }

    public static function decrypt_key($encrypted_key)
    {
        list($encrypted_data, $iv, $tag) = explode('::', base64_decode($encrypted_key), 3);
        return openssl_decrypt($encrypted_data, 'aes-256-gcm', self::$master_key, OPENSSL_RAW_DATA, $iv, $tag);
    }

    public static function generate_session_token($user_id)
    {
        $session_token = wp_generate_password(32, false);
        update_user_meta($user_id, 'pm_session_token', $session_token);
        update_user_meta($user_id, 'pm_session_token_expiration', time() + 600); // 10 minutes expiration
        return $session_token;
    }

    public static function get_user_id_from_token($token)
    {
        global $wpdb;
        $user_id = $wpdb->get_var($wpdb->prepare(
            "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value = %s",
            'pm_session_token',
            $token
        ));

        return $user_id ? intval($user_id) : null;
    }

    public static function validate_token($request)
    {
        $headers = getallheaders();
        // if (isset($headers['X-Session-Token'])) {
        //     $session_token = sanitize_text_field($headers['X-Session-Token']);
        //     $user_id = self::get_user_id_from_token($session_token);
        //     if ($user_id) {
        //         return true;
        //     }
        // }
        // return false;

        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = self::get_user_id_from_token($session_token);
            if ($user_id) {
                // Validate the session token
                $stored_session_token = get_user_meta($user_id, 'pm_session_token', true);
                $session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);

                if ($stored_session_token !== $session_token || time() > $session_token_expiration) {
                    self::logout_user($request);
                    return new WP_REST_Response(array('message' => 'Invalid or expired session token.'), 403);
                }

                // Renew the session token expiration
                update_user_meta($user_id, 'pm_session_token_expiration', time() + 600); // 10 minutes expiration

                return true;
            }
        }

        return false;
    }

    public static function encrypt_data($data, $secret_key)
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-128-gcm'));
        $tag = null;
        $encrypted_data = openssl_encrypt($data, 'aes-128-gcm', $secret_key, OPENSSL_RAW_DATA, $iv, $tag);
        return base64_encode($encrypted_data . '::' . $iv . '::' . $tag);
    }

    public static function decrypt_data($encrypted_data, $secret_key)
    {
        list($encrypted_data, $iv, $tag) = explode('::', base64_decode($encrypted_data), 3);
        return openssl_decrypt($encrypted_data, 'aes-128-gcm', $secret_key, OPENSSL_RAW_DATA, $iv, $tag);
    }

    public static function logout_user($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = self::get_user_id_from_token($session_token);
            if ($user_id) {
                delete_user_meta($user_id, 'pm_session_token');
                delete_user_meta($user_id, 'pm_session_token_expiration');
                return new WP_REST_Response(array('message' => 'User logged out successfully.'), 200);
            }
        }
        return new WP_REST_Response(array('message' => 'Invalid session token.'), 403);
    }
}

PM_Helper::init();
