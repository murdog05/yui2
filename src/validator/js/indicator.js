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
    YL.augmentObject(YW.Form,{
        formEvents:{
            notInRange:{
                show:['numberOutOfRange'],
                hide:['inputEmpty','numberInRange','incorrectFormat']
            },
            correctIndicator:{
                hide:['inputInvalid'],
                show:['inputValid']
            },
            incorrectIndicator:{
                show:['inputInvalid'],
                hide:['inputValid']
            }
        }
    });

    /**
     * Augment form with standard indicator definitions.
     */
    YL.augmentObject(YW.Form,{
        indicators:{
            correct:{
                atts:{
                    className:'indicator'
                },
                events:YW.Form.formEvents.correctIndicator
            },
            incorrect:{
                atts:{
                    className:'validator'
                },
                events:YW.Form.formEvents.incorrectIndicator
            },
            rangeCheck:{
                atts:{
                    className:'validatorText',
                    html:function(validator){
                        var maxInclusive = validator.get('maxInclusive'),minInclusive = validator.get('minInclusive'),left,right;
                        if (minInclusive){
                            left = '[';
                        }
                        else{
                            left = '(';
                        }
                        if (maxInclusive){
                            right = ']';
                        }
                        else{
                            right = ')';
                        }
                        return left + validator.get('min') + ',' + validator.get('max') + right;
                    }
                },
                events:YW.Form.formEvents.notInRange
            }
        }
    });

    /**
     * The indicator represents a dom element that will appear to signify one of many different
     * status' of an input field.  For instance, it could show up when the field is valid, or when
     * the field is invalid, or when the number value in the field is out of the specified range.
     */
    function Indicator(el,config){
        if ((config !== null) && (config !== undefined) && YL.isFunction(config.html)){
            this._htmlFunc = config.html;
        }
        Indicator.superclass.constructor.apply(this,arguments);
    }
    YL.augmentObject(Indicator,{
        ATTRS:{
            events:{
                value:null
            }
        }
    });

    Y.extend(Indicator,YW.FormElement,{
        /**
         * This is the function used to populate an error message inside of the
         * indicator's DOM.  This function is optional and is used where a range
         * is to be displayed to the user.  The htmlFunc should look something like this
         * function(inputValidation){return 'Some html that may include a value from the validator'}.
         * Where the inputValidation is of type YAHOO.widget.Validator
         * @property _htmlFunc
         * @type function
         */
        _htmlFunc:null,
        /**
         * This will populate the innerHTML of the indicator using the _htmlFunc if one is set.
         * This will pass a YAHOO.widget.Validator that caused the show event on this indicator.
         */
        checkHtml:function(validator){
            var element = this.get('element');
            if (this._htmlFunc !== null){
                element.innerHTML = this._htmlFunc(validator);
            }
        },
        /**
         * This will show the indicator
         */
        show:function(eventName,validator){
            //console.debug('show ' + this.get('element').id);
            this.setStyle('display','');
            this.checkHtml(validator);
        },
        /**
         * This will hide the indicator.
         */
        hide:function(eventName,validator){
            //console.debug('hide ' + this.get('element').id);
            this.setStyle('display','none');
        }
    });
    YW.Indicator = Indicator;
})();