(function()
{
    /**
     * @class GLOBAL
     */
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YD = YU.Dom,
    validator = YAHOO.widget,
    YE = YU.Event, S4 = function() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    },
    /**
     * This will make a random guid id.  This is useful for ensuring ajax requests
     * don't get cached.
     * @method guid
     * @return {string} Random guid
     */
    guid = function() {
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    },
    /**
     * THis will get all submit buttons in the form that are to be a part of the form validator.
     * This will exclude forms inside of other forms that are going to use the form validator.
     * @method GETSUBMITBUTTONS
     * @param {HTMLElement} parent Dom object who is being searched for submit buttons
     * @return list of submit buttons with the given parent dom object.
     */
    GETSUBMITBUTTONS = function(parent){
        var rtVl = [],children,i;
        if ((parent.tagName !== null && parent.tagName !== undefined) && (parent.tagName.toLowerCase() == 'input') && (parent.type == 'submit')){
            return [parent];
        }
        children = parent.children;
        if (children === null || children === undefined){
            children = parent.childNodes;
        }
        for (i = 0 ; i < children.length; ++i){
            rtVl = rtVl.concat(GETSUBMITBUTTONS(children[i]));
        }
        return rtVl;
    },
    /**
     * Returns true if the given dom is marked as a form (inline).
     * @method ISFORM
     * @param {HTMLElement} dom dom object
     * @return {boolean} true if the given dom object is a form, or is marked as a form inline.
     */
    ISFORM = function(dom){
        var formIndicator;
        if (dom.getAttribute === null || dom.getAttribute === undefined){
            return false;
        }
        formIndicator = dom.getAttribute('formvalidator:Form');
        if (formIndicator === null || formIndicator === undefined){
            return false;
        }
        formIndicator = formIndicator.toLowerCase();
        return (formIndicator == 'yes') || (formIndicator == 'true');
    },
    /**
     * This will collect all inputs with inline declarations.
     * @method GETINLINEDECLARATIONS
     * @param {HTMLElement} parent Dom object who's children are being searched
     * @return {HTMLElement[]} a list of all dom object declared as form fields, inside the given parent
     */
    GETINLINEDECLARATIONS = function(parent){
        var rtVl = [],isGroup = false,children = null,i=0,inlineIndicator,groupIndicator;
        if (parent.getAttribute !== null && parent.getAttribute !== undefined){
            inlineIndicator = parent.getAttribute('formvalidator:FormField');
            groupIndicator = parent.getAttribute('formvalidator:FormGroup');
            // add parent to the return value if the parent is a form field

            if ((inlineIndicator !== null && inlineIndicator !== undefined) && ((inlineIndicator.toLowerCase() == 'true') || (inlineIndicator.toLowerCase() == 'yes'))){
                rtVl[0] = parent;
            }
            if ((groupIndicator !== null && groupIndicator !== undefined) && ((groupIndicator.toLowerCase() == 'true') || (groupIndicator.toLowerCase() == 'yes'))){
                isGroup = true;
            }
        }

        children = parent.children;
        if (children === null || children === undefined){
            children = parent.childNodes;
        }
        for (i = 0 ; i < children.length; ++i){
            // if the element in an inner form, we skip it, as we do not want to add
            // that form's inputs to the this form
            if (!ISFORM(children[i])){
                rtVl = rtVl.concat(GETINLINEDECLARATIONS(children[i]));
            }
        }
        // groups need to have their members placed inside json structure so those
        // inputs can be put into the group, instead of on the main level.
        if (isGroup){
            return [
            {
                isGroup:true,
                groupDOM:parent,
                members:rtVl
            }
            ];
        }
        else{
            return rtVl;
        }
    };
    /**
     * This is the main form validator class. This widget will allow developers to easily
     * transform a standard form into a fully interactive form that handle almost all
     * invalid inputs gracefully and improve user experience.
     * @module validator
     * @title Form Validator Widget
     * @requires yahoo.base, yahoo.dom, yahoo.event
     * @namespace validator
     * @class Form
     * @constructor
     * @param {Object} config Configuration object containing everything for configuring the form validator object.
     */
    function _Validator(config){
        _Validator.superclass.constructor.apply(this,arguments);
        this._initializeEvents();
        this.initializeInputs();
        this.initializeButtons();
        this.checkFormValues();
        //this.on('inputfield:onchanged',this.onFormValueChanged);
        if (this.get('checkOnSubmit')){
            this.enableButtons();
        }
        this.set('onSubmitEvent',new YU.CustomEvent('form:onsubmit'));
        //this.get('onSubmitEvent').subscribe(this.onFormValueChanged,this,true);
        //this.publish(_Validator.CE_ONSUBMIT);
    }
    _Validator.staticFunctions = {
        /**
         * Static function that will set a boolean value for a property
         * @method BOOLEANSETTER
         * @static
         * @param {boolean|string} val value of yes/no/true/false
         * @return {booelan} a boolean
         */
        BOOLEANSETTER:function(val){
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
    };
    //YL.augment(_Validator, YU.EventTarget);
    // attributes
    _Validator.ATTRS = {
        /**
         * This is used for custom inputs so their validator object can be stored in the form
         * until the instance of is pulled out of an inline attribute
         * @property customGlobal
         * @type Object
         */
        customGlobal:{
            value:{}
        },
        /**
         * This is the form DOM object (or any DOM object) that surrounds
         * the inputs of the form. (NOTE: Not all inputs HAVE to be inside the form dom if your using the JSON method
         * to declar your fields).
         * @config form
         * @type HTMLElement
         */
        form:{
            setter:function(el){
                var rtVl = el;
                if (YL.isString(el)){
                    rtVl = YD.get(el);
                }
                if (rtVl === null || rtVl === undefined){
                    throw 'Invalid form: Form with id ' + el + ' does not exist';
                }
                return rtVl;
            },
            value:null
        },
        /**
         * Default value is false, when set to true, indicators on inputs, and the form's status will only
         * update when the submit button is clicked.
         * @config checkOnSubmit
         * @type boolean
         */
        checkOnSubmit:{
            value:false,
            setter:_Validator.staticFunctions.BOOLEANSETTER

        },
        /**
         * This is a function that is called after the form is checked, and is valid, but before
         * the actual submit takes place.  If this function returns true, the form will submit,
         * if it returns false, the form submission will not proceed.
         * @config onSubmit
         * @type Function
         */
        onSubmit:{
            value:null
        },
        /**
         * This is the scope in which the onSubmit function will be executed.  If this
         * is null, the function will be executed in the global scope.
         * @config onSubmitScope
         * @type Object
         */
        onSubmitScope:{
            value:null
        },
        /**
         * This is a setting passed onto each field added to the validator.  If
         * this is true, the input field will create an incorrect indicator based
         * setting in the configuration object passed to the field, or on the default settings passed to it
         * from this class.
         * @config createIncorrectIndicator
         * @type boolean
         */
        createIncorrectIndicator:{
            value:false
        },
        /**
         * This is a setting passed onto each field added to the validator.  If
         * this is true, the input field will create an correct indicator based
         * setting in the configuration object passed to the field, or on the default settings passed to it
         * from this class.
         * @config createCorrectIndicator
         * @type boolean
         */
        createCorrectIndicator:{
            value:false
        },
        /**
         * This is the name of the type of dom object used to create the indicators.
         * The default is SPAN
         * @config defaultIndicatorDomType
         * @type string
         */
        defaultIndicatorDomType:{
            value:'SPAN'
        },
        /**
         * The default css used when creating the incorrect indicator dynamically.  This
         * css value is '' by default, and will be passed to any input field added
         * to the validator if they do not already have this property set in their configuration.
         * @config defaultIncorrectIndicatorCss
         * @type string
         */
        defaultIncorrectIndicatorCss:{
            value:''
        },
        /**
         * The default css used when creating the correct indicator dynamically.  This
         * css value is '' by default, and will be passed to any input field added
         * to the validator if they do not already have this property set in their configuration.
         * @config defaultCorrectIndicatorCss
         * @type string
         */
        defaultCorrectIndicatorCss:{
            value:''
        },
        /**
         * The default text that will be used to set the innerHTML of the correct indicator
         * when it is created dynamically. A non breakable space by default, and will be passed to any input field added
         * to the validator if they do not already have this property set in their configuration.
         * @config correctIndicatorText
         * @type string
         */
        correctIndicatorText:{
            value:'&nbsp;'
        },
        /**
         * The default text that will be used to set the innerHTML of the incorrect indicator
         * when it is created dynamically. A non breakable space by default, and will be passed to any input field added
         * to the validator if they do not already have this property set in their configuration.
         * @config incorrectIndicatorText
         * @type string
         */
        incorrectIndicatorText:{
            value:'&nbsp;'
        },
        /**
         * This will hold the JSON configuration for all inputs passed to the form validator.
         * This will be intereated through, and the actual input field objects created
         * when the form is initialized.
         * @config fieldJSON
         * @type Object[]
         */
        fieldJSON:{
            value:[]
        },
        /**
         * This will hold the JSON configuration for all buttons passed to the form validator.
         * This will be intereated through, and the actual button objects created
         * when the form is initialized.
         * @config buttonJSON
         * @type Object[]
         */
        buttonJSON:{
            value:[]
        },
        /**
         * This is a list of input field objects that represent inputs that are to be validated using the validator.
         * @property inputFields
         * @type BaseInputField[]
         */
        inputFields:{
            value:[]
        },
        /**
         * List of buttons that will only enable if all the inputs on the form
         * validator are correct.
         * @property buttons
         * @type Button[]
         */
        buttons:{
            value:[]
        },
        /**
         * List of ids of submit buttons that are exempt from the form validator.  For instance, you may
         * have a submit button that deletes the data pertaining to the record open in the form.
         * Obviously the form should not have to be filled in correctly to do this.
         * @config excludedButtons
         * @type string[]
         */
        excludedButtons:{
            value:[]
        },
        /**
         * This is the event that is invoked the form is submitted.
         * @event onsubmit
         */
        onSubmitEvent:{
            value:null
        }
    };
    _Validator.NAME = 'Validator';
    
    //_Validator.CE_ONSUBMIT = 'form:onsubmit';
    YL.extend(_Validator,validator.ValidatorBase,{
        /**
         * This function will process the input field configurations in the fieldJSON
         * property, and have all fields instantiated and initialized and stored
         * in the inputFields property.
         * @method initializeInputs
         */
        initializeInputs:function(){
            var fields = this.get('fieldJSON'),i,newField,syncDom;
            for (i = 0 ; i < fields.length; ++i){
                newField = new fields[i].type(fields[i].atts,false);
                syncDom = newField.getInputDOM();
                if (syncDom !== null && syncDom !== undefined){
                    newField.synchronize(syncDom);
                }
                this.addInput(newField);
            }
            this.initializeInlineInputs(); // now do the inline, done after so that if some data is inline, and some and json, we don't re-add the input field from inline
        },
        /**
         * This will return an input with the given id.  Any inputs with a null
         * id will never be returned from this function.
         * @method getInput
         * @return {BaseInputField} field with the given id.
         */
        getInput:function(id){
            if (id === null || id === undefined){
                return null; // if they use null, we don't want anything coming back, if we didn't exit here, an item with a null id might be returned, and that would be bad practice
            }
            var inputFields = this.get('inputFields'),i,rtVl;
            for (i = 0 ; i < inputFields.length ; ++i){
                if (inputFields[i].getId() == id){
                    return inputFields[i];
                }
                if (inputFields[i].isGroup()){
                    rtVl = inputFields[i].getInput(id);
                    if (rtVl !== null && rtVl !== undefined){
                        return rtVl;
                    }
                }
            }
            return null;
        },
        /**
         * This will clear all inputs.  If silent mode is true, the indicators and buttons
         * will not update until an input is changed, or a submit button is pressed.
         * @method clear
         * @param {boolean} silent If set to true, the form validator's status will not update.
         */
        clear:function(silent){
            var inputFields = this.get('inputFields'),i;
            for (i = 0 ; i < inputFields.length ; ++i){
                inputFields[i].clear(silent);
            }
        },
        /**
         * This will take the new field that is to be added to the form, and apply any
         * default settings from the Form's defaults to the input field, if they haven't been set.
         * For instance, defaultCorrectIndicatorCss will be applied to correctIndicatorCss property
         * in the input field if that property has not been set for the newField
         * @method setupInput
         * @param {BaseInputField} newField Input field that is to be added to the Form.
         */
        setupInput:function(newField){
            // setup the defaults
            newField.set('createIncorrectIndicator',this.get('createIncorrectIndicator'));
            newField.set('createCorrectIndicator',this.get('createCorrectIndicator'));
            this.checkAttribute(newField,'defaultIncorrectIndicatorCss','incorrectIndicatorCss');
            this.checkAttribute(newField,'defaultCorrectIndicatorCss','correctIndicatorCss');
            this.checkAttribute(newField,'defaultIndicatorDomType','indicatorType');
            this.checkAttribute(newField,'correctIndicatorText','correctIndicatorText');
            this.checkAttribute(newField,'incorrectIndicatorText','incorrectIndicatorText');
            newField.initializeInput(this);
            // if we are only checking on submit, then the events on the inputs do not need to be listened for
            // this will gain us some performance.
            if (!this.get('checkOnSubmit')){
                newField.initializeEvents();
            }
            newField.get('onChangeEvent').subscribe(this.onFormValueChanged,this,true);
        },
        /**
         * This will add the given field to the form validator.  It will first, setup
         * the input using the setupInput function, then it will add it to it's list
         * of input fields.
         * @method addInput
         * @param {BaseInputField} newField Input field that is to be added to the Form.
         */
        addInput:function(newField){
            this.setupInput(newField);
            var inputFields = this.get('inputFields');
            inputFields[inputFields.length] = newField;
        },
        /**
         * This function will initialize inputs that are declared inline.  If they are already
         * declared in the JSON, then their JSON definition is updated with any settings that are set inline.
         * @method initializeInlineInputs
         */
        initializeInlineInputs:function(){
            var inlineFields = GETINLINEDECLARATIONS(this.get('form')),i;
            for (i = 0 ; i < inlineFields.length; ++i){
                this.addInlineInput(inlineFields[i]);
            }
        },
        /**
         * This will add all the member doms to the given group JSON def.
         * @method constructInlineGroup
         */
        constructInlineGroup:function(group){
            var memberDOMS = group.members,theGroup = this.getInput(group.groupDOM.id),groupNew = false,i,tempInput,type,newField;
            if (theGroup === null || theGroup === undefined){
                groupNew = true;
                theGroup = new validator.GroupBaseField({
                    groupDOM:group.groupDOM
                    },false);
                theGroup.synchronize(group.groupDOM);
            }

            for (i = 0 ; i < memberDOMS.length; ++i){
                tempInput = this.getInput(memberDOMS[i].id);
                if (memberDOMS[i].isGroup){
                    theGroup.addInput(this.constructInlineGroup(memberDOMS[i]));
                }
                // if the field exists already, don't do anything
                // For inputs with no ids, they cannot be put in through JSON, only inline, so we don't need to worry
                else if (tempInput === null || tempInput === undefined) {
                    type = validator[memberDOMS[i].getAttribute('formvalidator:type')];
                    newField = new type({
                        inputDOM:memberDOMS[i]
                        },false);
                    this.setupInput(newField);
                    theGroup.addInput(newField,this);
                    newField.synchronize(memberDOMS[i]);
                }
            }
            if (groupNew){
                this.setupInput(theGroup);
            }
            return theGroup;
        },
        /**
         * This will take the given inputDOM, extract all form validator specific
         * attributes from the DOM object, and create an input field from that and add
         * it to this form validator.
         * @method addInlineInput
         * @param {HTMLEelement} inputDOM Element that has form validator attributes declared.
         */
        addInlineInput:function(inputDOM){
            var newField = null,tempInput,type;
            // if it is a group, only the group is added, the members belong only to the group
            if (inputDOM.isGroup){
                newField = this.constructInlineGroup(inputDOM);
                this.addInput(newField);
            }
            else{
                tempInput = this.getInput(inputDOM.id);
                if (tempInput !== null && tempInput !== undefined){
                    inputDOM.id = 'formvalidator:' + guid();
                }
                type = validator[inputDOM.getAttribute('formvalidator:type')];
                newField = new type({
                    inputDOM:inputDOM
                },false);
                this.addInput(newField);
                newField.synchronize(inputDOM);
            }
        },
        /**
         * This is used to check to see if an attributes has been set on the target, if
         * not then the attName property is used to retreive a default value set in the Form's
         * main object.
         * @method checkAttribute
         * @param {BaseInputField} target The input field who's attribute is being checked
         * @param {string} attName Name of the attribute in the main form validator object that holds the Default value if the target's targetAttName has no value
         * @param {strubg} targetAttName Name of the target's attribute that is being checked for a value
         */
        checkAttribute:function(target,attName,targetAttName){
            var targetAttValue = target.get(targetAttName);
            if (targetAttValue === null || targetAttValue === undefined){
                target.set(targetAttName,this.get(attName));
            }
        },
        /**
         * This will initialize all buttons given in the button list, well as
         * any submit buttons in the form not in the exclude list
         * @method initializeButtons
         */
        initializeButtons:function(){
            var buttonJSON = this.get('buttonJSON'),
            buttons = this.get('buttons'),
            excludedButtons = this.get('excludedButtons'),i,j,submitButtons,found,buttonEl;
            for (i = 0; i < buttonJSON.length; ++i){
                buttons[i] = new validator.Button(buttonJSON[i]);
                buttonEl = buttons[i].get('buttonEl');
                if (buttonEl.type == 'button'){
                    YE.addListener(buttonEl,'click',this.submitForm,this,true);
                    //Y.Event.attach('click',this.submitForm,buttonEl,this,true);
                }
            }
            // now we find all buttons in the form that are NOT excluded.
            submitButtons = GETSUBMITBUTTONS(this.get('form'));
            for (i = 0 ; i < submitButtons.length; ++i){
                found = false;
                for (j = 0 ; j < excludedButtons.length ; ++j){
                    if (excludedButtons[j] == submitButtons[i].id){
                        found = true;
                        break;
                    }
                }
                if (!found){
                    buttons[buttons.length] = new validator.Button({
                        buttonEl:submitButtons[i]
                    });
                }
            }
        },
        /**
         * This will call the form's submit method.  If the form is not valid, the form
         * will not submit.
         * @method submitForm
         */
        submitForm:function(){
            var form = this.get('form');
            if (form.submit !== null && form.submit !== undefined){
                form.submit();
            }
        },
        /**
         * This will initialize the submit and reset events on the form validator.  The form
         * validator will listen for these events and cancel any if need be.
         * @method _initializeEvents
         */
        _initializeEvents:function(){
            YU.Event.addListener(this.get('form'),'submit',this._onFormSubmit,this,true);
            YU.Event.addListener(this.get('form'),'reset',this._onFormReset,this,true);
//            Y.Event.attach('submit',this._onFormSubmit,this.get('form'),this,true);
//            Y.Event.attach('reset',this._onFormReset,this.get('form'),this,true);
        },
        /**
         * This will get called when the form is submitted.  This will prevent the event
         * from succeeding if the form is invalid.
         * @method _onFormSubmit
         * @param {Event} ev Event that caused the submit
         */
        _onFormSubmit:function(ev,ev2){
            var onSubmitFunc = this.get('onSubmit'),
            onSubmitScope = this.get('onSubmitScope'),
            rtVl = true;
            if (onSubmitFunc !== null && onSubmitFunc !== undefined){
                if (onSubmitScope !== null && onSubmitScope !== undefined){
                    onSubmitScope.anonymousCall = onSubmitFunc;
                    rtVl = onSubmitScope.anonymousCall();
                    onSubmitScope.anonymousCall = null;
                }
                else{
                    rtVl = onSubmitFunc();
                }
            }
            if (!this.checkFormValues()){
                YE.preventDefault(ev);
                return;
            }
            else if (!rtVl){
                YE.preventDefault(ev);
            }
            this.get('onSubmitEvent').fire();
        },
        /**
         * This will get called when the form is reset, this will cause the form to recheck all it's values
         * and show the proper indicators.
         * @method _onFormReset
         * @param {Event} ev Event that caused the reset.
         */
        _onFormReset:function(ev){
            //console.debug('form reset');
            var that = this;
            setTimeout(function(){
                that.checkFormValues();
            },100);
            this.checkFormValues();
        },
        /**
         * Called when a value in the form changes.  This will determine if the submit buttons
         * are enabled and disabled.
         * @method onFormValueChanged
         */
        onFormValueChanged:function(){
            var inputFields = this.get('inputFields'),
            rtVl = true,i;
            for (i = 0 ; i < inputFields.length; ++i){
                rtVl = rtVl && inputFields[i].isValid();
            }
            // now if rtVl is false, we disable all buttons, otherwise, we enable all buttons.
            if (rtVl){
                this.enableButtons();
            }
            else{
                this.disableButtons();
            }
            return rtVl;
        },
        /**
         * Checks the form values and makes sure the proper indicators are showing and returns
         * true if the form is considered valid.
         * @method checkFormValues
         * @return {boolean} true if the form is valid.
         */
        checkFormValues:function(){
            var inputFields = this.get('inputFields'),
            rtVl = true,i;
            for (i = 0 ; i < inputFields.length; ++i){
                rtVl = inputFields[i].checkIndicators() && rtVl;
            }
            // now if rtVl is false, we disable all buttons, otherwise, we enable all buttons.
            if (rtVl){
                this.enableButtons();
            }
            else{
                this.disableButtons();
            }
            return rtVl;
        },
        /**
         * This will disable all submit buttons
         * @method disableButtons
         */
        disableButtons:function(){
            if (this.get('checkOnSubmit')){
                return; // don't disable buttons if its check on submit only
            }
            var buttons = this.get('buttons'),i;
            for (i = 0 ; i < buttons.length; ++i){
                buttons[i].disable();
            }
        },
        /**
         * This will enable all submit buttons
         * @method enableButtons
         */
        enableButtons:function(){
            var buttons = this.get('buttons'),i;
            for (i = 0 ; i < buttons.length; ++i){
                buttons[i].enable();
            }
        }
    });
    validator.Validator = _Validator;
})();