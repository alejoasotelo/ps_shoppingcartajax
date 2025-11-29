<?php
/**
 * 2007-2020 PrestaShop and Contributors
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License 3.0 (AFL-3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/AFL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2020 PrestaShop SA and Contributors
 * @license   https://opensource.org/licenses/AFL-3.0 Academic Free License 3.0 (AFL-3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */

/**
 * Controlador AJAX del módulo de carrito de compras
 * Maneja las peticiones AJAX para obtener y actualizar los datos del carrito
 */
class Ps_ShoppingcartAjaxModuleFrontController extends ModuleFrontController
{
    /**
     * @var bool
     */
    public $ssl = true;

    /**
     * Procesa la petición AJAX y devuelve los datos del carrito en formato JSON
     * 
     * @see FrontController::initContent()
     *
     * @return void
     */
    public function initContent()
    {
        parent::initContent();

        $modal = null;

        // Si la acción es agregar al carrito, renderizar el modal de confirmación
        if (Tools::getValue('action') === 'add-to-cart') {
            $modal = $this->module->renderModal(
                (int) Tools::getValue('id_product'),
                (int) Tools::getValue('id_product_attribute'),
                (int) Tools::getValue('id_customization')
            );
        }

        // Obtener los datos del carrito para Alpine.js
        $widgetVariables = $this->module->getWidgetVariables(null, []);

        ob_end_clean();
        header('Content-Type: application/json');
        
        // Devolver la respuesta JSON con los datos del carrito para Alpine.js
        exit(json_encode([
            'preview' => $this->module->renderWidget(null, []),
            'modal' => $modal,
            'cart' => $widgetVariables['cart'], // Datos del carrito para Alpine.js
        ]));
    }
}
