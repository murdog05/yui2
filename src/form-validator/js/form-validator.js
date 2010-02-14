(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YE = YU.Event,
    YW = Y.widget,
    YD = YU.Dom;
    /**
     * @namespace YAHOO.widget
     * This is the main class of the form validator and is responsible for configuring
     * validators and indicators based on the settings given.
     * @class FormValidator
     * @constructor
     * @param {HTMLElement} el The form dom object
     * @param {Object} config Form validation configuration
     */
    function FormValidator(el,config){
        FormValidator.superclass.constructor.apply(this,arguments);
        this._init(config)
    }

    YL.augmentObject(FormValidator,{
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
        EMAILREGEX:/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
    });
    Y.extend(FormValidator,YU.Element,{
        /**
         * This will initialize the form validator
         * @method _init
         * @param {Object} config Called by the constructor to initialize the inputs, buttons and events.
         */
        _init:function(config){
            this._initializeSubmitButtons();
            this._initializeInputs(config);
            this._initializeEvents();
            this.updateForm();
        },
        /**
         * This will hold all inputs that have validation applied to them
         * within the form.
         * @property _validation
         * @type YAHOO.widget.Validator[]
         * @protected
         */
        _validation:null,
        /**
         * This will initialize all the inputs given in the configuration.
         * For each input in the configuration, this will initialize the validation on
         * the input field, then register the indicators with the events specified in
         * the configuration.  Indicators elements will be created as neccessary
         *
         * @method _initializeInputs
         * @param {Object} config Configuration object
         */
        _initializeInputs:function(config){
            var inputs = config.inputs,curInput,j,curIndsJson,inds,key,indicatorKey,el,inputCfg,ind;
            this._validation = [];
            this._indicators = [];
            for (key in inputs){
                el = YD.get(key);
                inputCfg = inputs[key];
                curInput = new FormValidator.FieldValidator(el,inputCfg.validation);
                // TODO: put in group support
                inds = inputCfg.indicators;
                // singular, will subscribe to just the input change event
                if (inds instanceof FormValidator.FieldIndicator){
                    // if just an indicator is given, it is automatically subscribed to all
                    this._initializeIndicator('all',curInput,inds);
                }
                else{
                    for (indicatorKey in inds){
                        curIndsJson = inds[indicatorKey];
                        if (YL.isArray(curIndsJson)){
                            for (j = 0 ; j < curIndsJson.length; ++j){
                                this._initializeIndicator(indicatorKey,curInput,curIndsJson[j]);
                            }
                        }
                        else{
                            this._initializeIndicator(indicatorKey,curInput,curIndsJson);
                        }
                    }
                }

                ind = inputCfg.indicator;
                if (ind){
                    if (ind instanceof FormValidator.FieldIndicator){
                        // if just an indicator is given, it is automatically subscribed to all
                        this._initializeIndicator('all',curInput,ind);
                    }
                    else{
                        if (YL.isArray(ind)){
                            for (j = 0 ; j < ind.length; ++j){
                                this._initializeIndicator('invalid',curInput,ind[j]);
                            }
                        }
                        else{
                            this._initializeIndicator('invalid',curInput,ind);
                        }
                    }
                }

                
                this._validation.push(curInput);
            }
        },
        /**
         * This will initialize the indicator using the given indicator configuration
         * would could be an indicator object itself, or the configuration for an indicator
         * @method _initializeIndicator
         * @param {String|Object} eventKey Key for a default event configuration, or the event configuration itself.
         * @param {YAHOO.widget.FieldValidator} fieldValidator validation input the field indicator will be associated with.
         * @param {Object|YAHOO.widget.FieldIndicator} indicatorConfig The configuration for the indicator, or the indicator object itself.
         */
        _initializeIndicator:function(eventKey,fieldValidator,indicatorConfig){
            var indicator;
            if (indicatorConfig instanceof FormValidator.FieldIndicator){
                indicator = indicatorConfig;
            }
            else{
                indicator = new FormValidator.FieldIndicator(indicatorConfig,fieldValidator.get('element'));
            }
            indicator.registerEvents(fieldValidator,eventKey);
            this._indicators.push(indicator);
        },
        /**
         * This will subscribe the form object to the submit and reset events on the form element.
         * This will enable the form to prevent form submission if the form is not filled in completely.
         * It will also allow for the form validation to update when the form is reset.  Finally, it
         * registers a keyup, blur, click or change listener on the form for event delegation.
         * @method _initializeEvents
         */
        _initializeEvents:function(){
            var el = this.get('element');
            YU.Event.on(el,'submit',this._onFormSubmit,this,true);
            YU.Event.on(el,'reset',this._onFormReset,this,true);
            
            // When input values are changed
            YU.Event.delegate(el,'keyup',this._onFormInteraction,function(element){return element;},this,true);
            YU.Event.delegate(el,'blur',this._onFormInteraction,function(element){return element;},this,true);
            YU.Event.delegate(el,'click',this._onFormInteraction,function(element){return element;},this,true);
            YU.Event.delegate(el,'change',this._onFormInteraction,function(element){return element;},this,true);
        },
        /**
         * This will take all submit buttons, wrap them in a button object
         * and subscribe their enable and disable functions to the formValid and formInvalid
         * events respectively.
         * @method _initializeSubmitButtons
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
         * @method _getSubmitButtons
         * @param {HTMLElement} parent The node who's children will be checked for submit buttons.
         * @return {HTMLElement[]} list of submit buttons.
         */
        _getSubmitButtons:function(parent){
            var rtVl = [],children,i;
            if (parent.tagName && (parent.tagName.toLowerCase() == 'input') && (parent.type == 'submit')){
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
         * @method updateForm
         */
        updateForm:function(){
            var vals = this._validation,i,isValid = true;
            for (i = 0 ; i < vals.length; ++i){
                if (!vals[i].validate()){
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
         * @method isValid
         * @return {boolean} true if every input in the form is valid.
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
         * @method _onFormChange
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
        /**
         * This function is called when the form is submitted.  If the form is
         * not valid, the submit event on the form is cancelled.
         */
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
         * This will be the event delgator.  Whenever a user interacts with the form
         * in anyway, this will obtain the target, and delegate the event if the
         * target is a form input.
         * @method _onFormInteraction
         * @param {Object} event Event that caused any of the form change events to fire.
         * @param {HTMLElement} matchedEl Element that was the target of the form interaction
         * @param {HTMLElement} container Element container the delegate is listening on that contains the matched El
         */
        _onFormInteraction:function(event,matchedEl,container){
            var validator = this.getValidatorByInput(matchedEl);
            if (validator){
                validator.validate();
                this._onFormChange();
            }
        },
        /**
         * Given an input DOM, this will return the field's validation object
         * @method getValidatorByInput
         * @param {HTMLElement} dom Dom object.
         * @return {YAHOO.widget.FieldValidator
         */
        getValidatorByInput:function(dom){
            var vs = this._validation,i;
            for (i = 0; i < vs.length; ++i){
                if (vs[i].get('element') == dom) return vs[i];
            }
            return null;
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
    YAHOO.widget.FormValidator = FormValidator;
})();