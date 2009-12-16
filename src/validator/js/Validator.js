if (YAHOO.widget === null || YAHOO.widget === undefined){
    YAHOO.widget = {};
}

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
 * Put these new predefined indicators in the form class under the property Form.indicators.group
 * so they are their own group of default indicators.
 */

/**
 * This will house the validation function which
 * will perform the validation on the input field from the form.
 */
(function()
{
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YW = Y.widget,
    YD = YU.Dom
    function Validator(el,config){
        Validator.superclass.constructor.apply(this,arguments);
        this._initializeValidator(config);
    }    

    YL.augmentObject(Validator,{
        defaultInitializer:{
            /**
             * This will initialize the events on the el as if it where
             * a text input
             */
            _initializeTextChangeEvents:function(el,validator){
                YU.Event.on(el,'keyup',validator._evntOnChange,validator,true);
                YU.Event.on(el,'blur',validator._evntOnChange,validator,true);
            },
            /**
             * This will initialize the change event to be fired when
             * the input is clicked
             */
            _initializeClickEvent:function(el,validator){
                YU.Event.on(el,'click',validator._evntOnChange,validator,true);
            },
            /**
             * This will initialize the change event to be fired when the change
             * event on the dom is fired.
             */
            _initializeChangeEvents:function(el,validator){
                YU.Event.on(el,'change',validator._evntOnChange,validator,true);
            }
        },
        /**
         * This will initialize any property that is considered a checker.  A checker
         * is a function that will cause an event to happen based on its return value.
         * A checker function will always return a boolean value
         */
        _initializeChecker:function(key,val,map){
            var checker = val,temp,regex;
            if (checker === null || checker === undefined){
                return null;
            }
            else if (YL.isString(checker)){
                // check and see if the string is a predefined validator function
                temp = map[checker.toLowerCase()];
                // if it isn't, then we will assume its a regular expression
                if ((temp === undefined) || (temp === null)){
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
                throw 'Please provide a valid type, function or regular expression for the ' + key + ' attribute';
            }
            return checker;
        },
        /**
         * Premade validator functions that cover most validation situations.
         */
        validators:{
            integer:function(el){
                var value = el.value,theVal;
                if (!YW.Form.INTEGERREGEX.test(value)){
                    this.fireEvent('incorrectFormat');
                    return false;
                }
                if ( value.indexOf( '.' ) != -1 ){
                    this.fireEvent('incorrectFormat');
                    return false; // don't allow numbers with decimals
                }
                try{theVal = parseInt(value,10);}
                catch(e){return false;}

                if ( theVal.toString().toLowerCase() == 'nan' ){
                    this.fireEvent('incorrectFormat');
                    return false;
                }
                else{
                    this.fireEvent('correctFormat');
                    return this._checkRange(theVal);
                }
            },
            'double':function(el){
                var value = el.value,numVal = 0,maxDecimals = this.get('maxDecimalPlaces'),decimals;
                if ((maxDecimals != -1) && (value.indexOf('.') != -1)){
                    this.fireEvent('incorrectFormat');
                    decimals = value.split('.')[1];
                    if (decimals.length > maxDecimals) {
                        return false;
                    }
                }
                if (!YW.Form.DOUBLEREGEX.test(el.value)){
                    this.fireEvent('incorrectFormat');
                    return false;
                }                
                try{numVal = parseFloat(value,10);}
                catch(e){return false;}

                if (numVal.toString() === null || numVal.toString() === undefined){
                    this.fireEvent('incorrectFormat');
                    return false;
                }
                if (numVal.toString().toLowerCase() == 'nan'){
                    this.fireEvent('incorrectFormat');
                    return false;
                }
                return this._checkRange(numVal);
            },
            text:function(el){
                // TODO: Put in length checking, perhaps use the max property, then the same functionality
                // from range checking on numbers can be re-used
                return el.value !== ''
            },
            email:function(el){
                // TODO: Put in length checking
                return YW.Form.EMAILREGEX.test(el.value);
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
         */
        emptyWhen:{
            notext:function(el){
                return el.value === '';
            }
        }
    });

    YL.augmentObject(Validator,{
        ATTRS:{
            /**
             * This is only for a group input.  For a group type input
             * the children will be used to determine the validity of the input.
             */
            children:{
                value:null
            },
            /**
             * This is set to true if the minimum allowed values boundary is inclusive
             * @config minInclusive
             * @type boolean
             */
            minInclusive:{
                value:true,
                setter:YW.Form._setBoolean
            },
            /**
             * This is set to true if the maximum allowed values boundary is inclusive
             * @config maxInclusive
             * @type boolean
             */
            maxInclusive:{
                value:true,
                setter:YW.Form._setBoolean
            },
            /**
             * This is the minimum allowed value in the double field.  Default value
             * is the minimum value for an integer
             * @config min
             * @type number
             */
            min:{
                value:0,
                setter:function(val){
                    var rtVl = val;
                    if (!YL.isNumber(rtVl)){
                        rtVl = parseFloat(rtVl);
                    }
                    if (!YL.isNumber(rtVl)){
                        throw 'Invalid value given for min: ' + val;
                    }
                    if (rtVl < (-1)*YW.Form.MAX_INTEGER){
                        return (-1)*YW.Form.MAX_INTEGER;
                    }
                    return rtVl;
                }
            },
            /**
             * This is the maximum allowed value in the double field. Default value
             * is the maximum value for an integer
             * @config max
             * @type number
             */
            max:{
                value:YW.Form.MAX_INTEGER,
                setter:function(val){
                    var rtVl = val;
                    if (!YL.isNumber(rtVl)){
                        rtVl = parseFloat(rtVl);
                    }
                    if (!YL.isNumber(rtVl)){
                        throw 'Invalid value given for max: ' + val;
                    }
                    if (rtVl > YW.Form.MAX_INTEGER){
                        return YW.Form.MAX_INTEGER;
                    }
                    return rtVl;
                }
            },
            /**
             * If set, this will restrict the number of decimal places allowed on the double.  This could
             * be done with regular expression, but this makes it a bit easier for everyone.
             * @config maxDecimalPlaces
             * @type number
             */
            maxDecimalPlaces:{
                value:-1,
                setter:function(val){
                    var rtVl = val;
                    if (!YL.isNumber(rtVl)){
                        rtVl = parseInt(rtVl,10);
                    }
                    if (!YL.isNumber(rtVl)){
                        throw 'Invalid value given for decimal places: ' + val;
                    }
                    else{
                        return val;
                    }
                }
            },
            /**
             * This is the type of validation, text is set by default
             * @config type
             * @type function
             */
            type:{
                value:'text',
                setter:function(val){
                    return Validator._initializeChecker('type',val,Validator.validators);
                }
            },
            /**
             * This is the type of validation, text is set by default
             * @config empty
             * @type empty
             */
            empty:{
                value:'notext',
                setter:function(val){
                    return Validator._initializeChecker('empty',val,Validator.emptyWhen);
                }
            }
        },
        /**
         * There is an entry for every type of input this form validator deals with that uses the INPUT tag.
         * For each entry is a function which will subscribe a validator object
         * to the proper events of the input.  For example, a validator will be subscribe
         * to the text inputs onkeyup event, as well as the onblur event.  While for a checkbox, it
         * would be the checkbox's onclick event.
         */
        inputEventInitializers:{
            checkbox:Validator.defaultInitializer._initializeClickEvent,
            radio:Validator.defaultInitializer._initializeClickEvent,
            text:Validator.defaultInitializer._initializeTextChangeEvents,
            hidden:Validator.defaultInitializer._initializeTextChangeEvents,
            password:Validator.defaultInitializer._initializeTextChangeEvents,
            file:Validator.defaultInitializer._initializeChangeEvents
        },
        /**
         * These are the same initializers as in inputEventInitializers, except for NON-INPUT tags
         * such as select and textarea.
         */
        otherEventInitializers:{
            textarea:Validator.defaultInitializer._initializeTextChangeEvents,
            select:Validator.defaultInitializer._initializeChangeEvents
        }
    });
    
    YL.extend(Validator,YW.FormElement,{
        _validator:null,
        /**
         * Based on the type of input given, this will initailize the change events on that input.
         */
        _initializeEvents:function(){
            var el = this.get('element'),type = el.getAttribute('type'),tagName = el.tagName.toLowerCase();
            if (tagName == 'input'){
                if (type === null || type === undefined){
                    Validator.defaultInitializer._initializeTextChangeEvents(el,this);
                }
                else{
                    type = type.toLowerCase();
                    Validator.inputEventInitializers[type](el,this);
                }
            }
            else{
                Validator.otherEventInitializers[tagName](el,this);
            }            
        },
        
        /**
         * This function will initialize the configuration attributes of the validator for validation
         */
        _initializeValidator:function(){
            this._validator = this.get('type');
            this._empty = this.get('empty');
            this._initializeEvents();
        },
        /**
         * This is called when the input changes, this will determine which events
         * are fired from this validator
         */
        _evntOnChange:function(e){
            this.checkStatus()
        },
        /**
         * This will check the validity of the input
         * and throw the proper events based on the empty and validation functions.
         */
        checkStatus:function(){
            var isEmpty,isValid,el;
            el = this.get('element');
            isEmpty = this._empty(el);
            isValid = this._validator(el);
            
            if (isEmpty){
                this.fireEvent('inputEmpty');
            }
            else{
                this.fireEvent('inputNotEmpty');
            }

            if (isValid){
                this.fireEvent('inputValid');
            }
            else{
                this.fireEvent('inputInvalid');
            }
            this.fireEvent('inputValueChange');
            return isValid;
        },
        /**
         * used only for numbers, this will check the range and fire
         * a value out of range event if the value is out of range.
         */
        _checkRange:function(numVal){
            var minInclusive,maxInclusive,min,max;
            minInclusive = this.get('minInclusive');
            maxInclusive = this.get('maxInclusive');
            min = this.get('min');
            max = this.get('max');            
            if (minInclusive && (min > numVal)){
                this.fireEvent('numberOutOfRange');
                return false;
            }
            else if (!minInclusive && (min >= numVal)){
                this.fireEvent('numberOutOfRange');
                return false;
            }
            else if (maxInclusive && (max < numVal)){
                this.fireEvent('numberOutOfRange');
                return false;
            }
            else if (!maxInclusive && (max <= numVal)){
                this.fireEvent('numberOutOfRange');
                return false;
            }
            else{
                this.fireEvent('numberInRange');
                return true;
            }
        },
        /**
         * This will return true if the input represented by this validator
         * is valid.
         */
        isValid:function(){
            var el = this.get('element');
            return this._validator(el);
        }
    /**
         * Fires when the input is considered valid
         * @event inputValid
         */
    /**
         * Fires when the input is considered invalid
         * @event inputInvalid
         */
    /**
         * Fires when the input is considered empty
         * @event inputEmpty
         */
    /**
         * Fires when the input is considered non-empty
         * @event inputNotEmpty
         */
        /**
         * Can be fired by the validation function to state that a number comparison is out of range
         * @event numberOutOfRange
         */
        /**
         * Can be fired by the text input to state that the given text is too long
         * @event textTooLong
         */
    });
    YAHOO.widget.Validator = Validator;
})();