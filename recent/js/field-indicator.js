/*jslint white: true, browser: true, forin: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
"use strict";

(function () {
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YW = Y.widget,
    YD = YU.Dom;

    /**
     * The indicator represents a dom element that will appear to signify one of many different
     * status' of an input field.  For instance, it could show up when the field is valid, or when
     * the field is invalid, or when the number value in the field is out of the specified range.
     * @class FieldIndicator
     *
     * This will take the configuration and an optional neighbor.  Neighbor is required
     * if the dom for this indicator is being created dynamically.
     * @constructor
     * @param {Object} config Configuration for the indicator
     * @param {HTMLElement|String} neighbor Html Element used to dynamically create the indicator dom if an el is not already created.
     */
    function FieldIndicator(config, neighbor) {
        // I have to setup the dom element BEFORE i call the super class' constructor or else and error occurs.
        // I could pass document.body, then change it after, if need be, but I don't think this would be good practice
        var args = this._init(config, neighbor);
        FieldIndicator.superclass.constructor.apply(this, args);
    }

    /**
     * Augment form with standard indicator definitions.
     */
    YL.augmentObject(FieldIndicator, {
        /**
         * This is a collection of default events for registering indicators with event sources.
         * @property FormEvents
         * @static
         * @type Object
         */
        FormEvents: {
            notInRange: function () {
                return {
                    show: ['numberOutOfRange'],
                    hide: ['inputEmpty', 'numberInRange', 'incorrectFormat']
                };
            },
            valid: function () {
                return {
                    hide: ['inputInvalid', 'turnedOff'],
                    show: ['inputValid']
                };
            },
            invalid: function () {
                return {
                    show: ['inputInvalid'],
                    hide: ['inputValid', 'turnedOff']
                };
            },
            all: function () {
                return {
                    show: ['inputValueChange']
                };
            }
        },
        /**
         * This holds the default HTML that will be used to create an indicator.
         * @property IndicatorHtml
         * @static
         * @type Object
         */
        IndicatorHtml: {
            correct: '<div class="indicator"></div>',
            incorrect: '<div class="validator"></div>'
        },
        /**
         * This is a collection of default configurations for indicators
         * @property Indicators
         * @static
         * @type Object
         */
        Indicators: {
            correct: function () {
                return {html: FieldIndicator.IndicatorHtml.correct};
            },
            incorrect: function () {
                return {html: FieldIndicator.IndicatorHtml.incorrect};
            }
        }
    });
    Y.extend(FieldIndicator, YU.Element, {
        /**
         * Implementation of Element's abstract method. Sets up config values.
         *
         * @method initAttributes
         * @param config {Object} (Optional) Object literal definition of configuration values.
         * @private
         */
        initAttributes: function (config) {
            /**
             * This is the function that is called when the indicator is shown.
             * @attribute formatter
             * @type function
             */
            this.setAttributeConfig("formatter", {
                value: function (fieldValidator, fieldIndicator, meta) {
                    fieldIndicator.get('element').style.display = '';
                },
                validator: YL.isFunction,
                setter: function (val) {
                    if (!val) {
                        return function (fieldValidator, fieldIndicator, meta) {
                            fieldIndicator.get('element').style.display = '';
                        };
                    }
                    else {
                        return val;
                    }
                }
            });
            this.setAttributeConfig('html', {
                value: null
            });
            // You can set HTML directly, or you can set type.  Setting type is just
            // like using a default property, for example. correct and incorrect.
            this.setAttributeConfig('type', {
                value: null
            });
        },
        /**
         * This will get the configuration object and dom object represented by
         * this indicator.  If the el does not exist, it will be created using
         * the specified default style.  If no style specified, no style is applied.
         * The configuration will then be used to setup the indicator using the newly create el.
         * @method _init
         * @param {Object} config Configuration for the field indicator
         * @param {HTMLElement|String} theNeighbor If the indicator needs to be created, this is the element the indicator will be placed after.
         * @return {Object[]} returns an array of 2 elements, the first being the indidcator el, and the second being the configuration.
         * @private
         */
        _init: function (config, theNeighbor) {
            var el = config.el, theConfig = config, neighbor = theNeighbor;
            if (YL.isString(neighbor)) {
                neighbor = YD.get(neighbor);
            }
            if (YL.isString(theConfig)) {
                theConfig = FieldIndicator.Indicators[theConfig].call();
            }
            if (!neighbor && !el) {
                Y.log('No dom element given to field indicator, nor is there any way to create the dom element', 'warn', 'FieldIndicator');
                return [theConfig];
            }
            // initialize the dom
            el = this._initializeDom(el, theConfig.html || FieldIndicator.IndicatorHtml[theConfig.type], neighbor);
            //theConfig.html = null; // clear the html, if there is any
            return [el, theConfig];
        },
        /**
         * This function will create an Html element for the indicator after the given neighbor
         * @method _initializeDom
         * @param {HTMLElement | String} el The dom, or the id of the dom object that will represent this indicator
         * @param {Object} style Style object for creating the html element
         * @param {HTMLElement} neighbor Html Element that the new Html Element will be placed beside.
         * @return {HTMLElement} new html element that will represent the indicator.
         */
        _initializeDom: function (el, html, neighbor) {
            var theEl = el;
            // If we have an id instead of the actual dom object
            if (YL.isString(theEl)) {
                theEl = YD.get(theEl);
            }
            if (!theEl) {
                theEl = this._createEl(html);
                YD.insertAfter(theEl, neighbor);
            }

            return theEl;
        },
        /**
         * This will register and indicator with events of the event source based
         * on the configuration
         * @method registerEvents
         * @param {Object} eventSource Any object that has a subscribe method
         * @param {String|Object} eventKey This can be a key for a predefined default event configuration, or it could be an event configuration object itself.
         */
        registerEvents: function (eventSource, eventKey) {
            this._initializeEvents(eventSource, eventKey);
        },
        /**
         * This is the same as registerEvents, except its in the protected scope.
         * @method _initializeEvents
         * @param {Object} eventSource Any object that has a subscribe method
         * @param {String|Object} eventKey This can be a key for a predefined default event configuration, or it could be an event configuration object itself.
         * @protected
         */
        _initializeEvents: function (eventSource, eventKey) {
            var i, methodName, method, events, eventCfg;
            if (YL.isString(eventKey)) {
                eventCfg = FieldIndicator.FormEvents[eventKey].call();
            }
            else {
                eventCfg = eventKey;
            }
            if (!eventCfg) {
                return;
            }
            for (methodName in eventCfg) {
                method = this[methodName];
                if (!YL.isFunction(method)) {
                    Y.log('You can only use functions to subscribe to validator events', 'warn', 'FieldIndicator');
                }
                events = eventCfg[methodName];
                for (i = 0 ; i < events.length; ++i) {
                    eventSource.subscribe(events[i], method, this, this);
                }
            }
        },
        /**
         * This will use a worker dom to create a child dom from the given
         * html.  It will then remove the child from the parent (worker dom),
         * and then return it from the function.
         * @method _createEl
         * @param {String} html Html that will be used to create the el
         * @return {HTMLElement} DOM object created from the html.
         */
        _createEl: function (html) {
            var workerDom = document.createElement('DIV'), rtVl;
            workerDom.innerHTML = html;
            rtVl = YD.getChildren(workerDom)[0];
            workerDom.removeChild(rtVl);
            return rtVl;
        },
        /**
         * This will show the indicator.  This will call the formatter
         * function provided to the indicator.
         * @method show
         */
        show: function (args, formValidator) {
            var formatter = this.get('formatter'), errorMeta, validator;
            if (args) {
                errorMeta = args[0];
                validator = args[1];
            }
            // indicators will never show if the field is optional and empty
            if (validator.get('optional') && validator.isEmpty()) {
                this.hide();
            }
            else {
                formatter.call(formValidator, validator, this, errorMeta);
            }
        },
        /**
         * This will hide the indicator.
         * @method hide
         */
        hide: function (args, formValidator) {
            this.setStyle('display', 'none');
        }
    });
    YW.FieldIndicator = FieldIndicator;
    if (YW.FormValidator) {
        YW.FormValidator.FieldIndicator = FieldIndicator;
    }
    if (YW.FieldGroup) {
        YW.FieldGroup.FieldIndicator = FieldIndicator;
    }
}());