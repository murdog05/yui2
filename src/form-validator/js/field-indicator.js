(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YE = YU.Event,
    YW = Y.widget,
    YD = YU.Dom;

    /**
     * The Plan:
     *
     * 1. Indicator gets in the input dom that it will be placed next to.
     * 2. Also gets the configuration.
     * 3. Default settings will be used.  These will be obtained from a default configuration object.
     * 4. Uses these to setup the dom object and that gets set in the super class (element).
     * 5. Will check initially if the configuration is a string, in which case it will be
     * a default configuration, and it will be loaded from the Indicators static object.
     */

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
                return {
                    style:'correct'
                };
            },
            incorrect:function(){
                return {
                    style:'incorrect'
                };
            }
        }
    });

    /**
     * The indicator represents a dom element that will appear to signify one of many different
     * status' of an input field.  For instance, it could show up when the field is valid, or when
     * the field is invalid, or when the number value in the field is out of the specified range.
     */
    function FieldIndicator(neighbor,config){
        var args = this._init(neighbor,config);
        FieldIndicator.superclass.constructor.apply(this,args);
    }
    YL.augmentObject(FieldIndicator,{
        /**
         * This holds the default style for all newly created indicators.
         */
        DefaultStyle:{
            correct:{
                tagType:'DIV',
                className:'indicator',
                html:'&nbsp;'
            },
            incorrect:{
                tagType:'DIV',
                className:'validator',
                html:'&nbsp;'
            },
            emptystyle:{
                tagType:'DIV',
                className:'',
                html:''
            }
        },
        ATTRS:{
            style:{
                value:null
            },
            neighbor:{
                value:null,
                setter:YW.FormElement.standardElSetter
            },
            //            relationToNeighbor:{
            //                value:'after',
            //                setter:function(val){
            //                    var temp = val;
            //                    if (!temp) return after;
            //                    temp = temp.toLowerCase();
            //                    if (temp !== 'before' && temp !== 'after' && temp !== 'child') return 'after'; // default
            //                    else return temp;
            //                }
            //            },
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
         * This will get the configuration object and dom object represented by
         * this indicator.  If the el does not exist, it will be created using
         * the specified default style.  If no style specified, no style is applied.
         * The configuration will then be used to setup the indicator using the newly create el.
         */
        _init:function(theNeighbor,config){
            var el = config.el,theConfig = config,neighbor = theNeighbor,doInsert = true;
            if (YL.isString(neighbor)){
                neighbor = YD.get(neighbor);
            }
            if (YL.isString(theConfig)){
                theConfig = YW.FormValidator.Indicators[theConfig].call();
            }
            // if the el is a string
            if (YL.isString(el)){
                el = YD.get(el);
            }
            if (el) doInsert = false;
            el = this._setupEl(theConfig.el,theConfig.style);
            theConfig.style = null; // clear the attribute, it is not needed anymore

            if (doInsert){
                YD.insertAfter(el,neighbor);
            }

            return [el,theConfig];
        },
        /**
         * Given a HTML object, id, or null, this will create a DOM object that
         * will represent the indicator on the form.  If a new one is created, it will
         * be created using the given style.  If no style defined, then no style applied.
         *
         * NOTE: May want to define the style in the EL, but how to tell the difference
         * between an Id and a default style?
         */
        _setupEl:function(el,style){
            var rtVl = el,theStyle = style;
            if (!style){
                theStyle = FieldIndicator.DefaultStyle.emptystyle;
            }
            else if (YL.isString(theStyle)){
                theStyle = FieldIndicator.DefaultStyle[theStyle.toLowerCase()];
            }
            // if the el is a string
//            if (YL.isString(el)){
//                rtVl = YD.get(rtVl);
//            }
            // if we still don't have a value for rtVl, then a dom object must be created
            if (!rtVl){
                rtVl = document.createElement(theStyle.tagType);
                if (theStyle.html){
                    rtVl.innerHTML = theStyle.html;
                }
                if (theStyle.className){
                    rtVl.className = theStyle.className;
                }
            }
            else{
                //console.debug(rtVl);
                //console.debug(rtVl.className);
                //                if (rtVl.innerHTML == ''){
                //                    rtVl.innerHTML = theStyle.html;
                //                }
                if (rtVl.className == '' && style.className){
                    rtVl.className = theStyle.className;
                }
            }

            //            if (style != FieldIndicator.DefaultStyle.emptystyle){
            //                rtVl.innerHTML = theStyle.html;
            //                rtVl.className = theStyle.className;
            //            }
            return rtVl;
        },
        /**
         * This will insert the indicator's dom object in the correct place
         * relative to the neighbor based on the configuration.
         */
        //        _insertIntoDom:function(neighbor,el){
        //            var relationTo = this.get('relationToNeighbor');
        //            if (relationTo === 'child'){
        //                neighbor.appendChild(this.get('element'));
        //            }
        //            else if (relationTo === 'before'){
        //                YD.insertBefore(this.get('element'),neighbor);
        //            }
        //            else{
        //                YD.insertAfter(this.get('element'),neighbor);
        //            }
        //        },
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