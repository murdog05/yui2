if (YAHOO.widget === null || YAHOO.widget === undefined){
    YAHOO.widget = {};
}
(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YE = YU.Event,
    YW = Y.widget,
    YD = YU.Dom;
    /**
     * This is the main class of the form validator and is responsible for configuring
     * validators and indicators based on the settings given.
     */
    function Form(el,config){
        Form.superclass.constructor.apply(this,arguments);
        this._initializeSubmitButtons();
        this._initializeInputs(config);
        this._initializeEvents();
        this.updateForm();
    }    

    YL.augmentObject(Form,{
        ATTRS:{
            defaultSettings:{
                value:null
            }
        },
        /**
         * The maximum value for an integer.  Used as a default min/max value on number fields
         * @property MAX_INTEGER
         * @type number
         * @static
         */
        MAX_INTEGER:2147483647,
        /**
         * Regular expression used by the Integer field for ensuring the input matches the format of an integer
         * @property INTEGERREGEX
         * @type regex
         * @static
         */
        INTEGERREGEX:/(^-?\d\d*\.\d*$)|(^-?\d\d*$)|(^-?\.\d\d*$)/,
        /**
         * Regular expression used by the DoubleField for ensuring the input matches the format of an double
         * @property DOUBLEREGEX
         * @type regex
         * @static
         */
        DOUBLEREGEX:/(^-?\d\d*\.\d+$)|(^-?\d\d*$)|(^-?\.\d\d*$)/,
        /**
         * Regular expression for an e-mail.
         * @property EMAILREGEX
         * @type regex
         * @static
         */
        EMAILREGEX:/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,        
        /**
         * Static function that will set a boolean value for a property
         * @method BOOLEANSETTER
         * @static
         * @param {boolean|string} val value of yes/no/true/false
         * @return {boolean} a boolean
         */
        _setBoolean:function(val){
            if (YL.isBoolean(val)){
                return val;
            }
            else if (YL.isString(val)){
                return val.toLowerCase() == 'true';
            }
            else{
                return val !== null && val !== undefined;
            }
        }
    });
    Y.extend(Form,YW.FormElement,{
        /**
         * This will hold all inputs that have validation applied to them
         * within the form.
         * @property _validation
         * @type YAHOO.widget.Validator[]
         * @protected
         */
        _validation:null,
        /**
         * Given the indicatorEl and the inputEl, this will ensure that the indicator El
         * exists in the dom, and if not, has it created using the creation attributes
         * located in the default settings of the form validator, as well as the given createAtts
         * parameter.
         * @method setupDomItem.
         * @param {HTMLElement|String} indicatorEl Element, or id of element that is to act as an indicator
         * @param {HTMLElement} inputEl Input element, this is used if the indicatorEl needs to be created.  The indicator el is placed beside this el.
         * @param {Object} createAtts Attributes used to create the indicatorEl if it needs to be created.
         */
        _setupDomItem:function(indicatorEl,inputEl,createAtts){
            var theDom = indicatorEl,defaultSettings = this.get('defaultSettings'),html,className,indicatorType = 'span';
            if (defaultSettings !== null && defaultSettings !== undefined && defaultSettings.indicator !== null && defaultSettings.indicator !== undefined){
                html = defaultSettings.indicator.html;
                if (html === null || html === undefined){
                    html = '&nbsp;';
                }
                className = defaultSettings.indicator.className;                
                if (defaultSettings.indicator.tagType !== null && defaultSettings.indicator.tagType !== undefined){
                    indicatorType = defaultSettings.indicator.tagType;
                }
            }
            // TODO: Check atts for settings used to create indicator.
            if (createAtts !== null && createAtts !== undefined){
                if (createAtts.html !== null && createAtts.html !== undefined){
                    html = createAtts.html;
                }
                if (createAtts.className !== null && createAtts.className !== undefined){
                    className = createAtts.className;
                }
                if (createAtts.indicatorType !== null && createAtts.indicatorType !== undefined){
                    indicatorType = createAtts.indicatorType;
                }
            }
            if (YL.isString(theDom)){
                theDom = YD.get(theDom);
                if (theDom !== null && theDom !== undefined){

                    // if there are creation atts attached, use those, but do not use
                    // the defaults
                    if (createAtts !== null && createAtts !== undefined){
                        if (createAtts.html !== undefined && createAtts.html !== null){
                            theDom.innerHTML = createAtts.html;
                        }
                        if (createAtts.className !== undefined && createAtts.className !== null){
                            theDom.className = createAtts.className;
                        }
                    }
                    return theDom;
                }
            }
            // create the dom element, and then insert it beside the input dom.
            if ((theDom === null || theDom === undefined)){
                theDom = document.createElement(indicatorType);
                if (indicatorEl !== null && indicatorEl !== undefined){
                    theDom.id = indicatorEl;
                }
                YD.insertAfter(theDom,inputEl);                
            }
            if (!YL.isFunction(html)){
                theDom.innerHTML = html;
            }
            if ((theDom.className === '' || theDom.className === null || theDom.className === undefined) && (className !== null && className !== undefined)){
                theDom.className = className;
            }
            return theDom;
        },
        /**
         * This will initialize all the inputs given in the configuration.
         * For each input in the configuration, this will initialize the validation on
         * the input field, then register the indicators with the events specified in
         * the configuration.  Indicators elements will be created as neccessary
         */
        _initializeInputs:function(config){
            var inputs = config.inputs,curInput,j,inds,key,el,inputCfg;
            this._validation = [];
            this._indicators = [];
            for (key in inputs){
                el = YD.get(key);
                inputCfg = inputs[key];
                // TODO: put in group support
                if (YL.isFunction(inputCfg.validation)){
                    curInput = new YAHOO.widget.Validator(el,{type:inputCfg.validation});
                }
                else if (YL.isObject(inputCfg.validation)){
                    curInput = new YAHOO.widget.Validator(el,inputCfg.validation);
                }
                else {
                    curInput = new YAHOO.widget.Validator(el,{type:inputCfg.validation});
                }
                curInput.subscribe('inputValueChange',this._onFormChange,this,true);
                inds = inputCfg.indicators;
                if (inds !== null && inds !== undefined){
                    if (YL.isArray(inds)){
                        for (j = 0;j < inds.length; ++j){
                            this._initializeIndicator(curInput,inds[j]);
                        }
                    }
                    else{
                        // allow singular, or array entries                        
                        this._initializeIndicator(curInput,inds);
                    }
                }
                this._validation.push(curInput);
            }
        },
        /**
         * This will intialize the an indicator based ont he given json.  The input
         * is the validation object attach to the form's input field.
         */
        _initializeIndicator:function(inputValidation,indJson){
            var indicator,curIndJson = indJson,indicatorEl,events;
            if (indJson instanceof YW.Indicator){
                indicator = curIndJson;
                events = indicator.get('events');
            }
            else{
                // Possibly could detect leading # sign and take it as an id... not sure
                // how events would work though
                if (YL.isString(indJson)){
                    curIndJson = Form.indicators[curIndJson];
                }
                events = curIndJson.events;
                
                // create the el from the JSON markup, don't touch the JSON markup
                // because it may be re-used later.
                indicatorEl = this._setupDomItem(curIndJson.el,inputValidation.get('element'),curIndJson.atts);
                indicator = new YW.Indicator(indicatorEl,curIndJson.atts);
            }
            this._registerIndicators(inputValidation,indicator,events);
            this._indicators.push(indicator);
        },
        /**
         * This will register and indicator with events of the validator based
         * on what was given in the configuration
         */
        _registerIndicators:function(validator,indicator,eventCfg){
            var i,methodName,method,events;
            if (eventCfg === null || eventCfg === undefined){
                return;
            }
            for (methodName in eventCfg){
                method = indicator[methodName];
                if (!YL.isFunction(method)){
                    throw 'You can only use functions to subscribe to validator events';
                }
                events = eventCfg[methodName];
                for (i = 0 ; i < events.length; ++i){
                    validator.subscribe(events[i],method,validator,indicator);
                }
            }
        },
        /**
         * This will subscribe the form object to the submit and reset events on the form element.
         * This will enable the form to prevent form submission if the form is not filled in completely.
         * It will also allow for the form validation to update when the form is reset.
         */
        _initializeEvents:function(){
            var el = this.get('element');
            YU.Event.on(el,'submit',this._onFormSubmit,this,true);
            YU.Event.on(el,'reset',this._onFormReset,this,true);
        },
        /**
         * This will take all submit buttons, wrap them in a button object
         * and subscribe their enable and disable functions to the formValid and formInvalid
         * events respectively.
         */
        _initializeSubmitButtons:function(){
            var submitButtons = this._getSubmitButtons(this.get('element')),buttons = [],i,curButton;
            // TODO: Check for buttons defined in the buttonJSON attribute, and ignore buttons
            // already configured in there.
            for (i = 0 ; i < submitButtons.length; ++i){
                curButton = new YAHOO.widget.FormButton(submitButtons[i]);
                buttons.push(curButton);
                this.subscribe('formValid',curButton.enable,curButton,true);
                this.subscribe('formInvalid',curButton.disable,curButton,true);
            }
            this.set('buttons',buttons);
        },
        /**
         * This will retreive all submit buttons that are inside of the Form element and return them.
         */
        _getSubmitButtons:function(parent){
            var rtVl = [],children,i;
            if ((parent.tagName !== null && parent.tagName !== undefined) && (parent.tagName.toLowerCase() == 'input') && (parent.type == 'submit')){
                return [parent];
            }
            children = YD.getChildren(parent)
            for (i = 0 ; i < children.length; ++i){
                rtVl = rtVl.concat(this._getSubmitButtons(children[i]));
            }
            return rtVl;
        },
        /**
         * This will cause all the indicators and validators to update to the proper display value
         */
        updateForm:function(){
            var vals = this._validation,i,isValid = true;
            for (i = 0 ; i < vals.length; ++i){
                if (!vals[i].checkStatus()){
                    isValid = false;
                }
            }
            if (isValid){
                this.fireEvent('formValid');
            }
            else{
                this.fireEvent('formInvalid');
            }
        },
        /**
         * This will return true if the WHOLE form is valid.
         */
        isValid:function(){
            var i,validation = this._validation;
            for (i = 0 ; i < validation.length; ++i){
                if (!validation[i].isValid()) return false;
            }
            return true;
        },
        /**
         * This will be called whenever the form is changed.
         */
        _onFormChange:function(){
            if (this.isValid()){
                this.fireEvent('formValid');
            }
            else{
                this.fireEvent('formInvalid');
            }
            this.fireEvent('onFormChange');
        },
        _onFormSubmit:function(ev){
            if (!this.isValid()){
                YE.preventDefault(ev);
                return;
            }
            // later add the before submit function checks as well
            // as the before submit event
            this.fireEvent('onFormSubmit');
        },
        /**
         * This will get called when the form is reset, this will cause the form to recheck all it's values
         * and show the proper indicators.
         * @method _onFormReset
         * @param {Event} ev Event that caused the reset.
         */
        _onFormReset:function(ev){
            var that = this;
            setTimeout(function(){
                that.updateForm();
            },100);
            this.updateForm();
        }
    });
    YAHOO.widget.Form = Form;
})();