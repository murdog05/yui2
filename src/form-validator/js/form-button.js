/*jslint white: true, forin: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
"use strict";

(function () {
    var Y = YAHOO,
    YU = Y.util,
    YW = Y.widget;

    /**
     * @namespace YAHOO.widget
     * This will wrap a button that is considered a submit button by the form
     * validator.
     * @class FormButton
     * @constructor
     * @param {HTMLElement | String} el button Dom, or id of button dom.
     * @param {Object} config Configuration for the button.
     */
    function FormButton(el, config) {
        FormButton.superclass.constructor.apply(this, arguments);
    }
    Y.extend(FormButton, YU.Element, {
        /**
         * This will enable the button
         * @method enable
         */
        enable: function () {
            this.get('element').disabled = false;
        },
        /**
         * This will disable the button
         * @method disable
         */
        disable: function () {
            this.get('element').disabled = true;
        }
    });
    
    YW.FormButton = FormButton;
    if (YW.FormValidator) {
        YW.FormValidator.FormButton = FormButton;
    }
}());