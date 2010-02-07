(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YE = YU.Event,
    YW = Y.widget,
    YD = YU.Dom;

    /**
     * The indicator represents a dom element that will appear to signify one of many different
     * status' of an input field.  For instance, it could show up when the field is valid, or when
     * the field is invalid, or when the number value in the field is out of the specified range.
     * @class FieldIndicator
     *
     * This will take the configuration and an optional neighbor.  Neighbor is required
     * if the dom for this indicator is being created dynamically.
     * @constructor
     * @param {Object} config Configuration for the indicator
     * @param {HTMLElement|String} neighbor Html Element used to dynamically create the indicator dom if an el is not already created.
     */
    function FieldIndicator(config,neighbor){
        // I have to setup the dom element BEFORE i call the super class' constructor or else and error occurs.
        // I could pass document.body, then change it after, if need be, but I don't think this would be good practice
        var args = this._init(config,neighbor);
        FieldIndicator.superclass.constructor.apply(this,args);
    }

    /**
     * Augment form with standard indicator definitions.
     */
    YL.augmentObject(FieldIndicator,{
        /**
         * This is a collection of default events for registering indicators with event sources.
         * @property FormEvents
         * @static
         * @type Object
         */
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
        },
        /**
         * This holds the default style used for creating indicators dynamically.
         * @property DefaultStyle
         * @static
         * @type Object
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
        /**
         * This is a collection of default configurations for indicators
         * @property Indicators
         * @static
         * @type Object
         */
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
    Y.extend(FieldIndicator,YU.Element,{
        /**
         * Implementation of Element's abstract method. Sets up config values.
         *
         * @method initAttributes
         * @param config {Object} (Optional) Object literal definition of configuration values.
         * @private
         */
        initAttributes:function(config){
            var oConfigs = config || {};
            FieldIndicator.superclass.initAttributes.call(this, oConfigs);

            /**
             * This is the function that is called when the indicator is shown.
             * @attribute formatter
             * @type function
             */
            this.setAttributeConfig("formatter",{
                value:function(fieldValidator,fieldIndicator,meta) {
                    fieldIndicator.get('element').style.display = '';
                },
                validator:YL.isFunction,
                setter:function(val){
                    if (!val){
                        return function(fieldValidator,fieldIndicator,meta) {
                            fieldIndicator.get('element').style.display = '';
                        };
                    }
                    else {
                        return val;
                    }
                }
            });

            this.setAttributeConfig('style',{
                value:null
            });
        },
        /**
         * This will get the configuration object and dom object represented by
         * this indicator.  If the el does not exist, it will be created using
         * the specified default style.  If no style specified, no style is applied.
         * The configuration will then be used to setup the indicator using the newly create el.
         * @method _init
         * @param {Object} config Configuration for the field indicator
         * @param {HTMLElement|String} theNeighbor If the indicator needs to be created, this is the element the indicator will be placed after.
         * @return {Object[]} returns an array of 2 elements, the first being the indidcator el, and the second being the configuration.
         * @private
         */
        _init:function(config,theNeighbor){
            var el = config.el,theConfig = config,neighbor = theNeighbor;//,validator = null;
            if (YL.isString(neighbor)){
                neighbor = YD.get(neighbor);
            }
            if (YL.isString(theConfig)){
                //console.debug(theConfig);
                theConfig = FieldIndicator.Indicators[theConfig].call();
            }
            if (!neighbor && !el){
                YAHOO.log('No dom element given to field indicator, nor is there any way to create the dom element','warn','FieldIndicator');
                return [theConfig];
            }
            // initialize the dom
            el = this._initializeDom(theConfig.el,theConfig.style,neighbor);
            theConfig.style = null; // clear the style, it is not needed anymore.
            return [el,theConfig];
        },
        /**
         * This function will create an Html element for the indicator after the given neighbor
         * @method _initializeDom
         * @param {HTMLElement} el The value defined under the el property in the given configuration
         * @param {Object} style Style object for creating the html element
         * @param {HTMLElement} neighbor Html Element that the new Html Element will be placed beside.
         * @return {HTMLElement} new html element that will represent the indicator.
         */
        _initializeDom:function(el,style,neighbor){
            var theEl = el,doInsert = true,theStyle = style;
            // if the el is a string
            if (YL.isString(theEl)){
                theEl = YD.get(theEl);
            }
            if (theEl) doInsert = false;
            theEl = this._setupEl(theEl,theStyle);

            // if the el was created, then it will need to be inserted.
            if (doInsert){
                YD.insertAfter(theEl,neighbor);
            }

            return theEl;
        },
        /**
         * This will register and indicator with events of the event source based
         * on the configuration
         * @method registerEvents
         * @param {Object} eventSource Any object that has a subscribe method
         * @param {String|Object} eventKey This can be a key for a predefined default event configuration, or it could be an event configuration object itself.
         */
        registerEvents:function(eventSource,eventKey){
            this._initializeEvents(eventSource,eventKey);
        },
        /**
         * This is the same as registerEvents, except its in the protected scope.
         * @method _initializeEvents
         * @param {Object} eventSource Any object that has a subscribe method
         * @param {String|Object} eventKey This can be a key for a predefined default event configuration, or it could be an event configuration object itself.
         * @protected
         */
        _initializeEvents:function(eventSource,eventKey){
            var i,methodName,method,events,eventCfg;
            if (YL.isString(eventKey)){
                eventCfg = FieldIndicator.FormEvents[eventKey].call();
            }
            else{
                eventCfg = eventKey;
            }
            if (!eventCfg){
                return;
            }
            for (methodName in eventCfg){
                method = this[methodName];
                if (!YL.isFunction(method)){
                    YAHOO.log('You can only use functions to subscribe to validator events','warn','FieldIndicator');
                }
                events = eventCfg[methodName];
                for (i = 0 ; i < events.length; ++i){
                    eventSource.subscribe(events[i],method,this,this);
                }
            }
        },
        /**
         * Given a HTML object, id, or null, this will create a DOM object (but not insert it into the document yet) that
         * will represent the indicator on the form.  If a new one is created, it will
         * be created using the given style.  If no style defined, then no style applied.
         * @method _setupEl
         * @param {HTMLElement} el Optional HTML element, if null is given, a new element will be created
         * @param {Object|String} style Configuration or key for default style used to create the element.  Information such as tag type, class name and inner html would be defined here
         * @return {HTMLElement} html element styled using the given configuration.
         */
        _setupEl:function(el,style){
            var rtVl = el,theStyle = style;
            if (!style){
                theStyle = FieldIndicator.DefaultStyle.emptystyle;
            }
            else if (YL.isString(theStyle)){
                theStyle = FieldIndicator.DefaultStyle[theStyle.toLowerCase()];
            }
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
                if (rtVl.className == '' && theStyle.className){
                    rtVl.className = theStyle.className;
                }
            }

            return rtVl;
        },
        
        /**
         * This will show the indicator.  This will call the formatter
         * function provided to the indicator.
         * @method show
         */
        show:function(args,formValidator){
            var formatter = this.get('formatter'), errorMeta,validator;
            if (args){
                errorMeta = args[0];
                validator = args[1];
            }
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
         * @method hide
         */
        hide:function(args,formValidator){
            this.setStyle('display','none');
        }
    });
    YW.FieldIndicator = FieldIndicator;
    YW.FormValidator.FieldIndicator = FieldIndicator;
})();