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
            notInRange:{
                show:['numberOutOfRange'],
                hide:['inputEmpty','numberInRange','incorrectFormat']
            },
            valid:{
                hide:['inputInvalid'],
                show:['inputValid']
            },
            invalid:{
                show:['inputInvalid'],
                hide:['inputValid']
            },
            all:{
                show:['inputValueChange']
            }
        }
    });

    /**
     * Augment form with standard indicator definitions.
     */
    YL.augmentObject(YW.FormValidator,{
        Indicators:{
            correct:{className:'indicator'},
            incorrect:{className:'validator'}
        }
    });

    /**
     * The indicator represents a dom element that will appear to signify one of many different
     * status' of an input field.  For instance, it could show up when the field is valid, or when
     * the field is invalid, or when the number value in the field is out of the specified range.
     */
    function FieldIndicator(el,config){
//        if ((config !== null) && (config !== undefined) && YL.isFunction(config.formatter)){
//            this.formatter = config.formatter;
//            alert(this.formatter);
//        }
        FieldIndicator.superclass.constructor.apply(this,arguments);
    }
    YL.augmentObject(FieldIndicator,{
        ATTRS:{
            formatter:{
                value:function(fieldValidator,fieldIndicator,meta) {
                    fieldIndicator.get('element').style.display = '';
                },
                setter:function(val){
                    if (val === null || val === undefined){
                        return function(fieldValidator,fieldIndicator,meta) {
                            fieldIndicator.get('element').style.display = '';
                        };
                    }
                    if (!YL.isFunction(val)){
                        throw 'FieldIndicator formatter must be a function';
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
        show:function(errorMeta,validator){
            var formatter = this.get('formatter');
            formatter(validator,this,errorMeta);
        },
        /**
         * This will hide the indicator.
         */
        hide:function(eventName,validator){
            //console.debug('hide ' + this.get('element').id);
            this.setStyle('display','none');
        }
    });
    YW.FieldIndicator = FieldIndicator;
})();