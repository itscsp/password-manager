<?php
/**
 * Plugin Name: Password Manager
 * Description: Passwords Manager lets you store all your passwords in one place.
 * Version: 1.0
 * Author: Chethan S Poojary
 * Author URI: https://www.chethanspoojary.com
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Define plugin paths
 */
define('PM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PM_PLUGIN_DIR', dirname(__FILE__));
define('PM_INC', PM_PLUGIN_DIR . '/includes/');

/**
 * Create Database table for plugin activation
 */
if ( ! function_exists( 'pm_db_install' ) ) {
    function pm_db_install() {
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
    }

    // Activation hook.
    register_activation_hook(__FILE__, 'pm_db_install');
}

/**
 * Deactivation hook
 */
if ( ! function_exists( 'pm_deactivate_plugin' ) ) {
    function pm_deactivate_plugin() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $sql = "DROP TABLE IF EXISTS $table_name;";
        $wpdb->query($sql);
    }
    register_deactivation_hook(__FILE__, 'pm_deactivate_plugin');
}

/**
 * Uninstall hook
 */
if ( ! function_exists( 'pm_uninstall_plugin' ) ) {
    function pm_uninstall_plugin() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'password_manager';

        $sql = "DROP TABLE IF EXISTS $table_name;";
        $wpdb->query($sql);

        // Remove the encryption keys stored in user meta.
        $users = get_users();
        foreach ($users as $user) {
            delete_user_meta($user->ID, 'pm_encryption_key');
        }
    }
    register_uninstall_hook(__FILE__, 'pm_uninstall_plugin');
}

// Initialize the plugin.
if ( ! function_exists( 'pm_initialize_plugin' ) ) {
    function pm_initialize_plugin() {
        $password_manager = new Password_Manager();
        $password_manager->run();
    }
    add_action( 'plugins_loaded', 'pm_initialize_plugin' );
}
