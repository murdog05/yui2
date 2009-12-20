/**
 * THis will be the base class that all other form elements inherit from.  THis
 * will inherit from element
 */
(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YE = YU.Event,
    YW = Y.widget,
    YD = YU.Dom;
    function FormElement(el,map){
        FormElement.superclass.constructor.apply(this,[el,this._copy(map)]);
    }
    YL.augmentObject(FormElement,{
        /**
         * Static function for setting an dom element as an attribute.  This will
         * allow that attribute to support an id or the element itself.
         * @method standardElSetter
         * @static
         * @param {HTMLElement|String} el Id or el that is to be set for the property in question.
         * @return {HTMLElement} dom object
         */
        standardElSetter:function(el){
            if (el === null || el === undefined){
                return null;
            }
            var rtVl = el;
            if (YL.isString(el)){
                rtVl = YD.get(el);
            }
            if (rtVl === null || rtVl === undefined){
                return el;
            }
            else{
                return rtVl;
            }
        }
    })
    YL.extend(FormElement,YAHOO.util.Element,{
        /**
         * This will make a copy of the given object
         */
        _copy:function(obj){
            var key,val,copy = {};
            if (obj === null || obj === undefined){
                return {};
            }
            if (YL.isString(obj) || YL.isNumber(obj) || YL.isFunction(obj)){
                return obj;
            }
            for (key in obj){
                val = obj[key];
                if (val instanceof YW.FormElement){
                    copy[key] = val;
                }
                else if (YL.isArray(val)){                    
                    copy[key] = val;
                }
                else if (YL.isFunction(val)){
                    copy[key] = val;
                }
                else if (YL.isObject(val)){
                    copy[key] = this._copy(val);
                }
                else{
                    copy[key] = val;
                }
            }
            return copy;
        },
        initAttributes:function(map){
            var key,attrs;
            if (map === null || map === undefined){
                return;
            }
            FormElement.superclass.initAttributes.apply(this,arguments);
            attrs = this.constructor.ATTRS;
            for (key in attrs){
                this.setAttributeConfig(key,attrs[key]);
                if (map[key] !== undefined){
                    this.set(key,map[key]);
                }
                else{
                    this.set(key,attrs[key].value);
                }
            }
        }
    });
    YW.FormElement = FormElement;
})();

