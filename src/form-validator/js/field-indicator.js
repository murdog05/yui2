(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YE = YU.Event,
    YW = Y.widget,
    YD = YU.Dom;
    /**
     * Augment the form object with the indicator event definitions.
     */
    YL.augmentObject(YW.FormValidator,{
        FormEvents:{
            notInRange:function(){
                return {
                    show:['numberOutOfRange'],
                    hide:['inputEmpty','numberInRange','incorrectFormat']
                };
            },
            valid:function(){
                return {
                    hide:['inputInvalid'],
                    show:['inputValid']
                };
            },
            invalid:function(){
                return {
                    show:['inputInvalid'],
                    hide:['inputValid']
                };
            },
            all:function(){
                return {
                    show:['inputValueChange']
                };
            }
        }
    });

    /**
     * Augment form with standard indicator definitions.
     */
    YL.augmentObject(YW.FormValidator,{
        Indicators:{
            correct:function(){
                return {className:'indicator'};
            },
            incorrect:function(){
                return {className:'validator'};
            }
        }
    });

    /**
     * The indicator represents a dom element that will appear to signify one of many different
     * status' of an input field.  For instance, it could show up when the field is valid, or when
     * the field is invalid, or when the number value in the field is out of the specified range.
     */
    function FieldIndicator(el,config){
        FieldIndicator.superclass.constructor.apply(this,arguments);
    }
    YL.augmentObject(FieldIndicator,{
        ATTRS:{
            formatter:{
                value:function(fieldValidator,fieldIndicator,meta) {
                    fieldIndicator.get('element').style.display = '';
                },
                setter:function(val){
                    if (!val){
                        return function(fieldValidator,fieldIndicator,meta) {
                            fieldIndicator.get('element').style.display = '';
                        };
                    }
                    if (!YL.isFunction(val)){
                        YAHOO.log('FieldIndicator formatter must be a function','warn','FieldValidator');
                    }
                    return val;
                }
            }
        }
    });

    Y.extend(FieldIndicator,YW.FormElement,{
        /**
         * This is the function used to populate an error message inside of the
         * indicator's DOM.  This function is optional and is used where a range
         * is to be displayed to the user.  The htmlFunc should look something like this
         * function(inputValidation){return 'Some html that may include a value from the validator'}.
         * Where the inputValidation is of type YAHOO.widget.Validator
         * @property _htmlFunc
         * @type function
         */        
        /**
         * This will populate the innerHTML of the indicator using the _htmlFunc if one is set.
         * This will pass a YAHOO.widget.Validator that caused the show event on this indicator.
         
        checkHtml:function(validator,meta){
            var formatter = this.get('formatter');
            formatter(validator,this,meta);
        },*/
        /**
         * This will show the indicator
         */
        show:function(args,formValidator){
            var formatter = this.get('formatter'), errorMeta = args[0],validator = args[1];
            // indicators will never show if the field is optional and empty
            if (validator.get('optional') && validator.isEmpty()){
                this.hide();
            }
            else{
                formatter.call(formValidator,validator,this,errorMeta);
            }
        },
        /**
         * This will hide the indicator.
         */
        hide:function(args,formValidator){
            this.setStyle('display','none');
        }
    });
    YW.FieldIndicator = FieldIndicator;
})();