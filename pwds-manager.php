<?php

/**
 * Plugin Name: Password Manager
 * Description: Passwords Manager lets you store all your passwords in one place.
 * Version: 1.0
 * Author: Chethan S Poojary
 * Author URI: https://www.chethanspoojary.com
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Define plugin paths
 */
define('PM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PM_PLUGIN_DIR', dirname(__FILE__));
define('PM_INC', PM_PLUGIN_DIR . '/includes/');
define('PM_FRONTEND_URL', 'http://localhost:8080/');
define('ROUTE_URL', 'password-manager/v1');

/**
 * Create Database table for plugin activation
 */
if (!function_exists('pm_db_install')) {
    function pm_db_install()
    {
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            username varchar(255) NOT NULL,
            password text NOT NULL,
            url varchar(255),
            note text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
            PRIMARY KEY  (id)
        ) $charset_collate;";

        dbDelta($sql);

        // Create the custom user role
        add_role('password_owner', 'Password Owner', array(
            'read' => true,
            'edit_posts' => false,
            'delete_posts' => false,
        ));
    }

    // Activation hook.
    register_activation_hook(__FILE__, 'pm_db_install');
}

/**
 * Deactivation hook
 */
if (!function_exists('pm_deactivate_plugin')) {
    function pm_deactivate_plugin()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $sql = "DROP TABLE IF EXISTS $table_name;";
        $wpdb->query($sql);

        // Remove the custom user role
        remove_role('password_owner');
    }
    register_deactivation_hook(__FILE__, 'pm_deactivate_plugin');
}

/**
 * Uninstall hook
 */
if (!function_exists('pm_uninstall_plugin')) {
    function pm_uninstall_plugin()
    {
        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $sql = "DROP TABLE IF EXISTS $table_name;";
        $wpdb->query($sql);

        // Remove the encryption keys stored in user meta.
        $users = get_users();
        foreach ($users as $user) {
            delete_user_meta($user->ID, 'pm_encryption_key');
        }

        // Remove the custom user role
        remove_role('password_owner');
    }
    register_uninstall_hook(__FILE__, 'pm_uninstall_plugin');
}

function handle_custom_api_cors()
{
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // Allow specific origin, or use '*' to allow all origins
        header('Access-Control-Allow-Origin: ' . esc_url_raw($_SERVER['HTTP_ORIGIN']));
    } else {
        header('Access-Control-Allow-Origin: *'); // Allow all origins if no HTTP_ORIGIN header
    }

    header('Access-Control-Allow-Methods: GET, POST, DELETE, PUT, OPTIONS');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: x-session-token, Content-Type, Authorization');

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}
add_action('rest_api_init', 'handle_custom_api_cors');


// Initialize the plugin.
if (!function_exists('pm_initialize_plugin')) {
    function pm_initialize_plugin()
    {
        require_once PM_INC . 'class-user-api.php';
        require_once PM_INC . 'class-password-api.php';
        require_once PM_INC . 'class-helper.php';
    }
    add_action('plugins_loaded', 'pm_initialize_plugin');
}