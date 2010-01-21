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
        FormElement.superclass.constructor.apply(this,[el,map]);
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
            if (!el){
                return null;
            }
            var rtVl = el;
            if (YL.isString(el)){
                rtVl = YD.get(el);
            }
            if (!rtVl){
                return el;
            }
            else{
                return rtVl;
            }
        }
    })
    YL.extend(FormElement,YAHOO.util.Element,{
        initAttributes:function(map){
            var key,attrs;
            if (!map){
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

