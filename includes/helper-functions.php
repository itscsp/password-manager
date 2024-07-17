<?php

function encrypt_password($password, $encryption_key)
{
    return openssl_encrypt($password, 'aes-128-cbc', $encryption_key, 0, $encryption_key);
}

function decrypt_password($encrypted_password, $encryption_key)
{
    return openssl_decrypt($encrypted_password, 'aes-128-cbc', $encryption_key, 0, $encryption_key);
}

function get_user_id_from_token($token)
{
    global $wpdb;
    $user_id = $wpdb->get_var($wpdb->prepare(
        "SELECT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s AND meta_value = %s",
        'pm_session_token',
        $token
    ));

    return $user_id ? intval($user_id) : null;
}