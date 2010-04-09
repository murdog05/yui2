/*jslint white: true, forin: true, onevar: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
"use strict";

(function () {
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YE = YU.Event,
    YW = Y.widget,
    YD = YU.Dom,
    AP = YU.AttributeProvider;

    /**
     * @namespace YAHOO.widget
     * This will represent a group of fields inside the form validator.
     * @class FieldGroup
     */
    function FieldGroup(id, config) {
        this.init(id, config);
    }
    // Add on default validators for Group
    YL.augmentObject(FieldGroup, {
        /**
         * Premade validators for the group.
         * @property Validators
         * @static
         * @type Object
         */
        Validators: {
            /**
             * This will return true if any of the given fields are valid.
             */
            any: function (fields, meta, silent) {
                var i, validOneFound = false, invalidFound = false, curValid;
                for (i = 0 ; i < fields.length; ++i) {
                    if (silent) {
                        curValid = fields[i].isValid();
                    } else {
                        curValid = fields[i].validate();
                    }
                    // if any one of the field is
                    if (curValid && !fields[i].isEmpty()) {
                        validOneFound = true;
                    }
                    else if (!curValid) {
                        invalidFound = true;
                    }
                }
                return validOneFound && !invalidFound;
            }
        }
    });

    FieldGroup.prototype = {
        /**
         * This is the id of the form group.  This is optional, if not set
         * then the group cannot be retreived by id.
         * @property id
         * @type String
         */
        id: null,
        /**
         * This is the constructor for the form group.  This will ensure
         * all fields are initialized properly.
         * @constructor
         * @param {String} id Optional id of the form group
         * @param {Object} config Configuration for the group.
         */
        init: function (id, config) {
            var oConfig = config || {}, oID = id;
            if (YL.isObject(oID)) {
                oConfig = oID;
                oID = null;
            }
            this.id = oID;
            this.initAttributes(oConfig);
            this._initializeFields();
        },
        /**
         * This is the function that will determine if the group is valid
         * based on the fields that belong to the group.
         * @property _validation
         * @type function
         */
        //_validation: null,
        /**
         * This will return an object that will operate as the scope for the
         * validation function to execute in.  This will provide the ability to
         * store an error message under a key, as well as access the validator
         * and the field.
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
                _validator: this.get('type')
            };
            return meta;
        },
        /**
         * This will hold all inputs that have validation applied to them
         * within the group.
         * @property _validation
         * @type YAHOO.widget.FieldValidator[]
         * @protected
         */
        _validation: null,
        /**
         * This will hold all the indicators that are used with the fields in the
         * group
         * @property _indicators
         * @type YAHOO.widget.FieldIndicator[]
         */
        _indicators: null,
        /**
         * Implementation of Element's abstract method. Sets up config values.
         *
         * @method _initAttributes
         * @param config {Object} (Optional) Object literal definition of configuration values.
         * @private
         */
        initAttributes: function (config) {
            var oConfigs = config || {}, key;
            /**
             * This will be the fields considered to be inside the group field.
             * @config fields
             * @type Object[]
             */
            this.setAttributeConfig('type', {
                value: FieldGroup.Validators.any,
                validator: function (val) {
                    return YL.isFunction(val) || YL.isString(val);
                },
                setter: function (val) {
                    if (YL.isFunction(val)) {
                        return val;
                    }
                    else {
                        return FieldGroup.Validators[val];
                    }
                }
            });
            /**
             * This will be the fields considered to be inside the group field.
             * @config fields
             * @type Object[]
             */
            this.setAttributeConfig('fields', {
                value: {},
                validator: YL.isObject
            });

            for (key in oConfigs) {
                if (oConfigs[key] !== undefined) {
                    this.set(key, oConfigs[key]);
                }
            }
        },
        /**
         * This will return true if the group is valid.  This will also
         * ensure that all child fields for the group are updated
         * based on their field if silent is not true
         * @method validate
         * @param {boolean} silent True if the child field's indicators are not to be updated.
         * @return {boolean} true if the group is valid.
         */
        validate: function (silent) {
            var meta = this._getMetaWrapper(),
            isValid = meta._validator(this._validation, meta, false),
            isEmpty = this.isEmpty();

            if (silent === true) {
                return isValid;
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

            return isValid;
        },
        /**
         * This will check to see if the group is valid without causing any
         * events or indicator updates.
         * @method isValid
         * @return {boolean} true if the group is valid.
         */
        isValid: function () {
            return this.validate(true);
        },
        /**
         * If all the fields in the group are empty, this will return true.
         * If at least one is NOT empty, then this will return false.
         * @method isEmpty
         * @return {boolean} true if there is at least one child field that is non-empty.
         */
        isEmpty: function () {
            var fields = this.get('fields'), i;
            for (i = 0 ; i < fields.length; ++i) {
                if (!fields[i].isEmpty()) {
                    return false;
                }
            }
            return true;
        },
        /**
         * This will initialize all the inputs given in the configuration.
         * For each input in the configuration, this will initialize the validation on
         * the input field, then register the indicators with the events specified in
         * the configuration.  Indicators elements will be created as neccessary
         *
         * @method _initializeFields
         */
        _initializeFields: function () {
            var fields = this.get('fields'), curInput, j, curIndsJson, inds, key, indicatorKey, el, inputCfg, ind;
            this._validation = [];
            this._indicators = [];
            for (key in fields) {
                inputCfg = fields[key];
                if (inputCfg.validation && inputCfg.validation.fields) {
                    curInput = new FieldGroup.FieldGroup(key, inputCfg.validation);
                }
                else {
                    el = YD.get(key);
                    curInput = new FieldGroup.FieldValidator(el, inputCfg.validation);
                    // make the input optional, as it is in a group.
                    curInput.set('optional', true);
                }
                // due to the fact that select element's change events do not bubble, we
                // need to subscribe directly to their change events.
                this._checkSelect(curInput);
                inds = inputCfg.indicators;
                // singular, will subscribe to just the input change event
                if (inds instanceof FieldGroup.FieldIndicator) {
                    // if just an indicator is given, it is automatically subscribed to all
                    this._initializeIndicator('all', curInput, inds);
                }
                else {
                    for (indicatorKey in inds) {
                        curIndsJson = inds[indicatorKey];
                        if (YL.isArray(curIndsJson)) {
                            for (j = 0 ; j < curIndsJson.length; ++j) {
                                this._initializeIndicator(indicatorKey, curInput, curIndsJson[j]);
                            }
                        }
                        else {
                            this._initializeIndicator(indicatorKey, curInput, curIndsJson);
                        }
                    }
                }

                ind = inputCfg.indicator;
                if (ind) {
                    if (ind instanceof FieldGroup.FieldIndicator) {
                        // if just an indicator is given, it is automatically subscribed to all
                        this._initializeIndicator('all', curInput, ind);
                    }
                    else {
                        if (YL.isArray(ind)) {
                            for (j = 0 ; j < ind.length; ++j) {
                                this._initializeIndicator('invalid', curInput, ind[j]);
                            }
                        }
                        else {
                            this._initializeIndicator('invalid', curInput, ind);
                        }
                    }
                }


                this._validation.push(curInput);
            }
        },
        /**
         * This will check if the given input is a select.  If it is then it will
         * register the on change event with the delegate function
         * @method _checkSelect
         */
        _checkSelect: function (input) {
            if (input instanceof FieldGroup) {
                input.subscribe('selectChange', function (eventName, args) {
                    this._onSelectChange(null, args[0], null);
                }, this, true);
            }
            else {
                var element = input.get('element');
                if (element.tagName.toLowerCase() === 'select') {
                    YE.on(element, 'change', function () {
                        this._onSelectChange(element);
                    }, this, true);
                }
            }
        },
        _onSelectChange: function (element) {
            this.fireEvent('selectChange', element);
        },
        /**
         * This will initialize the indicator using the given indicator configuration
         * would could be an indicator object itself, or the configuration for an indicator
         * @method _initializeIndicator
         * @param {String|Object} eventKey Key for a default event configuration, or the event configuration itself.
         * @param {YAHOO.widget.FieldValidator} fieldValidator validation input the field indicator will be associated with.
         * @param {Object|YAHOO.widget.FieldIndicator} indicatorConfig The configuration for the indicator, or the indicator object itself.
         */
        _initializeIndicator: function (eventKey, fieldValidator, indicatorConfig) {
            var indicator;
            if (indicatorConfig instanceof FieldGroup.FieldIndicator) {
                indicator = indicatorConfig;
            }
            else {
                indicator = new FieldGroup.FieldIndicator(indicatorConfig, fieldValidator.get('element'));
            }
            indicator.registerEvents(fieldValidator, eventKey);
            this._indicators.push(indicator);
        },
        /**
         * This will return validators or groups with the given id.
         * @method getById
         * @return {YAHOO.widget.FieldValidator | YAHOO.widget.FieldGroup} validator or form group with the given id.
         */
        getById: function (id) {
            var vs = this._validation, i, temp;
            for (i = 0; i < vs.length; ++i) {
                if (vs[i] instanceof FieldGroup) {
                    if (vs[i].id === id) {
                        return vs[i];
                    }
                    else {
                        temp = vs[i].getById(id);
                        if (temp) {
                            return temp;
                        }
                    }
                }
                else if (vs[i].get('element').id === id) {
                    return vs[i];
                }
            }
            return null;
        },
        /**
         * Given an input DOM, this will return the field's validation object
         * @method getValidatorByInput
         * @param {HTMLElement | String} dom Dom object or id of dom object.
         * @param {boolean} noGroups If set to true, groups will not be returned, only the validator.  If true, then if the dom is in a group, then the group will be returned instead of the group
         * @return {YAHOO.widget.FieldValidator} Field Validator that matches the given dom.
         */
        getValidatorByInput: function (dom, noGroups) {
            var vs = this._validation, i, tempValidator, oDom = dom;
            if (YL.isString(oDom)) {
                oDom = YD.get(oDom);
            }

            if (!oDom) {
                return null;
            }
            for (i = 0; i < vs.length; ++i) {
                if (vs[i] instanceof FieldGroup) {
                    tempValidator = vs[i].getValidatorByInput(dom);
                    if (tempValidator) {
                        if (noGroups) {
                            return tempValidator;
                        }
                        else {
                            return vs[i];
                        }
                    }
                }
                else if (vs[i].get('element') === dom) {
                    return vs[i];
                }
            }
            return null;
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
    };
    YL.augmentObject(FieldGroup.prototype, AP.prototype);

    YW.FieldGroup = FieldGroup;
    if (YW.FormValidator) {
        YW.FormValidator.FieldGroup = FieldGroup;
    }
}());