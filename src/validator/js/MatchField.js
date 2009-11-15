(function()
{
    var Y = YAHOO,
    validator = YAHOO.widget;
    /**
     * This field is for matching two inputs on the form.  For instance, this would
     * be useful for having users re-enter passwords, or re-enter e-mail addresses.
     * @requires yahoo.base, yahoo.dom, yahoo.event
     * @namespace YAHOO.widget
     * @class MatchField
     * @extends YAHOO.widget.TextBaseField
     * @constructor
     * @param {Object} config Configuration JSON object.
     */
    function _MatchField(config){
        _MatchField.superclass.constructor.apply(this,arguments);
    }
    _MatchField.ATTRS = {
        /**
         * This is the dom that the match field will compare the input of its' own dom against.
         * @config matchDOM
         * @type HTMLElement
         */
        matchDOM:{
            value:null,
            setter:validator.BaseInputField.staticFunctions.standardElSetter
        },
        /**
         * If set to true, this will do a case sensitive match on the two input DOM's values
         * in order to determine if this field is valid.  True by default
         * @config caseSensitive
         * @type boolean
         */
        caseSensitive:{
            value:true,
            setter:validator.BaseInputField.staticFunctions.BOOLEANSETTER

        }
    };
    _MatchField.NAME = 'MatchField';
    Y.extend(_MatchField,validator.TextBaseField,{
        /**
         * This will return true if the match dom's value matches the input Dom's value.  The comparison
         * will be case sensitive depending on the case sensitive property.  The input is also NOT trimmed
         * so leading or tailing whitespace is included in the comparison.
         * @method isValid
         * @return {boolean} true if the match dom's value matches the input dom's value.
         */
        isValid:function(){
            if (!this.get('isOn')){
                return true;
            }
            else if (this.get('optional') && this.isEmpty()){
                return true;
            }
            var matchDom = this.get('matchDOM'),
            inputDom = this.get('inputDOM');
            if (this.isEmpty()){
                return false;
            }
            if (this.get('caseSensitive')){
                return matchDom.value == inputDom.value;
            }
            else{
                return matchDom.value.toLowerCase() == inputDom.value.toLowerCase();
            }
        }
    });
    validator.MatchField = _MatchField;
}());