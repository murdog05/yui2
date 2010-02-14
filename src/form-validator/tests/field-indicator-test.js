var Y = YAHOO,
YL = Y.lang,
YU = Y.util,
YE = YU.Event,
YW = Y.widget,
YD = YU.Dom;
if (!YW.formValidatorTests){
    YW.formValidatorTests = {};
}

YL.augmentObject(YW.formValidatorTests,{
    fieldIndicatorTestCase:new YAHOO.tool.TestCase({
        name:'Field Indicator tests',
        /**
             * This will setup a hidden div on the page as well as an input
             * field for the indicators to go next to.
             */
        setUp:function(){
            if (!this.hiddenDiv){
                this.hiddenDiv = document.createElement('DIV');
                this.hiddenDiv.style.display = 'none';
                document.body.appendChild(this.hiddenDiv);
            }
            if (!this.input){
                this.input = document.createElement('input');
                this.input.type = 'text';
                this.hiddenDiv.appendChild(this.input);
            }
            this.fieldValidatorMock = new mocks.FieldValidatorMock();
            this.fieldValidatorMock.createEvent('inputInvalid');
            this.fieldValidatorMock.createEvent('inputValid');
        },
        /**
         * Remove all the indicators next to the input div
         */
        tearDown:function(){
            var children = YD.getChildren(this.hiddenDiv);
            this.hiddenDiv.removeChild(children[1]);
            this.fieldValidatorMock.unsubscribeAll('inputInvalid');
            this.fieldValidatorMock.unsubscribeAll('inputValid');
        },
        /**
         * This will test an initialization where
         * the field indicator dom needs to be created.
         */
        testInitialize_CreateDom:function(){
            var Assert = YAHOO.util.Assert;
            // create a correct indicator
            var indicator = new YW.FieldIndicator('correct',this.input);
            Assert.isObject(indicator.get('element'));
            var children = YD.getChildren(this.hiddenDiv);
            Assert.areEqual(this.input,children[0]);
            var indicatorEl = indicator.get('element');
            Assert.areEqual(indicatorEl,children[1]);
            Assert.areEqual('&nbsp;',indicatorEl.innerHTML);
            Assert.areEqual('indicator',indicatorEl.className);
        },
        /**
         * This will use a default style, but not a default inidicator configuration
         */
        testInitialize_CreateDom_partialdefault:function(){
            var Assert = YAHOO.util.Assert;
            // create a correct indicator
            var indicator = new YW.FieldIndicator(
                {
                    style:'correct'
                },
                this.input);
            Assert.isObject(indicator.get('element'));
            var children = YD.getChildren(this.hiddenDiv);
            Assert.areEqual(this.input,children[0]);
            var indicatorEl = indicator.get('element');
            Assert.areEqual(indicatorEl,children[1]);
            Assert.areEqual('&nbsp;',indicatorEl.innerHTML);
            Assert.areEqual('indicator',indicatorEl.className);
            Assert.areEqual('DIV',indicatorEl.tagName);
        },
        /**
         * This will test the creation of the indicator using NON default
         * configuration
         */
        testInitialize_CreateDom_nondefault:function(){
            var Assert = YAHOO.util.Assert;
            // create a correct indicator
            var indicator = new YW.FieldIndicator(
                {
                    style:{
                        tagType:'SPAN',
                        className:'indicator_test',
                        html:'&nbsp;'
                    }
                },
                this.input);
            Assert.isObject(indicator.get('element'));
            var children = YD.getChildren(this.hiddenDiv);
            Assert.areEqual(this.input,children[0]);
            var indicatorEl = indicator.get('element');
            Assert.areEqual(indicatorEl,children[1]);
            Assert.areEqual('&nbsp;',indicatorEl.innerHTML);
            Assert.areEqual('indicator_test',indicatorEl.className);
            Assert.areEqual('SPAN',indicatorEl.tagName);
        },
        /**
         * this will test the show and hide event listeners.
         */
        testEvents_showhide:function(){
            var Assert = YAHOO.util.Assert,
            validIndicator = new YW.FieldIndicator('correct',this.input),
            validIndicatorEl = validIndicator.get('element'),
            invalidIndicator = new YW.FieldIndicator('incorrect',this.input),
            invalidIndicatorEl = invalidIndicator.get('element');
            // setup the indicator with the mock event source
            validIndicator.registerEvents(this.fieldValidatorMock,
                {
                    hide:['inputInvalid'],
                    show:['inputValid']
                });
            invalidIndicator.registerEvents(this.fieldValidatorMock,
                {
                    hide:['inputValid'],
                    show:['inputInvalid']
                });

            Assert.areEqual('',validIndicatorEl.style.display);
            Assert.areEqual('',invalidIndicatorEl.style.display);

            this.fieldValidatorMock.fireEvent('inputInvalid',[{},this.fieldValidatorMock]);
            
            Assert.areEqual('none',validIndicatorEl.style.display,'Valid Indicator still showing when it should be hidden');
            Assert.areEqual('',invalidIndicatorEl.style.display,'Invalid Indicator is hidden when it should be showing');
            
            this.fieldValidatorMock.fireEvent('inputValid',[{},this.fieldValidatorMock]);

            Assert.areEqual('none',invalidIndicatorEl.style.display,'Invalid Indicator still showing when it should be hidden');
            Assert.areEqual('',validIndicatorEl.style.display,'Valid Indicator is hidden when it should be showing');
        },
        /**
         * this will test the show and hide event listeners.
         */
        testEvents_formatter:function(){
            var Assert = YAHOO.util.Assert,
            formatterInfo = {},
            validIndicator = new YW.FieldIndicator('correct',this.input),
            validIndicatorEl = validIndicator.get('element'),
            invalidIndicator = new YW.FieldIndicator({
                style:'correct',
                formatter:function(fieldValidator,fieldIndicator,meta){
                    formatterInfo.fieldValidator = fieldValidator;
                    formatterInfo.fieldIndicator = fieldIndicator;
                    formatterInfo.meta = meta;
                }
            },this.input),
            invalidIndicatorEl = invalidIndicator.get('element');
            // setup the indicator with the mock event source
            validIndicator.registerEvents(this.fieldValidatorMock,
                {
                    hide:['inputInvalid'],
                    show:['inputValid']
                });
            invalidIndicator.registerEvents(this.fieldValidatorMock,
                {
                    hide:['inputValid'],
                    show:['inputInvalid']
                });

            Assert.areEqual('',validIndicatorEl.style.display);
            Assert.areEqual('',invalidIndicatorEl.style.display);

            this.fieldValidatorMock.fireEvent('inputInvalid',[{testMeta:true},this.fieldValidatorMock]);

            Assert.areEqual('none',validIndicatorEl.style.display,'Valid Indicator still showing when it should be hidden');
            Assert.areEqual('',invalidIndicatorEl.style.display,'Invalid Indicator is hidden when it should be showing');

            Assert.isTrue(formatterInfo.meta.testMeta === true,'Formatter info does not have proper meta data');
        }
    })
});