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
            if (!this.subHiddenDiv) {
                this.subHiddenDiv = document.createElement('DIV');
                this.hiddenDiv.appendChild(this.subHiddenDiv);
            }
            else {
                this.subHiddenDiv.innerHTML = '';
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
         * This will test the collection of buttons that will natively submit
         * the form.
         */
        testButtonCollection:function() {
            var imageButton = document.createElement('input'), button = document.createElement('button'), regularButton = document.createElement('input');
            imageButton.type = 'image';
            regularButton.type = 'button';
            
            this.subHiddenDiv.appendChild(imageButton);
            this.subHiddenDiv.appendChild(regularButton);
            this.subHiddenDiv.appendChild(button);
            var Assert = YAHOO.util.Assert,inputCorrect = false,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-text-input':{
                        validation:function(el){
                            return inputCorrect;
                        }
                    }
                }
            });
            Assert.areEqual(3,validator.buttons.length);
            Assert.areEqual(imageButton,validator.buttons[0]);
            Assert.areEqual(button,validator.buttons[1]);
            Assert.areEqual(this.formButton,validator.buttons[2]);
        },
        /**
         * This will test the enabling and disabling of submit buttons based
         * on the form's current status.
         */
        testSubmitButtonStatus:function(){
            var Assert = YAHOO.util.Assert,inputCorrect = false,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-text-input':{
                        validation:function(el){
                            return inputCorrect;
                        }
                    }
                }
            });

            // The form is invalid right now, this should disable the form button
            validator.validate();
            Assert.areEqual(1,validator.buttons.length);
            Assert.isFalse(validator.isValid(),'The form is valid when it should be invalid');
            Assert.isTrue(this.formButton.disabled,'This submit button is enabled when it should be disabled');
            inputCorrect = true;
            validator.validate();
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
                fields:{
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
            validator.validate();
            Assert.isTrue(invalidCalled, 'Invalid should have been called but wasn\'t');
            Assert.isFalse(validCalled, 'Valid was called, but should not have been');
            invalidCalled = false;

            // Check to ensure valid is called properly
            inputCorrect = true;
            validator.validate();
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
                fields:{
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
                fields:{
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
                fields:{
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
                fields:{
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
                fields:{
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
                fields:{
                    'test-text-input':{
                        validation:'text',
                        indicators:{
                            valid:{el:this.correctEl}
                        }
                    }
                }
            });
            this.input.value = '';
            validator.validate();
            Assert.areEqual('none',this.correctEl.style.display);
            this.input.value = 'something';
            validator.validate();
            Assert.areEqual('',this.correctEl.style.display);
        },
        /**
         * This will test the default incorrect indicator
         */
        testIndicatorDefaults_incorrectInidicator:function(){
            var Assert = YAHOO.util.Assert,validator;
            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-text-input':{
                        validation:'text',
                        indicators:{
                            invalid:{el:this.incorrectEl}
                        }
                    }
                }
            });
            this.input.value = '';
            validator.validate();
            Assert.areEqual('',this.incorrectEl.style.display);
            this.input.value = 'something';
            validator.validate();
            Assert.areEqual('none',this.incorrectEl.style.display);
        },
        testIndicatorDefaults_indicatorForBoth:function(){
            var Assert = YAHOO.util.Assert,validator;
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-text-input':{
                        validation:'text',
                        indicator:{
                            el:this.incorrectEl
                        }
                    }
                }
            });
            this.input.value = '';
            validator.validate();
            Assert.areEqual('',this.correctEl.style.display);
            this.input.value = 'something';
            validator.validate();
            Assert.areEqual('',this.correctEl.style.display);
        },
        /**
         * This will test the configuration of the buttons to make sure
         * a button is not added to the form validator twice.
         */
        testButtonConfig_noDuplicates:function(){
            var Assert = YAHOO.util.Assert,validator;
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
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
                fields:{
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
                fields:{
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
                fields:{
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
        },
        /**
         * Test the form submission prevention if the form is invalid, or the
         * before submit returns false.
         */
        testFormSubmit:function(){
            var Assert = YAHOO.util.Assert,validator,formSubmitted = false,formValid = false;
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-text-input':{
                        validation:function(){return formValid;}
                    }
                },
                buttons:['formButton','formButton2']
            });
            validator.on('formSubmit',function(){formSubmitted = true;});
            validator.submit();
            Assert.isFalse(formSubmitted);
            formValid = true;
            validator.submit();
            Assert.isTrue(formSubmitted);
        },
        /**
         * This will test to ensure the asycnSubmit event is fired when the form is valid and
         * asyncSubmit is set to true.
         */
        testAsyncSubmit:function(){
            var Assert = YAHOO.util.Assert,asyncSubmitted = false,formValid = false,
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-text-input':{
                        validation:function(){return formValid;}
                    }
                },
                buttons:['formButton','formButton2'],
                asyncSubmit:true
            });
            validator.on('asyncSubmit',function(){asyncSubmitted = true;});
            validator.submit();
            Assert.isFalse(asyncSubmitted);
            formValid = true;
            validator.submit();
            Assert.isTrue(asyncSubmitted);
        },
        /**
         * This will test the functions that return the valid and invalid fields.
         */
        testGetInvalidValidfields:function(){
            var Assert = YAHOO.util.Assert,formValid = [false,false,false],
            text1 = document.createElement('input'),text2 = document.createElement('input'),
            text3 = document.createElement('input'),validator,invalid,valid;

            text1.type = 'text';
            text1.id = 'test-text-input1';
            text2.type = 'text';
            text2.id = 'test-text-input2';
            text3.type = 'text';
            text3.id = 'test-text-input3';
            this.subHiddenDiv.appendChild(text1);
            this.subHiddenDiv.appendChild(text2);
            this.subHiddenDiv.appendChild(text3);

            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-text-input1':{
                        validation:function(){return formValid[0];}
                    },
                    'test-text-input2':{
                        validation:function(){return formValid[1];}
                    },
                    'test-text-input3':{
                        validation:function(){return formValid[2];}
                    }
                }
            });
            valid = validator.getValidFields();
            invalid = validator.getInvalidFields();
            Assert.areEqual(0,valid.length);
            Assert.areEqual(3,invalid.length);
            Assert.areEqual('test-text-input1',invalid[0].get('element').id);
            Assert.areEqual('test-text-input2',invalid[1].get('element').id);
            Assert.areEqual('test-text-input3',invalid[2].get('element').id);

            formValid[1] = true;

            valid = validator.getValidFields();
            invalid = validator.getInvalidFields();
            Assert.areEqual(1,valid.length);
            Assert.areEqual(2,invalid.length);
            Assert.areEqual('test-text-input1',invalid[0].get('element').id);
            Assert.areEqual('test-text-input2',valid[0].get('element').id);
            Assert.areEqual('test-text-input3',invalid[1].get('element').id);

            formValid[0] = true;

            valid = validator.getValidFields();
            invalid = validator.getInvalidFields();
            Assert.areEqual(2,valid.length);
            Assert.areEqual(1,invalid.length);
            Assert.areEqual('test-text-input1',valid[0].get('element').id);
            Assert.areEqual('test-text-input2',valid[1].get('element').id);
            Assert.areEqual('test-text-input3',invalid[0].get('element').id);

            formValid[2] = true;

            valid = validator.getValidFields();
            invalid = validator.getInvalidFields();
            Assert.areEqual(3,valid.length);
            Assert.areEqual(0,invalid.length);
            Assert.areEqual('test-text-input1',valid[0].get('element').id);
            Assert.areEqual('test-text-input2',valid[1].get('element').id);
            Assert.areEqual('test-text-input3',valid[2].get('element').id);
        }
    })
});