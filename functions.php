<?php
/**
 * Theme Functions
 * 
 * @package Blocksy Child
 */

if (!defined('WP_DEBUG')) {
    die('Direct access forbidden.');
}

// Načtení rodičovského stylu
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('parent-style', get_template_directory_uri() . '/style.css');
});

// Přidání shortcode pro PassProve widget
add_shortcode('passprove_widget', function () {
    ob_start(); // Začátek bufferování výstupu
    ?>
    <div id="passprove-widget-container"></div>
    <script src="https://v0-wifdget.vercel.app/passprove-widget.js"></script>
    <script>
        window.PassProve.init({
            selector: "#passprove-widget-container",
            shopId: "065b3ffd-88a3-46d2-b4e3-60756e990600", // Ponechat shopId, dokud nebude widget aktualizován
            apiKey: "váš_api_klíč", // Přidat apiKey pro budoucí kompatibilitu
            buttonText: "Ověřit věk" // Text tlačítka
        });
    </script>
    <?php
    return ob_get_clean(); // Vrátí obsah bufferu
});

// Zobrazení widgetu v pokladně WooCommerce
add_action('woocommerce_before_checkout_form', function () {
    echo do_shortcode('[passprove_widget]');
});

// (Volitelné) Přidání tlačítka "Ověřit věk" do pokladny
add_action('woocommerce_review_order_before_submit', function () {
    echo '<button type="button" id="verify-age-button" style="margin-bottom: 20px;">Ověřit věk</button>';
});

// (Volitelné) Inicializace widgetu po kliknutí na tlačítko
add_action('wp_footer', function () {
    ?>
    <script>
        document.getElementById('verify-age-button') && document.getElementById('verify-age-button').addEventListener('click', function () {
            window.PassProve.init({
                selector: "#passprove-widget-container",
                shopId: "065b3ffd-88a3-46d2-b4e3-60756e990600", // Ponechat shopId, dokud nebude widget aktualizován
                apiKey: "váš_api_klíč", // Přidat apiKey pro budoucí kompatibilitu
                buttonText: "Ověřit věk" // Text tlačítka
            });
        });
    </script>
    <?php
}); 