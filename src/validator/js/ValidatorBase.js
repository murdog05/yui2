(function()
{
    var Y = YAHOO,
    YL = Y.lang,
    validator = YAHOO.widget;
    /**
     * This is the base class that provides easy setting and retreival of configuration attributes.
     * @requires yahoo.base, yahoo.dom, yahoo.event
     * @namespace YAHOO.widget
     * @class ValidatorBase
     * @constructor
     * @param {Object} config Configuration object containing everything for configuring the form validator object.
     */
    function _ValidatorBase(config){
        var ATTRS = {},currentConstructor = this.constructor;
        this.getATTRS = function() {return ATTRS;};
        
        while (currentConstructor !== null && currentConstructor !== undefined){
            this._initializeAttr(currentConstructor.ATTRS);
            if (currentConstructor.superclass === null || currentConstructor.superclass === undefined){
                break;
            }
            else{
                currentConstructor = currentConstructor.superclass.constructor;
            }
        }
        this._initializeCfg(config);
    }
    
    _ValidatorBase.ATTRS = {        
    };

    _ValidatorBase.prototype = {
        /**
         * This will initialize the given ATTRS block by merging it into the main private
         * ATTRs variable
         * @method _initializeAttr
         * @param {Object} ATTRS Attribute settings
         */
        _initializeAttr:function(ATTRS){
            var _ATTRS = this.getATTRS(),
            key,theVal;
            for (key in ATTRS){
                theVal = ATTRS[key].value;
                if (YL.isArray(theVal)){
                    theVal = [];
                }
                _ATTRS[key] = {
                    value:theVal,
                    hasBeenSet:false,
                    setter:ATTRS[key].setter
                }
            }
        },        
        /**
         * This will take the given configuration, and merge it with the
         * properties in the ATTR.
         * @method _initializeCfg
         * @param {Object} config Configuration object.
         */
        _initializeCfg:function(config){
            if (config === null || config === undefined) return; // don't do anything will null config
            var ATTRS = this.getATTRS(),key,value;
            for (key in ATTRS){
                value = config[key];
                if (value !== null && value !== undefined){
                    this.set(key,value);
                }
            }
        },
        /**
         * This will set the given value under the given key in the settings
         * @method set
         * @param {string} key Name of the property the value will be set
         * @param {object} val Value to be set for the propert, this can be anything.
         */
        set:function(key,val){
            var ATTRS = this.getATTRS(),
            att = ATTRS[key],call;
            if (att !== null && att !== undefined){
                if (att.setter !== null && att.setter !== undefined){
                    call = {
                        field:this,
                        setter:att.setter
                    }
                    att.value = call.setter(val);

                    att.hasBeenSet = true;
                }
                else{
                    att.value = val;
                }
            }
            else{
                ATTRS[key] = {value:val};
            }
        },
        /**
         * This will return the value with the given property name
         * @method get
         * @param {string} key Name of the property.
         * @return {object} value stored under the given property name.
         */
        get:function(key){
            var ATTRS = this.getATTRS(),att = ATTRS[key],call;
            if (att === null || att === undefined){
                return null;
            }
            else{
                if (att.hasBeenSet){
                    return att.value;
                }
                else if (att.setter !== null && att.setter !== undefined){
                    att.hasBeenSet = true;
                    if (att.value === null || att.value === undefined){
                        return null;
                    }
                    else{
                        call = {
                            field:this,
                            setter:att.setter
                        }
                        return call.setter(att.value);
                    }
                }
                else{
                    return att.value;
                }
            }
        }
    };
    validator.ValidatorBase = _ValidatorBase;
}());