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
    formValidatorTestCase:new YAHOO.tool.TestCase({
        name:'Form Validator tests',
        /**
             * This will setup a hidden div on the page as well as an input
             * field for the indicators to go next to.
             */
        setUp:function(){
            // hidden div will double as the form element
            if (!this.hiddenDiv){
                this.hiddenDiv = document.createElement('DIV');
                this.hiddenDiv.style.display = 'none';
                document.body.appendChild(this.hiddenDiv);
            }
            if (!this.input){
                this.input = document.createElement('input');
                this.input.type = 'text';
                this.input.id = 'test-text-input'
                this.hiddenDiv.appendChild(this.input);
            }
            // put a submit button in the hidden div
            if (!this.formButton){
                this.formButton = document.createElement('input');
                this.formButton.type = 'submit';
                this.formButton.id = 'formButton';
                this.hiddenDiv.appendChild(this.formButton);
            }
            if (!this.formButton2){
                this.formButton2 = document.createElement('input');
                this.formButton2.type = 'button';
                this.formButton2.id = 'formButton2';
                this.hiddenDiv.appendChild(this.formButton2);
            }
            if (!this.checkboxInput){
                this.checkboxInput = document.createElement('input');
                this.checkboxInput.id = 'test-checkbox-input'
                this.checkboxInput.type = 'checkbox';
                this.hiddenDiv.appendChild(this.checkboxInput);
            }
            if (!this.correctEl){
                this.correctEl = document.createElement('DIV');
                this.hiddenDiv.appendChild(this.correctEl);
            }
            if (!this.incorrectEl){
                this.incorrectEl = document.createElement('DIV');
                this.hiddenDiv.appendChild(this.incorrectEl);
            }
        },
        /**
         * 
         */
        tearDown:function(){
        },
        /**
         * This will test the enabling and disabling of submit buttons based
         * on the form's current status.
         */
        testSubmitButtonStatus:function(){
            var Assert = YAHOO.util.Assert,inputCorrect = false,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:function(el){
                            return inputCorrect;
                        }
                    }
                }
            });

            // The form is invalid right now, this should disable the form button
            validator.updateForm();
            Assert.areEqual(1,validator.buttons.length);
            Assert.isFalse(validator.isValid(),'The form is valid when it should be invalid');
            Assert.isTrue(this.formButton.disabled,'This submit button is enabled when it should be disabled');
            inputCorrect = true;
            validator.updateForm();
            Assert.isTrue(validator.isValid(),'The form is invalid when it should be valid');
            Assert.isFalse(this.formButton.disabled,'This submit button is disabled when it should be enabled');
        },
        /**
         * This will ensure that the relationship between the validator
         * and the indicator is configured correctly by the form validator
         */
        testConfig_ValidatorAndIndicator:function(){
            var Assert = YAHOO.util.Assert,inputCorrect = false,validator,invalidCalled = false,validCalled = false;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:function(el,meta){
                            if (inputCorrect) meta.addMeta('inputCorrectTrue','Your input is correct');
                            else meta.addMeta('inputCorrectFalse','Your input is incorrect');
                            return inputCorrect;
                        },
                        indicators:{
                            invalid:{
                                el:this.incorrectEl,
                                formatter:function(fieldValidator,fieldIndicator,meta){
                                    invalidCalled = true;
                                    Assert.areEqual('Your input is incorrect',meta.inputCorrectFalse);
                                }
                            },
                            valid:{
                                el:this.correctEl,
                                formatter:function(fieldValidator,fieldIndicator,meta){
                                    validCalled = true;
                                    Assert.areEqual('Your input is correct',meta.inputCorrectTrue);
                                }
                            }
                        }
                    }
                }
            });
            // Check to ensure that invalid is called properly
            validator.updateForm();
            Assert.isTrue(invalidCalled, 'Invalid should have been called but wasn\'t');
            Assert.isFalse(validCalled, 'Valid was called, but should not have been');
            invalidCalled = false;

            // Check to ensure valid is called properly
            inputCorrect = true;
            validator.updateForm();
            Assert.isTrue(validCalled, 'Valid should have been called but wasn\'t');
            Assert.isFalse(invalidCalled, 'Invalid was called, but should not have been');
            validCalled = false;
        },
        /**
         * This will test the default validation for text inputs
         */
        testValidatorDefaults_textInput:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{validation:'text'}
                }
            });
            this.input.value = '';
            Assert.isFalse(validator.isValid());
            this.input.value = 'something';
            Assert.isTrue(validator.isValid());
        },
        /**
         * This will test the default validation for integer inputs
         */
        testValidatorDefaults_integerInput:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{validation:'integer'}
                }
            });
            this.input.value = '';
            Assert.isFalse(validator.isValid());
            this.input.value = 'something';
            Assert.isFalse(validator.isValid());
            this.input.value = '32.';
            Assert.isFalse(validator.isValid());
            this.input.value = '32.3332';
            Assert.isFalse(validator.isValid());
            this.input.value = '32';
            Assert.isTrue(validator.isValid());

        },
        /**
         * This will test the default validation for double inputs
         */
        testValidatorDefaults_doubleInput:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{validation:'double'}
                }
            });
            this.input.value = '';
            Assert.isFalse(validator.isValid());
            this.input.value = 'something';
            Assert.isFalse(validator.isValid());
            this.input.value = '32.';
            Assert.isFalse(validator.isValid());
            this.input.value = '32.3332';
            Assert.isTrue(validator.isValid());
            this.input.value = '32';
            Assert.isTrue(validator.isValid());
        },
        /**
         * This will test the default validation for text inputs
         */
        testValidatorDefaults_checkedInput:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-checkbox-input':{validation:'checked'}
                }
            });
            this.checkboxInput.checked = false;
            Assert.isFalse(validator.isValid());
            this.checkboxInput.checked = true;
            Assert.isTrue(validator.isValid());
        },
        /**
         * This will test the default validation for text inputs
         */
        testValidatorDefaults_uncheckedInput:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-checkbox-input':{validation:'unchecked'}
                }
            });
            this.checkboxInput.checked = false;
            Assert.isTrue(validator.isValid());
            this.checkboxInput.checked = true;
            Assert.isFalse(validator.isValid());
        },
        /**
         * This will test the default correct indicator
         */
        testIndicatorDefaults_correctInidicator:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:'text',
                        indicators:{
                            valid:{el:this.correctEl}
                        }
                    }
                }
            });
            this.input.value = '';
            validator.updateForm();
            Assert.areEqual('none',this.correctEl.style.display);
            this.input.value = 'something';
            validator.updateForm();
            Assert.areEqual('',this.correctEl.style.display);
        },
        /**
         * This will test the default incorrect indicator
         */
        testIndicatorDefaults_incorrectInidicator:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:'text',
                        indicators:{
                            invalid:{el:this.incorrectEl}
                        }
                    }
                }
            });
            this.input.value = '';
            validator.updateForm();
            Assert.areEqual('',this.incorrectEl.style.display);
            this.input.value = 'something';
            validator.updateForm();
            Assert.areEqual('none',this.incorrectEl.style.display);
        },
        testIndicatorDefaults_indicatorForBoth:function(){
            var Assert = YAHOO.util.Assert,validator;
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:'text',
                        indicator:{
                            el:this.incorrectEl
                        }
                    }
                }
            });
            this.input.value = '';
            validator.updateForm();
            Assert.areEqual('',this.correctEl.style.display);
            this.input.value = 'something';
            validator.updateForm();
            Assert.areEqual('',this.correctEl.style.display);
        },
        /**
         * This will test the configuration of the buttons to make sure
         * a button is not added to the form validator twice.
         */
        testButtonConfig_noDuplicates:function(){
            var Assert = YAHOO.util.Assert,validator;
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:'text',
                        indicator:{
                            el:this.incorrectEl
                        }
                    }
                },
                buttons:['formButton','formButton2']
            });

            Assert.areEqual(2,validator.buttons.length);
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:'text',
                        indicator:{
                            el:this.incorrectEl
                        }
                    }
                },
                buttons:['formButton']
            });
            Assert.areEqual(1,validator.buttons.length);
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:'text',
                        indicator:{
                            el:this.incorrectEl
                        }
                    }
                },
                buttons:['formButton2']
            });
            Assert.areEqual(2,validator.buttons.length);
            validator = new YW.FormValidator(this.hiddenDiv,{
                inputs:{
                    'test-text-input':{
                        validation:'text',
                        indicator:{
                            el:this.incorrectEl
                        }
                    }
                },
                findButtons:false,
                buttons:['formButton2']
            });
            Assert.areEqual(1,validator.buttons.length);
        }
    })
});