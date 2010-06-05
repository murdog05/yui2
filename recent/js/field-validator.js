/*jslint white: true, browser: true, forin: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
"use strict";

/**
 * This will house the validation function which
 * will perform the validation on the input field from the form.
 * @namespace YAHOO.widget
 */
(function () {
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YW = Y.widget;
    /**
     * The field validator class handles validating values entered into fields
     * in the form.
     * @class FieldValidator
     * @constructor
     * @param {HTMLElement} el The input element the field validator is for.
     * @param {Object|String|Function} config Configuration for the validation
     */
    function FieldValidator(el, config) {
        FieldValidator.superclass.constructor.apply(this, [el, FieldValidator._initConfig(config)]);
    }

    YL.augmentObject(FieldValidator, {
        /**
         * The maximum value for an integer.  Used as a default min/max value on number fields
         * @property MAX_INTEGER
         * @type number
         * @static
         */
        MAX_INTEGER: 2147483647,
        /**
         * Regular expression used by the Integer field for ensuring the input matches the format of an integer
         * @property INTEGERREGEX
         * @type regex
         * @static
         */
        INTEGERREGEX: /(^-?\d\d*$)/,
        /**
         * Regular expression used by the DoubleField for ensuring the input matches the format of an double
         * @property DOUBLEREGEX
         * @type regex
         * @static
         */
        DOUBLEREGEX: /(^-?\d\d*\.\d+$)|(^-?\d\d*$)|(^-?\.\d\d*$)/,
        /**
         * Regular expression for an e-mail.
         * @property EMAILREGEX
         * @type regex
         * @static
         */
        EMAILREGEX: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
        /**
         * Regular expression for a phone number.
         * @property EMAILREGEX
         * @type regex
         * @static
         */
        PHONEREGEX: /^([(]?[2-9]\d{2}[)]?)[ ]*-?[ ]*(\d{3})[ ]*-?[ ]*(\d{4})$/,
        /**
         * This is the regular expression used to check if the user's password meets the strongest password strength criteria.
         * @property StrongPassword
         * @static
         * @type regex
         */
        StrongPassword: /^(?=.{8,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\W).*$/,
        /**
         * This is the regular expression used to check if the user's password meets medium password strength criteria.
         * @property MediumPassword
         * @static
         * @type regex
         */
        MediumPassword: /^(?=.{7,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$/,
        /**
         * This is the regular expression used to check if the user's password meets the minimum password strength criteria.
         * @property WeakPassword
         * @static
         * @type regex
         */
        WeakPassword: /(?=[a-zA-Z0-9]{6,}).*/,
        /**
         * Given a configuration that could be a string, function or a configuration object,
         * this will ensure a proper configuration object is returned and passed to the super class.
         * @method _initConfig
         * @param {Object|String|Function} config Configuration for the field validation
         * @return {Object} configuration object for the field validation.
         */
        _initConfig: function (config) {
            var oConfig;
            // if all that is given is a function or a string, then we put it as the type in a configuration object
            // and initialize from there.
            if (YL.isFunction(config) || YL.isString(config)) {
                oConfig = {
                    type: config
                };
            }
            else if (YL.isObject(config)) {
                // otherwise, we assume its an object, and
                oConfig = config;
            }
            else {
                YAHOO.log('Invalid configuration provided for form element.  Must provide string, function or configuration object.', 'warn', 'FieldValidator');
                oConfig = {};
            }
            return oConfig;
        },
        /**
         * This will initialize any property that is considered a checker.  A checker
         * is a function that will cause an event to happen based on its return value.
         * A checker function will always return a boolean value
         * @method _initializeChecker
         * @param {String} key Key value to say what type of checker (is valid or is empty) this is for, whether it be checking the validity of the input or if its empty
         * @param {String} val Value under the key, for instance, is valid checker, checking to ensure the input is a valid number
         * @param {String} map Map that contains the checkers the key and value will be used with.
         * @return {function} function that will return a boolean value based on a single input.
         */
        _initializeChecker: function (key, val, map) {
            var checker = val, temp, regex;
            if (!checker) {
                return null;
            }
            else if (YL.isString(checker)) {
                // check and see if the string is a predefined validator function
                temp = map[checker.toLowerCase()];
                // if it isn't, then we will assume its a regular expression
                if (!temp) {
                    regex = new RegExp(checker);
                    return function (el) {
                        return regex.test(el.value);
                    };
                }
                else {
                    return temp;
                }
            }
            else if (!YL.isFunction(checker)) {
                YAHOO.log('Please provide a valid type, function or regular expression for the ' + key + ' attribute', 'warn', 'FieldValidator');
            }
            return checker;
        },
        /**
         * Premade validator functions that cover most validation situations.  These
         * functions are used when a text value is provided for the type of validation.  Supported
         * types are, text, integer, double, email, checked, and unchecked.
         * @property Validators
         * @static
         * @type Object
         */
        Validators: {
            integer: function (el) {
                var value = el.value, theVal;
                if (!FieldValidator.INTEGERREGEX.test(value)) {
                    //this.fireEvent('incorrectFormat');
                    this.addMeta('incorrectFormat', 'Format of number is incorrect');
                    return false;
                }
                if (value.indexOf('.') !== -1) {
                    this.addMeta('incorrectFormat', 'Format of number is incorrect');
                    return false; // don't allow numbers with decimals
                }
                theVal = parseInt(value, 10);
 
                if (isNaN(theVal) || !isFinite(theVal)) {
                    this.addMeta('incorrectFormat', 'Format of number is incorrect');
                    return false;
                }
                else {
                    return this._validation._checkRange(theVal, this);
                }
            },
            'double': function (el) {
                var value = el.value, numVal = 0, maxDecimals = this._validation.get('maxDecimalPlaces'), decimals;
                if ((maxDecimals !== -1) && (value.indexOf('.') !== -1)) {
                    this.addMeta('incorrectFormat', 'Format of double is incorrect');
                    decimals = value.split('.')[1];
                    if (decimals.length > maxDecimals) {
                        return false;
                    }
                }
                if (!YW.FieldValidator.DOUBLEREGEX.test(el.value)) {
                    this.addMeta('incorrectFormat', 'Format of double is incorrect');
                    return false;
                }

                numVal = parseFloat(value, 10);

                if (isNaN(numVal) || !isFinite(numVal)) {
                    this.addMeta('incorrectFormat', 'Format of double is incorrect');
                    return false;
                }

                return this._validation._checkRange(numVal, this);
            },
            text: function (el) {
                // TODO: Put in length checking, perhaps use the max property, then the same functionality
                // from range checking on numbers can be re-used
                return el.value !== '';
            },
            email: function (el) {
                // TODO: Put in length checking
                return YW.FieldValidator.EMAILREGEX.test(el.value);
            },
            phone: function (el) {
                return YW.FieldValidator.PHONEREGEX.test(el.value);
            },
            checked: function (el) {
                return el.checked;
            },
            unchecked: function (el) {
                return !el.checked;
            },
            'strong-password': function (el) {
                var strong = FieldValidator.StrongPassword,
                medium = FieldValidator.MediumPassword,
                weak = FieldValidator.WeakPassword;

                if (strong.test(el.value)) {
                    this.addMeta('strength', 'strong');
                    return true;
                }
                else if (medium.test(el.value)) {
                    this.addMeta('strength', 'medium');
                    return false;
                }
                else if (weak.test(el.value)) {
                    this.addMeta('strength', 'weak');
                    return false;
                }
                else {
                    this.addMeta('strength', 'none');
                    return false;
                }
            },
            'medium-password': function (el) {
                var strong = FieldValidator.StrongPassword,
                medium = FieldValidator.MediumPassword,
                weak = FieldValidator.WeakPassword;

                if (strong.test(el.value)) {
                    this.addMeta('strength', 'strong');
                    return true;
                }
                else if (medium.test(el.value)) {
                    this.addMeta('strength', 'medium');
                    return true;
                }
                else if (weak.test(el.value)) {
                    this.addMeta('strength', 'weak');
                    return false;
                }
                else {
                    this.addMeta('strength', 'none');
                    return false;
                }
            }
        },
        /**
         * Premade functions that specify when an input is considered empty.
         * More can be added, as well as the existing one overridden.
         * @property EmptyWhen
         * @static
         * @type Object
         */
        EmptyWhen: {
            notext: function (el) {
                if (el.type && (el.type.toLowerCase() === 'checkbox' || el.type.toLowerCase() === 'radio')) {
                    return !el.checked;
                }
                return el.value === '';
            },
            notChecked: function (el) {
                return !el.checked;
            },
            checked: function (el) {
                return el.checked;
            }
        }
    });

    YL.extend(FieldValidator, YU.Element, {
        /**
         * Validator function to be used to check if the value in the input field
         * is valid.
         * @property _validator
         * @type function
         * @private
         */
        _validator: null,
        /**
         * Implementation of Element's abstract method. Sets up config values.
         *
         * @method initAttributes
         * @param config {Object} (Optional) Object literal definition of configuration values.
         * @private
         */
        initAttributes: function (config) {
            /**
             * This is set to true if the minimum allowed values boundary is inclusive
             * @config minInclusive
             * @type boolean
             */
            this.setAttributeConfig('minInclusive', {
                value: true,
                validator: YL.isBoolean
            });
            /**
             * This is set to true if the maximum allowed values boundary is inclusive
             * @config maxInclusive
             * @type boolean
             */
            this.setAttributeConfig('maxInclusive', {
                value: true,
                validator: YL.isBoolean
            });
            /**
             * This is the minimum allowed value in the double field.  Default value
             * is the minimum value for an integer
             * @config min
             * @type number
             */
            this.setAttributeConfig('min', {
                value: (-1) * YW.FieldValidator.MAX_INTEGER,
                validator: YL.isNumber,
                setter: function (val) {
                    if (val < (-1) * YW.FieldValidator.MAX_INTEGER) {
                        return (-1) * YW.FieldValidator.MAX_INTEGER;
                    }
                    return val;
                }
            });
            /**
             * This is the maximum allowed value in the double field. Default value
             * is the maximum value for an integer
             * @config max
             * @type number
             */
            this.setAttributeConfig('max', {
                value: YW.FieldValidator.MAX_INTEGER,
                validator: YL.isNumber,
                setter: function (val) {
                    if (val < (-1) * YW.FieldValidator.MAX_INTEGER) {
                        return (-1) * YW.FieldValidator.MAX_INTEGER;
                    }
                    return val;
                }
            });
            /**
             * If set, this will restrict the number of decimal places allowed on the double.  This could
             * be done with regular expression, but this makes it a bit easier for everyone.
             * @config maxDecimalPlaces
             * @type number
             */
            this.setAttributeConfig('maxDecimalPlaces', {
                value: -1,
                validator: YL.isNumber
            });
            /**
             * This is the type of validation, text is set by default
             * @config type
             * @type function
             */
            this.setAttributeConfig('type', {
                value: 'text',
                setter: function (val) {
                    return FieldValidator._initializeChecker('type', val, FieldValidator.Validators);
                }
            });
            this.set('type', 'text');
            /**
             * This is the type of validation, text is set by default
             * @config empty
             * @type empty
             */
            this.setAttributeConfig('empty', {
                value: 'notext',
                setter: function (val) {
                    return FieldValidator._initializeChecker('empty', val, FieldValidator.EmptyWhen);
                }
            });
            this.set('empty', 'notext');
            /**
             * If set, this will show that the input is considered optional, and if not filled
             * in, won't cause the form to be invalid.
             * @config optional
             * @type boolean
             */
            this.setAttributeConfig('optional', {
                value: false,
                validator: YL.isBoolean
            });
            /**
             * Allows input to be formatted a specific way, must
             * be used with a proper regex.
             * @config formatter
             * @type function
             */
            this.setAttributeConfig('formatter', {
                value: function (el) {},
                validator: YL.isFunction
            });
            /**
             * If set to true, this input is considered off, and not used.
             * @config off
             * @type boolean
             */
            this.setAttributeConfig('off', {
                value: false,
                validator: YL.isBoolean
            });
            /**
             * This is the function used for disabling the input.  By default
             * it will set the disabled property to true on the el.
             * @config disableFunction
             * @type function
             */
            this.setAttributeConfig('disableFunction', {
                value: function (el) {el.disabled = true;},
                validator: YL.isFunction
            });
            /**
             * This is the function used for enabling the input.  By default
             * it will set the disabled property to false on the el.
             * @config enableFunction
             * @type function
             */
            this.setAttributeConfig('enableFunction', {
                value: function (el) {el.disabled = false;},
                validator: YL.isFunction
            });
        },
        /**
         * This will return an object that will operate as the scope for the
         * validation function to execute in.  This will provide the ability to
         * store an error message under a key, as well as access the validator
         * and the input.
         * @method _getMetaWrapper
         * @return {Object} meta object the validation and empty functions operate in.
         */
        _getMetaWrapper: function () {
            var meta = {
                metaData: {},
                _validation: this,
                addMeta: function (key, msg) {
                    this.metaData[key] = msg;
                },
                _validator: this.get('type'),
                _empty: this.get('empty')
            };
            return meta;
        },
        /**
         * This will return true if the input is empty.  By default this will
         * return true if the value in the input field is ''.
         * @method isEmpty
         * @return {boolean} true if the value is considered empty by the empty function used.
         */
        isEmpty: function () {
            return this._getMetaWrapper()._empty(this.get('element'));
        },
        /**
         * This will turn the given input on, and invoke the validate
         * function to update all indicators.
         * @method turnOn
         */
        turnOn: function (silent) {
            this.set('off', false);
            if (!silent) {
                this.validate();
                this.fireEvent('inputStatusChange', this);
            }
        },
        /**
         * This will turn the given input off, and invoke the validate
         * function to update all indicators.
         * @method turnOn
         */
        turnOff: function (silent) {
            this.set('off', true);
            if (!silent) {
                this.validate();
                this.fireEvent('inputStatusChange', this);
            }
        },
        /**
         * This will enable the input represented by this validator
         * @method enable
         */
        enable: function () {
            this.get('enableFunction').call({}, this.get('element'));
        },
        /**
         * This will enable the input represented by this validator
         * @method disable
         */
        disable: function () {
            this.get('disableFunction').call({}, this.get('element'));
        },
        /**
         * This will check the validity of the input
         * and throw the proper events based on the empty and validation functions.
         * @method validate
         * @param {boolean} silent If true, the validator will not fire any events.
         * @return {boolean} true if the input is considered valid.
         */
        validate: function (silent) {
            var el = this.get('element'), optional = this.get('optional'), formatter = this.get('formatter'), meta = this._getMetaWrapper(),
            isEmpty = meta._empty(el, meta), turnedOff = this.get('off'), isValid = meta._validator(el, meta) || (isEmpty && optional) || turnedOff;
            
            // if silent, don't invoke any events
            if (silent === true) {
                return isValid;
            }
            if (turnedOff) {
                this.fireEvent('turnedOff', [meta.metaData, this]);
                return isValid; // fire no other events.
            }
            if (isEmpty) {
                this.fireEvent('inputEmpty', [meta.metaData, this]);
            }
            else {
                this.fireEvent('inputNotEmpty', [meta.metaData, this]);
            }

            if (isValid) {
                this.fireEvent('inputValid', [meta.metaData, this]);
            }
            else {
                this.fireEvent('inputInvalid', [meta.metaData, this]);
            }
            this.fireEvent('inputValueChange', [meta.metaData, this]);
            // call the formatter if the input is valid and non empty
            if (isValid && !isEmpty) {
                formatter.call({}, el);
            }
            return isValid;
        },
        /**
         * Used only for numbers, this will check the range and fire
         * a value out of range event if the value is out of range.
         * @method _checkRange
         * @param {number} numVal Numeric value to be checked.
         * @param {Object} errorMeta Meta object that is used to store errors.
         * @return {boolean} true if the number is in the range specified on the validator.
         */
        _checkRange: function (numVal, errorMeta) {
            var minInclusive, maxInclusive, min, max;
            minInclusive = this.get('minInclusive');
            maxInclusive = this.get('maxInclusive');
            min = this.get('min');
            max = this.get('max');
            if (minInclusive && (min > numVal)) {
                errorMeta.addMeta('numberBelowMin', {
                    min: min
                });
                return false;
            }
            else if (!minInclusive && (min >= numVal)) {
                errorMeta.addMeta('numberBelowMin', {
                    min: min
                });
                return false;
            }
            else if (maxInclusive && (max < numVal)) {
                errorMeta.addMeta('numberAboveMax', {
                    max: max
                });
                return false;
            }
            else if (!maxInclusive && (max <= numVal)) {
                errorMeta.addMeta('numberAboveMax', {
                    max: max
                });
                return false;
            }
            else {
                return true;
            }
        },
        /**
         * This will return true if the input represented by this validator
         * is valid.
         * @method isValid
         * @return {boolean} true if the input is valid based on the configuration.
         */
        isValid: function () {
            return this.validate(true);
        }
        /**
         * Fires when the input is considered valid, always fired after the empty/not empty events.
         * @event inputValid
         */
        /**
         * Fires when the input is considered invalid, always fired after the empty/not empty events.
         * @event inputInvalid
         */
        /**
         * Fires when the input is considered empty, always fired before the valid/invalid events.
         * @event inputEmpty
         */
        /**
         * Fires when the input is considered non-empty, always fired before the valid/invalid events.
         * @event inputNotEmpty
         */
        /**
         * Fires when an input is turned on or off.
         * @event inputStatusChange
         */
    });
    YAHOO.widget.FieldValidator = FieldValidator;
    if (YW.FormValidator) {
        YW.FormValidator.FieldValidator = FieldValidator;
    }
    if (YW.FieldGroup) {
        YW.FieldGroup.FieldValidator = FieldValidator;
    }
}());