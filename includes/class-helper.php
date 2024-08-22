<?php

if (!defined('ABSPATH')) {
    exit;
}

class PM_Helper
{



    public static function validate_session_token($request)
    {
        $headers = getallheaders();
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = self::get_user_id_from_token($session_token);

            if ($user_id) {
                // Validate the session token expiration
                $stored_session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);
                if ($stored_session_token_expiration && time() < $stored_session_token_expiration) {
                    return $user_id;
                }
            }
        }
        return false;
    }


    public static function get_master_password($request)
    {


        $secret_key = sanitize_text_field($request['token']);

        $user_id = self::validate_session_token($request);


        // // Retrieve the headers 
        // $headers = getallheaders();

        // // Extract the token from the headers
        // $secret_key = isset($headers['Authorization']) ? trim(str_replace('Bearer', '', $headers['Authorization'])) : '';

        // // Log the session token
        // error_log('Received session token from headers: ' . $secret_key);


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

        $key_bytes = hex2bin($key); // Convert hex key to bytes
        $iv_bytes = base64_decode($iv); // Convert base64 IV to bytes
        $encrypted_data_bytes = base64_decode($encrypted_data); // Convert base64 encrypted data to bytes

        // Decrypt the data
        $decrypted_data = openssl_decrypt(
            $encrypted_data_bytes,
            'aes-256-cbc',
            $key_bytes,
            OPENSSL_RAW_DATA,
            $iv_bytes
        );

        if ($decrypted_data === false) {
            // If the session token is expired, delete it
            delete_user_meta($user_id, 'pm_session_token');
            delete_user_meta($user_id, 'pm_session_token_expiration');
            return false;

        }

        return $decrypted_data;
    }




    public static function generate_encryption_key($master_password, $salt)
    {
        return hash_pbkdf2('sha256', $master_password, $salt, 100000, 32, true);
    }



    public static function get_user_id_from_token($session_token)
    {
        global $wpdb;
        $user_id = $wpdb->get_var($wpdb->prepare(
            "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value = %s",
            'pm_session_token',
            $session_token
        ));

        return $user_id ? intval($user_id) : null;
    }

    public static function verify_password($password, $hashed_password)
    {
        return password_verify($password, $hashed_password);
    }

    public static function is_valid_url($url)
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    public static function is_valid_note_length($note)
    {
        return strlen($note) <= 250;
    }


    public static function generate_session_token($user_id)
    {
        $session_token = wp_generate_password(32, false);
        update_user_meta($user_id, 'pm_session_token', $session_token);
        update_user_meta($user_id, 'pm_session_token_expiration', time() + 600); // 10 minutes expiration
        return $session_token;
    }

    public static function encrypt_data($data, $encryption_key)
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted_data = openssl_encrypt(
            $data,
            'aes-256-cbc',
            $encryption_key,
            OPENSSL_RAW_DATA,
            $iv
        );
        return base64_encode($iv . $encrypted_data);
    }

    public static function decrypt_data($encrypted_data, $encryption_key)
    {
        $data = base64_decode($encrypted_data);
        $iv = substr($data, 0, openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted_data = substr($data, openssl_cipher_iv_length('aes-256-cbc'));
        return openssl_decrypt($encrypted_data, 'aes-256-cbc', $encryption_key, OPENSSL_RAW_DATA, $iv);
    }

    // This function can be used for initializing any settings or properties.
    public static function init()
    {
        // Placeholder for any initialization logic if needed
    }
}
