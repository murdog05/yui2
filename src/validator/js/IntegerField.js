(function()
{
    var Y = YAHOO,
    YU = Y.util,
    validator = YAHOO.widget;
    /**
     * This input field is for text input of whole numbers.
     * @requires yahoo.base, yahoo.dom, yahoo.event
     * @namespace YAHOO.widget
     * @class IntegerField
     * @extends YAHOO.widget.DoubleField
     * @constructor
     * @param {Object} config Configuration JSON.
     */
    function _IntegerField(config){
        _IntegerField.superclass.constructor.apply(this,arguments);
        this.set('regex',validator.BaseInputField.staticVariables.INTEGERREGEX);
    }
    _IntegerField.ATTRS = {};
    _IntegerField.NAME = 'IntegerField';
    Y.extend(_IntegerField,validator.DoubleField,{
        /**
         * This method returns true if the input in the input DOM's value matches
         * the format required for an integer.
         * @method isValid
         * @return {boolean} true if the field is a valid integer
         */
        isValid:function(){
            if (!_IntegerField.superclass.isValid.call(this)){
                return false; // return false if it doesn't match the double regex
            }
            else if (this.get('optional') && this.isEmpty()){
                return true;
            }

            var value = this.get('inputDOM').value,theVal = 0;
            if ( value.indexOf( '.' ) != -1 ){
                return false; // don't allow numbers with decimals
            }
            try{theVal = parseInt(value,10);}
            catch(e){return false;}

            if ( theVal.toString().toLowerCase() == 'nan' ){
                return false;
            }
            else{
                return true;
            }
        }
    });
    validator.IntegerField = _IntegerField;
}());