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
 */
(function()
{
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YW = Y.widget,
    YD = YU.Dom
    function FieldValidator(el,config){
        FieldValidator.superclass.constructor.apply(this,arguments);
        this._initializeValidator();
    }    

    YL.augmentObject(FieldValidator,{
//        DefaultInitializer:{
//            /**
//             * This will initialize the events on the el as if it where
//             * a text input
//             */
//            _initializeTextChangeEvents:function(el,validator){
//                YU.Event.on(el,'keyup',validator._evntOnChange,validator,true);
//                YU.Event.on(el,'blur',validator._evntOnChange,validator,true);
//            },
//            /**
//             * This will initialize the change event to be fired when
//             * the input is clicked
//             */
//            _initializeClickEvent:function(el,validator){
//                YU.Event.on(el,'click',validator._evntOnChange,validator,true);
//            },
//            /**
//             * This will initialize the change event to be fired when the change
//             * event on the dom is fired.
//             */
//            _initializeChangeEvents:function(el,validator){
//                YU.Event.on(el,'change',validator._evntOnChange,validator,true);
//            }
//        },
        /**
         * This will initialize any property that is considered a checker.  A checker
         * is a function that will cause an event to happen based on its return value.
         * A checker function will always return a boolean value
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
         * Premade validator functions that cover most validation situations.
         */
        Validators:{
            integer:function(el){
                var value = el.value,theVal;
                if (!YW.FormValidator.INTEGERREGEX.test(value)){
                    //this.fireEvent('incorrectFormat');
                    this.addError('incorrectFormat','Format of number is incorrect')
                    return false;
                }
                if ( value.indexOf( '.' ) != -1 ){
                    this.addError('incorrectFormat','Format of number is incorrect')
                    return false; // don't allow numbers with decimals
                }
                try{theVal = parseInt(value,10);}
                catch(e){return false;}

                if ( theVal.toString().toLowerCase() == 'nan' ){
                    this.addError('incorrectFormat','Format of number is incorrect')
                    return false;
                }
                else{
                    return this._validation._checkRange(theVal,this);
                }
            },
            'double':function(el){
                var value = el.value,numVal = 0,maxDecimals = this._validation.get('maxDecimalPlaces'),decimals;
                if ((maxDecimals != -1) && (value.indexOf('.') != -1)){
                    this.addError('incorrectFormat','Format of double is incorrect')
                    decimals = value.split('.')[1];
                    if (decimals.length > maxDecimals) {
                        return false;
                    }
                }
                if (!YW.FormValidator.DOUBLEREGEX.test(el.value)){
                    this.addError('incorrectFormat','Format of double is incorrect')
                    return false;
                }                
                try{numVal = parseFloat(value,10);}
                catch(e){return false;}

                if (!numVal.toString()){
                    this.addError('incorrectFormat','Format of double is incorrect')
                    return false;
                }
                if (numVal.toString().toLowerCase() == 'nan'){
                    this.addError('incorrectFormat','Format of double is incorrect')
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
                return YW.FormValidator.EMAILREGEX.test(el.value);
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
        EmptyWhen:{
            notext:function(el){
                return el.value === '';
            }
        }
    });

    YL.augmentObject(FieldValidator,{
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
                setter:YW.FormValidator._setBoolean
            },
            /**
             * This is set to true if the maximum allowed values boundary is inclusive
             * @config maxInclusive
             * @type boolean
             */
            maxInclusive:{
                value:true,
                setter:YW.FormValidator._setBoolean
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
                        YAHOO.log('Invalid value given for min: ' + val,'warn','FieldValidator');
                        YAHOO.log(a,'warn','FieldValidator');
                    }
                    if (rtVl < (-1)*YW.FormValidator.MAX_INTEGER){
                        return (-1)*YW.FormValidator.MAX_INTEGER;
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
                value:YW.FormValidator.MAX_INTEGER,
                setter:function(val){
                    var rtVl = val;
                    if (!YL.isNumber(rtVl)){
                        rtVl = parseFloat(rtVl);
                    }
                    if (!YL.isNumber(rtVl)){
                        YAHOO.log('Invalid value given for max: ' + val,'warn','FieldValidator');
                    }
                    if (rtVl > YW.FormValidator.MAX_INTEGER){
                        return YW.FormValidator.MAX_INTEGER;
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
                        YAHOO.log('Invalid value given for decimal places: ' + val,'warn','FieldValidator');
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
                    return FieldValidator._initializeChecker('type',val,FieldValidator.Validators);
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
                    return FieldValidator._initializeChecker('empty',val,FieldValidator.EmptyWhen);
                }
            },
            /**
             * If set, this will show that the input is considered optional, and if not filled
             * in, won't cause the form to be invalid.
             * @config optional
             * @type boolean
             */
            optional:{
                value:false,
                setter:YW.FormValidator._setBoolean
            }
        }
        /**
         * There is an entry for every type of input this form validator deals with that uses the INPUT tag.
         * For each entry is a function which will subscribe a validator object
         * to the proper events of the input.  For example, a validator will be subscribe
         * to the text inputs onkeyup event, as well as the onblur event.  While for a checkbox, it
         * would be the checkbox's onclick event.
         */
//        InputEventInitializers:{
//            checkbox:FieldValidator.DefaultInitializer._initializeClickEvent,
//            radio:FieldValidator.DefaultInitializer._initializeClickEvent,
//            text:FieldValidator.DefaultInitializer._initializeTextChangeEvents,
//            hidden:FieldValidator.DefaultInitializer._initializeTextChangeEvents,
//            password:FieldValidator.DefaultInitializer._initializeTextChangeEvents,
//            file:FieldValidator.DefaultInitializer._initializeChangeEvents
//        },
        /**
         * These are the same initializers as in inputEventInitializers, except for NON-INPUT tags
         * such as select and textarea.
         */
//        OtherEventInitializers:{
//            textarea:FieldValidator.DefaultInitializer._initializeTextChangeEvents,
//            select:FieldValidator.DefaultInitializer._initializeChangeEvents
//        }
    });
    
    YL.extend(FieldValidator,YW.FormElement,{
        _validator:null,
        /**
         * Based on the type of input given, this will initailize the change events on that input.
         */
        //_initializeEvents:function(){
            /*var el = this.get('element'),type = el.getAttribute('type'),tagName = el.tagName.toLowerCase();
            if (tagName == 'input'){
                if (!type){
                    FieldValidator.DefaultInitializer._initializeTextChangeEvents(el,this);
                }
                else{
                    type = type.toLowerCase();
                    FieldValidator.InputEventInitializers[type](el,this);
                }
            }
            else{
                FieldValidator.OtherEventInitializers[tagName](el,this);
            }*/
        //},
        
        /**
         * This function will initialize the configuration attributes of the validator for validation
         */
        _initializeValidator:function(){
            this._validator = this.get('type');
            this._empty = this.get('empty');
            //this._initializeEvents();
        },
        /**
         * This is called when the input changes, this will determine which events
         * are fired from this validator
         */
        _evntOnChange:function(e){
            this.validate();
        },
        _getMetaWrapper:function(){
            var meta = {
                errors:{},
                _validation:this,
                addError:function(key,msg){
                    this.errors[key] = msg;
                },
                _validator:this._validator,
                _empty:this._empty
            };
            return meta;
        },
        isEmpty:function(){
            return this._getMetaWrapper()._empty(this.get('element'));
        },
        /**
         * This will check the validity of the input
         * and throw the proper events based on the empty and validation functions.
         */
        validate:function(silent){
            var isEmpty,isValid,el,optional = this.get('optional');
            el = this.get('element');
            var meta = this._getMetaWrapper();
            isEmpty = meta._empty(el);
            isValid = meta._validator(el) || (isEmpty && optional);

            // if silent, don't invoke any events
            if (silent === true){
                return isValid;
            }
            if (isEmpty){
                this.fireEvent('inputEmpty',[meta.errors,this]);
            }
            else{
                this.fireEvent('inputNotEmpty',[meta.errors,this]);
            }

            if (isValid){
                this.fireEvent('inputValid',[meta.errors,this]);
            }
            else{
                this.fireEvent('inputInvalid',[meta.errors,this]);
            }
            this.fireEvent('inputValueChange',[meta.errors,this]);
            return isValid;
        },
        /**
         * used only for numbers, this will check the range and fire
         * a value out of range event if the value is out of range.
         */
        _checkRange:function(numVal,errorMeta){
            var minInclusive,maxInclusive,min,max;
            minInclusive = this.get('minInclusive');
            maxInclusive = this.get('maxInclusive');
            min = this.get('min');
            max = this.get('max');            
            if (minInclusive && (min > numVal)){
                errorMeta.addError('numberBelowMin',{min:min});
                return false;
            }
            else if (!minInclusive && (min >= numVal)){
                errorMeta.addError('numberBelowMin',{min:min});
                return false;
            }
            else if (maxInclusive && (max < numVal)){
                errorMeta.addError('numberAboveMax',{max:max});
                return false;
            }
            else if (!maxInclusive && (max <= numVal)){
                errorMeta.addError('numberAboveMax',{max:max});
                return false;
            }
            else{
                return true;
            }
        },
        /**
         * This will return true if the input represented by this validator
         * is valid.
         */
        isValid:function(){
            var el = this.get('element');
            return this.validate(true);
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
    YAHOO.widget.FieldValidator = FieldValidator;
})();