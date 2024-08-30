<?php

if (!defined('ABSPATH')) {
    exit;
}

class PM_Helper
{

    // public static function validate_session_token($request)
    // {
    //     // Step 1: Retrieve all headers
    //     $headers = getallheaders();

    //     // Step 2: Check if the 'X-Session-Token' header is set
    //     if (isset($headers['x-session-token'])) {
    //         // Step 3: Sanitize the session token
    //         $session_token = sanitize_text_field($headers['x-session-token']);

    //         // Step 4: Split the session token into two halves
    //         $token_parts = explode('||', $session_token);

    //         // Step 5: Ensure we have at least two parts
    //         if (count($token_parts) < 2) {
    //             // If the token doesn't split correctly, return false
    //             return false;
    //         }

    //         // Step 6: Use the first half of the session token for further processing
    //         $first_half_token = $token_parts[0];

    //         // Step 7: Get the user ID from the first half of the session token
    //         $user_id = self::get_user_id_from_token($first_half_token);

    //         // Step 8: If the user ID is found, validate the session token expiration
    //         if ($user_id) {
    //             $stored_session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);

    //             // Step 9: Check if the session token is still valid based on expiration time
    //             if ($stored_session_token_expiration && time() < $stored_session_token_expiration) {
    //                 return $user_id;
    //             }
    //         }
    //     }

    //     // Step 10: Return false if validation fails
    //     return false;
    // }


    public static function validate_session_token($request)
    {
        // Step 1: Retrieve all headers
        $headers = getallheaders();
        error_log('Headers retrieved: ' . print_r($headers, true));

        // Step 2: Check if the 'X-Session-Token' header is set
        if (isset($headers['x-session-token'])) {
            error_log('X-Session-Token header is set.');

            // Step 3: Sanitize the session token
            $session_token = sanitize_text_field($headers['x-session-token']);
            error_log('Sanitized session token: ' . $session_token);

            // Step 4: Split the session token into two halves
            $token_parts = explode('||', $session_token);
            error_log('Token parts after split: ' . print_r($token_parts, true));

            // Step 5: Ensure we have at least two parts
            if (count($token_parts) < 2) {
                // If the token doesn't split correctly, return false
                error_log('Token split failed, not enough parts.');
                return false;
            }

            // Step 6: Use the first half of the session token for further processing
            $first_half_token = $token_parts[0];
            error_log('First half of the token: ' . $first_half_token);

            // Step 7: Get the user ID from the first half of the session token
            $user_id = self::get_user_id_from_token($first_half_token);
            error_log('User ID retrieved from token: ' . $user_id);

            // Step 8: If the user ID is found, validate the session token expiration
            if ($user_id) {
                $stored_session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);
                error_log('Stored session token expiration: ' . $stored_session_token_expiration);

                // Step 9: Check if the session token is still valid based on expiration time
                if ($stored_session_token_expiration && time() < $stored_session_token_expiration) {
                    error_log('Session token is valid.');
                    return $user_id;
                } else {
                    // Step 10: Return false if validation fails
                    error_log('Session token validation failed.');
                    return false;
                }
            } else {
                error_log('User ID not found.');
            }
        } else {
            error_log('X-Session-Token header is not set.');
        }
    }



    public static function get_master_password($request)
    {
        // Step 1: Retrieve all headers
        $headers = getallheaders();

        // Step 3: Sanitize the session token
        $session_token = sanitize_text_field($headers['x-session-token']);

        // Step 4: Split the session token into two halves
        $token_parts = explode('||', $session_token);

        // Step 6: Use the first half of the session token for further processing
        $secret_key = $token_parts[1];

        $user_id = self::validate_session_token($request);


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
        error_log("User Id" . $user_id);
        return $user_id ? intval($user_id) : null;
    }

    public static function generate_random_secret_key()
    {
        return bin2hex(random_bytes(32)); // 256-bit secret key
    }

    public static function hash_password($password)
    {
        return password_hash($password, PASSWORD_BCRYPT);
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
