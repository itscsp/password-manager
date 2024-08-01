<?php

if (!defined('ABSPATH')) {
    exit;
}

class PM_Helper
{
    public static function generate_encryption_key($password, $salt)
    {
        $iterations = 10000;
        $key_length = 32; // 256-bit key
        return hash_pbkdf2('sha256', $password, $salt, $iterations, $key_length, true);
    }

    public static function encrypt_data($data, $key)
    {
        $iv = openssl_random_pseudo_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted_data = openssl_encrypt($data, 'aes-256-cbc', $key, 0, $iv);
        return base64_encode($encrypted_data . '::' . $iv);
    }

    public static function decrypt_data($data, $key)
    {
        list($encrypted_data, $iv) = explode('::', base64_decode($data), 2);
        return openssl_decrypt($encrypted_data, 'aes-256-cbc', $key, 0, $iv);
    }

    public static function generate_random_secret_key()
    {
        return bin2hex(random_bytes(32)); // 256-bit secret key
    }

    public static function hash_password($password)
    {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    public static function verify_password($password, $hash)
    {
        return password_verify($password, $hash);
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
        if (isset($headers['X-Session-Token'])) {
            $session_token = sanitize_text_field($headers['X-Session-Token']);
            $user_id = self::get_user_id_from_token($session_token);
            if ($user_id) {
                // Validate the session token
                $stored_session_token = get_user_meta($user_id, 'pm_session_token', true);
                $session_token_expiration = get_user_meta($user_id, 'pm_session_token_expiration', true);

                if ($stored_session_token !== $session_token || time() > $session_token_expiration) {
                    return false; // Session token is invalid or expired
                }

                // Renew the session token expiration
                update_user_meta($user_id, 'pm_session_token_expiration', time() + 600); // 10 minutes expiration

                return true; // Session token is valid
            }
        }

        return false; // Unauthorized
    }

    public static function is_valid_url($url)
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    public static function is_valid_note_length($note)
    {
        return strlen($note) <= 250;
    }

    /**
     * Generate a set of backup codes.
     *
     * @param int $count Number of backup codes to generate.
     * @return array Array of backup codes.
     */
    public static function generate_backup_codes($count = 5)
    {
        $backup_codes = [];
        for ($i = 0; $i < $count; $i++) {
            $backup_codes[] = wp_generate_password(12, false); // Generate a 12-character long code
        }
        return $backup_codes;
    }

    // This function can be used for initializing any settings or properties.
    public static function init()
    {
        // Placeholder for any initialization logic if needed
    }
}

PM_Helper::init();
