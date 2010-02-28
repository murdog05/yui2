/**
 * For group inputs, allow for sub elements to be put into the validator object.
 * There will then be a group validator that will be used to determine if the
 * group is valid.
 *
 * Have a predefined indicators for a group for valid and invalid where the show
 * subscribes to inputValid, and the hide subscribes to the inputEmpty event.  To do
 * this, the EMPTY event must be fired second (change the validator isValid function
 * to do this).  If its done this way, the grou behaviour sounds be implemented soundly.
 *
 * Put these new predefined indicators in the form class under the property FormValidator.indicators.group
 * so they are their own group of default indicators.
 */

/**
 * This will house the validation function which
 * will perform the validation on the input field from the form.
 * @namespace YAHOO.widget
 */
(function()
{
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YW = Y.widget,
    YD = YU.Dom
    /**
     * The field validator class is
     * @class FieldValidator
     * @constructor
     * @param {HTMLElement} el The input element the field validator is for.
     * @param {Object|String|Function} config Configuration for the validation
     */
    function FieldValidator(el,config){
        FieldValidator.superclass.constructor.apply(this,[el,FieldValidator._initConfig(config)]);
        this._initializeValidator();
    }    

    YL.augmentObject(FieldValidator,{
        /**
         * The maximum value for an integer.  Used as a default min/max value on number fields
         * @property MAX_INTEGER
         * @type number
         * @static
         */
        MAX_INTEGER:2147483647,
        /**
         * Regular expression used by the Integer field for ensuring the input matches the format of an integer
         * @property INTEGERREGEX
         * @type regex
         * @static
         */
        INTEGERREGEX:/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/,
        /**
         * Regular expression used by the DoubleField for ensuring the input matches the format of an double
         * @property DOUBLEREGEX
         * @type regex
         * @static
         */
        DOUBLEREGEX:/(^-?\d\d*\.\d+$)|(^-?\d\d*$)|(^-?\.\d\d*$)/,
        /**
         * Regular expression for an e-mail.
         * @property EMAILREGEX
         * @type regex
         * @static
         */
        EMAILREGEX:/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
        /**
         * Given a configuration that could be a string, function or a configuration object,
         * this will ensure a proper configuration object is returned and passed to the super class.
         * @method _initConfig
         * @param {Object|String|Function} config Configuration for the field validation
         * @return {Object} configuration object for the field validation.
         */
        _initConfig:function(config){
            var oConfig;
            // if all that is given is a function or a string, then we put it as the type in a configuration object
            // and initialize from there.
            if (YL.isFunction(config) || YL.isString(config)){
                oConfig = {
                    type:config
                };
            }
            else if (YL.isObject(config)){
                // otherwise, we assume its an object, and
                oConfig = config;
            }
            else{
                YAHOO.log('Invalid configuration provided for form element.  Must provide string, function or configuration object.','warn','FieldValidator');
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
        _initializeChecker:function(key,val,map){
            var checker = val,temp,regex;
            if (!checker) {
                return null;
            }
            else if (YL.isString(checker)){
                // check and see if the string is a predefined validator function
                temp = map[checker.toLowerCase()];
                // if it isn't, then we will assume its a regular expression
                if (!temp){
                    regex = new RegExp(checker);
                    return function(el){
                        return regex.test(el.value);
                    };
                }
                else{
                    return temp;
                //this.set(key,temp);
                }
            }
            else if (!YL.isFunction(checker)){
                YAHOO.log('Please provide a valid type, function or regular expression for the ' + key + ' attribute','warn','FieldValidator');
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
        Validators:{
            integer:function(el){
                var value = el.value,theVal;
                if (!FieldValidator.INTEGERREGEX.test(value)){
                    //this.fireEvent('incorrectFormat');
                    this.addMeta('incorrectFormat','Format of number is incorrect')
                    return false;
                }
                if ( value.indexOf( '.' ) != -1 ){
                    this.addMeta('incorrectFormat','Format of number is incorrect')
                    return false; // don't allow numbers with decimals
                }
                try{
                    theVal = parseInt(value,10);
                }
                catch(e){
                    return false;
                }

                if ( theVal.toString().toLowerCase() == 'nan' ){
                    this.addMeta('incorrectFormat','Format of number is incorrect')
                    return false;
                }
                else{
                    return this._validation._checkRange(theVal,this);
                }
            },
            'double':function(el){
                var value = el.value,numVal = 0,maxDecimals = this._validation.get('maxDecimalPlaces'),decimals;
                if ((maxDecimals != -1) && (value.indexOf('.') != -1)){
                    this.addMeta('incorrectFormat','Format of double is incorrect')
                    decimals = value.split('.')[1];
                    if (decimals.length > maxDecimals) {
                        return false;
                    }
                }
                if (!YW.FieldValidator.DOUBLEREGEX.test(el.value)){
                    this.addMeta('incorrectFormat','Format of double is incorrect')
                    return false;
                }                
                try{
                    numVal = parseFloat(value,10);
                }
                catch(e){
                    return false;
                }

                if (!numVal.toString()){
                    this.addMeta('incorrectFormat','Format of double is incorrect')
                    return false;
                }
                if (numVal.toString().toLowerCase() == 'nan'){
                    this.addMeta('incorrectFormat','Format of double is incorrect')
                    return false;
                }
                return this._validation._checkRange(numVal,this);
            },
            text:function(el){
                // TODO: Put in length checking, perhaps use the max property, then the same functionality
                // from range checking on numbers can be re-used
                return el.value !== ''
            },
            email:function(el){
                // TODO: Put in length checking
                return YW.FieldValidator.EMAILREGEX.test(el.value);
            },
            checked:function(el){
                return el.checked;
            },
            unchecked:function(el){
                return !el.checked;
            }
        },
        /**
         * Premade functions that specify when an input is considered empty.
         * More can be added, as well as the existing one overridden.
         * @property EmptyWhen
         * @static
         * @type Object
         */
        EmptyWhen:{
            notext:function(el){
                return el.value === '';
            }
        }
    });

    YL.extend(FieldValidator,YU.Element,{
        /**
         * Validator function to be used to check if the value in the input field
         * is valid.
         * @property _validator
         * @type function
         * @private
         */
        _validator:null,
        /**
         * Implementation of Element's abstract method. Sets up config values.
         *
         * @method initAttributes
         * @param config {Object} (Optional) Object literal definition of configuration values.
         * @private
         */
        initAttributes:function(config){
            var oConfigs = config || {};
            FieldValidator.superclass.initAttributes.call(this, oConfigs);

            /**
             * This is only for a group input.  For a group type input
             * the children will be used to determine the validity of the input.
             * @config children
             * @type Object[]
             */
            this.setAttributeConfig('children',{
                value:[],
                validator:YL.isArray
            });
            /**
             * This is set to true if the minimum allowed values boundary is inclusive
             * @config minInclusive
             * @type boolean
             */
            this.setAttributeConfig('minInclusive',{
                value:true,
                validator:YL.isBoolean
            });
            /**
             * This is set to true if the maximum allowed values boundary is inclusive
             * @config maxInclusive
             * @type boolean
             */
            this.setAttributeConfig('maxInclusive',{
                value:true,
                validator:YL.isBoolean
            });
            /**
             * This is the minimum allowed value in the double field.  Default value
             * is the minimum value for an integer
             * @config min
             * @type number
             */
            this.setAttributeConfig('min',{
                value:(-1)*YW.FieldValidator.MAX_INTEGER,
                validator:YL.isNumber,
                setter:function(val){
                    if (val < (-1)*YW.FieldValidator.MAX_INTEGER){
                        return (-1)*YW.FieldValidator.MAX_INTEGER;
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
            this.setAttributeConfig('max',{
                value:YW.FieldValidator.MAX_INTEGER,
                validator:YL.isNumber,
                setter:function(val){
                    if (val < (-1)*YW.FieldValidator.MAX_INTEGER){
                        return (-1)*YW.FieldValidator.MAX_INTEGER;
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
            this.setAttributeConfig('maxDecimalPlaces',{
                value:-1,
                validator:YL.isNumber
            });
            /**
             * This is the type of validation, text is set by default
             * @config type
             * @type function
             */
            this.setAttributeConfig('type',{
                value:'text',
                setter:function(val){
                    return FieldValidator._initializeChecker('type',val,FieldValidator.Validators);
                }
            });
            this.set('type','text');
            /**
             * This is the type of validation, text is set by default
             * @config empty
             * @type empty
             */
            this.setAttributeConfig('empty',{
                value:'notext',
                setter:function(val){
                    return FieldValidator._initializeChecker('empty',val,FieldValidator.EmptyWhen);
                }
            });
            this.set('empty','notext');
            /**
             * If set, this will show that the input is considered optional, and if not filled
             * in, won't cause the form to be invalid.
             * @config optional
             * @type boolean
             */
            this.setAttributeConfig('optional',{
                value:false,
                validator:YL.isBoolean
            });
        },
        /**
         * This function will initialize the configuration attributes of the validator for validation
         * @method _initializeValidator
         * @private
         */
        _initializeValidator:function(){
//            this._validator = this.get('type');
//            this._empty = this.get('empty');
            //alert(this._m)
        },
        /**
         * This will return an object that will operate as the scope for the
         * validation function to execute in.  This will provide the ability to
         * store an error message under a key, as well as access the validator
         * and the input.
         * @method _getMetaWrapper
         * @return {Object} meta object the validation and empty functions operate in.
         */
        _getMetaWrapper:function(){
            var meta = {
                metaData:{},
                _validation:this,
                addMeta:function(key,msg){
                    this.metaData[key] = msg;
                },
                _validator:this.get('type'),
                _empty:this.get('empty')
            };
            return meta;
        },
        /**
         * This will return true if the input is empty.  By default this will
         * return true if the value in the input field is ''.
         * @method isEmpty
         * @return {boolean} true if the value is considered empty by the empty function used.
         */
        isEmpty:function(){
            return this._getMetaWrapper()._empty(this.get('element'));
        },
        /**
         * This will check the validity of the input
         * and throw the proper events based on the empty and validation functions.
         * @method validate
         * @param {boolean} silent If true, the validator will not fire any events.
         * @return {boolean} true if the input is considered valid.
         */
        validate:function(silent){
            var isEmpty,isValid,el,optional = this.get('optional');
            el = this.get('element');
            var meta = this._getMetaWrapper();
            isEmpty = meta._empty(el,meta);
            isValid = meta._validator(el,meta) || (isEmpty && optional);
            // if silent, don't invoke any events
            if (silent === true){
                return isValid;
            }
            if (isEmpty){
                this.fireEvent('inputEmpty',[meta.metaData,this]);
            }
            else{
                this.fireEvent('inputNotEmpty',[meta.metaData,this]);
            }

            if (isValid){
                this.fireEvent('inputValid',[meta.metaData,this]);
            }
            else{
                this.fireEvent('inputInvalid',[meta.metaData,this]);
            }
            this.fireEvent('inputValueChange',[meta.metaData,this]);
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
        _checkRange:function(numVal,errorMeta){
            var minInclusive,maxInclusive,min,max;
            minInclusive = this.get('minInclusive');
            maxInclusive = this.get('maxInclusive');
            min = this.get('min');
            max = this.get('max');
            if (minInclusive && (min > numVal)){
                errorMeta.addMeta('numberBelowMin',{
                    min:min
                });
                return false;
            }
            else if (!minInclusive && (min >= numVal)){
                errorMeta.addMeta('numberBelowMin',{
                    min:min
                });
                return false;
            }
            else if (maxInclusive && (max < numVal)){
                errorMeta.addMeta('numberAboveMax',{
                    max:max
                });
                return false;
            }
            else if (!maxInclusive && (max <= numVal)){
                errorMeta.addMeta('numberAboveMax',{
                    max:max
                });
                return false;
            }
            else{
                return true;
            }
        },
        /**
         * This will return true if the input represented by this validator
         * is valid.
         * @method isValid
         * @return {boolean} true if the input is valid based on the configuration.
         */
        isValid:function(){
            var el = this.get('element');
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
    });
    YAHOO.widget.FieldValidator = FieldValidator;
    if (YW.FormValidator){
        YW.FormValidator.FieldValidator = FieldValidator;
    }
})();