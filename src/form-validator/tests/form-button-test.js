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
    buttonTestCase:new YAHOO.tool.TestCase({
        name:'Validator Button test',
        /**
             * This will setup a hidden button in a hidden div on the page
             */
        setUp:function(){
            if (!this.hiddenDiv){
                this.hiddenDiv = document.createElement('DIV');
                this.hiddenDiv.style.display = 'none';
                document.body.appendChild(this.hiddenDiv);
            }
            if (!this.buttonInput){
                this.buttonInput = document.createElement('input');
                this.buttonInput.type = 'button';
                this.buttonInput.value = 'A button';
                this.hiddenDiv.appendChild(this.buttonInput);
            }
        },
        /**
         * This will test the buttons enable/disable functions.
         */
        testEnableDisableButton:function(){
            var Assert = YAHOO.util.Assert;
            var button = new YW.FormButton(this.buttonInput,{});
            Assert.isObject(button.get('element'));
            Assert.areEqual(this.buttonInput,button.get('element'));
            button.disable();
            Assert.isTrue(this.buttonInput.disabled);
            button.enable();
            Assert.isFalse(this.buttonInput.disabled);
        }
    })
});