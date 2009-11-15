(function()
{
    var Y = YAHOO,
    YL = Y.lang,
    validator = YAHOO.widget;
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
        test1:{
            value:'someval1',
            setter:function(val){
                return val + '_modified';
            }
        },
        test2:{
            value:'anotherVal'
        }
    };

    _ValidatorBase.prototype = {
        //ATTRS:null,
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