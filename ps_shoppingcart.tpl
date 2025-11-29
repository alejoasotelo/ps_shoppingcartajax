{**
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
 *}
{* Componente del carrito con Alpine.js para carga diferida vía AJAX *}
{* Estilo para ocultar elementos con x-cloak mientras Alpine.js no está inicializado *}
<style>
  [x-cloak] {literal}{ display: none !important; }{/literal}
</style>
<div id="blockcart-wrapper"
     x-data="shoppingCart('{$refresh_url}', '{$cart_url}')"
     x-init="init()">
  <div class="blockcart cart-preview" data-refresh-url="{$refresh_url}">
    <div class="header">
      <a rel="nofollow" :href="cartUrl">
        {* Icono del carrito siempre visible *}
        <span>{l s='Cart' d='Shop.Theme.Actions'}</span>
        {* Resumen del carrito con carga diferida *}
        <span x-show="loading" class="cart-loading">...</span>
        <span x-show="!loading" x-text="cart.summary_string" x-cloak></span>
      </a>
    </div>
    {* Cuerpo del carrito con productos - se muestra cuando los datos están cargados *}
    <div class="body" x-show="!loading" x-cloak>
      <ul>
        {* Lista de productos generada dinámicamente con Alpine.js *}
        <template x-for="product in cart.products" :key="product.id_product + '-' + product.id_product_attribute">
          <li>
            <span class="product-quantity" x-text="product.quantity"></span>
            <span class="product-name" x-text="product.name"></span>
            <span class="product-price" x-text="product.price"></span>
            <a class="remove-from-cart"
               rel="nofollow"
               :href="product.remove_from_cart_url"
               data-link-action="remove-from-cart">
              {l s="Remove" d="Shop.Theme.Actions"}
            </a>
            {* Personalizaciones del producto *}
            <template x-if="product.customizations && product.customizations.length > 0">
              <div class="customizations">
                <ul>
                  <template x-for="customization in product.customizations" :key="customization.id_customization">
                    <li>
                      <span class="product-quantity" x-text="customization.quantity"></span>
                      <a :href="customization.remove_from_cart_url" class="remove-from-cart" rel="nofollow">{l s='Remove' d="Shop.Theme.Actions"}</a>
                      <ul>
                        <template x-for="field in customization.fields" :key="field.id_customization_field">
                          <li>
                            <label x-text="field.label"></label>
                            <template x-if="field.type == 'text'">
                              <span x-text="field.text"></span>
                            </template>
                            <template x-if="field.type == 'image'">
                              <img :src="field.image.small.url" :alt="field.label">
                            </template>
                          </li>
                        </template>
                      </ul>
                    </li>
                  </template>
                </ul>
              </div>
            </template>
          </li>
        </template>
      </ul>
      {* Subtotales del carrito *}
      <div class="cart-subtotals">
        <template x-for="subtotal in cart.subtotals" :key="subtotal.type">
          <template x-if="subtotal && subtotal.type && subtotal.label && subtotal.amount">
            <div :class="subtotal.type">
              <span class="label" x-text="subtotal.label"></span>
              <span class="value" x-text="subtotal.amount"></span>
            </div>
          </template>
        </template>
      </div>
      {* Total del carrito *}
      <div class="cart-total" x-show="cart.totals && cart.totals.total">
        <span class="label" x-text="cart.totals?.total?.label || ''"></span>
        <span class="value" x-text="cart.totals?.total?.amount || ''"></span>
      </div>
    </div>
  </div>
</div>
