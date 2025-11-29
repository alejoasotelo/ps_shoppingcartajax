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
 * Este módulo expone un punto de extensión a través de la función `showModal`.
 *
 * Si deseas personalizar la forma en que se muestra la ventana modal, debes hacer:
 *
 * prestashop.blockcart = prestashop.blockcart || {};
 * prestashop.blockcart.showModal = function myOwnShowModal (modalHTML) {
 *   // tu propio código
 *   // ten en cuenta que es tu responsabilidad manejar el comportamiento de "cerrar" del modal
 * };
 *
 * Advertencia: tu JavaScript personalizado debe incluirse **antes** de este archivo.
 * La forma más segura de hacerlo es colocar tu "override" dentro del archivo JavaScript principal del tema.
 *
 */

/**
 * Componente Alpine.js para el carrito de compras
 * Maneja la carga inicial diferida y las actualizaciones del carrito vía AJAX
 * 
 * @param {string} refreshUrl - URL para obtener los datos del carrito
 * @param {string} cartUrl - URL de la página del carrito
 * @returns {Object} - Objeto con el estado y métodos del componente Alpine
 */
function shoppingCart(refreshUrl, cartUrl) {
  return {
    // Estado del carrito
    cart: {
      products: [],
      subtotals: [],
      totals: {
        total: {
          label: '',
          amount: ''
        }
      },
      summary_string: ''
    },
    // Estado de carga
    loading: true,
    // URLs del carrito
    refreshUrl: refreshUrl,
    cartUrl: cartUrl,

    /**
     * Inicializa el componente cargando los datos del carrito vía AJAX
     * Se ejecuta cuando el DOM está listo
     */
    init() {
      this.loadCartData();
    },

    /**
     * Carga los datos del carrito desde el servidor vía AJAX
     * Actualiza el estado del carrito con los datos recibidos
     */
    loadCartData() {
      var self = this;
      self.loading = true;
      
      fetch(this.refreshUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        // Extraer los datos del carrito de la respuesta
        if (data && data.cart) {
          self.cart = data.cart;
        }
        self.loading = false;
      })
      .catch(function(error) {
        console.error('Error al cargar los datos del carrito:', error);
        self.loading = false;
      });
    },

    /**
     * Actualiza los datos del carrito con nueva información
     * @param {Object} cartData - Nuevos datos del carrito
     */
    updateCart(cartData) {
      if (cartData) {
        this.cart = cartData;
      }
    }
  };
}

// Inicialización cuando el documento está listo
$(document).ready(function () {
  prestashop.blockcart = prestashop.blockcart || {};

  // Función para mostrar el modal de producto añadido
  var showModal = prestashop.blockcart.showModal || function (modal) {
    var $body = $('body');
    $body.append(modal);
    $body.one('click', '#blockcart-modal', function (event) {
      if (event.target.id === 'blockcart-modal') {
        $(event.target).remove();
      }
    });
  };

  // Escucha eventos de actualización del carrito
  prestashop.on(
    'updateCart',
    function (event) {
      var refreshURL = $('.blockcart').data('refresh-url');
      var requestData = {};
      
      // Preparar datos de la petición si hay información del producto
      if (event && event.reason && typeof event.resp !== 'undefined' && !event.resp.hasError) {
        requestData = {
          id_customization: event.reason.idCustomization,
          id_product_attribute: event.reason.idProductAttribute,
          id_product: event.reason.idProduct,
          action: event.reason.linkAction
        };
      }
      
      // Mostrar errores si los hay
      if (event && event.resp && event.resp.hasError) {
        prestashop.emit('showErrorNextToAddtoCartButton', { errorMessage: event.resp.errors.join('<br/>')});
      }
      
      // Realizar petición AJAX para actualizar el carrito
      $.post(refreshURL, requestData).then(function (resp) {
        // Obtener el componente Alpine.js del carrito
        var blockcartWrapper = document.getElementById('blockcart-wrapper');
        if (blockcartWrapper && blockcartWrapper._x_dataStack) {
          // Actualizar datos del carrito usando Alpine.js
          var alpineData = blockcartWrapper._x_dataStack[0];
          if (alpineData && resp.cart) {
            alpineData.cart = resp.cart;
          }
        }
        
        // Mostrar modal si se añadió un producto
        if (resp.modal) {
          showModal(resp.modal);
        }
      }).fail(function (resp) {
        prestashop.emit('handleError', { eventType: 'updateShoppingCart', resp: resp });
      });
    }
  );
});
