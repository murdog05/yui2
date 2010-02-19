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
    fieldValidatorTestCase:new YAHOO.tool.TestCase({
        name:'Field Validator test',
        /**
             * This will setup a hidden button in a hidden div on the page
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
            if (!this.checkbox){
                this.checkbox = document.createElement('input');
                this.checkbox.type = 'checkbox';
                this.hiddenDiv.appendChild(this.input);
            }

        },
        /**
         * Remove all the indicators next to the input div
         */
        tearDown:function(){
            this.input.value = '';
        },
        /**
         * This will test the buttons enable/disable functions.
         */
        testDefaultIsEmpty:function(){
            var Assert = YAHOO.util.Assert;
            var textInput = new YW.FieldValidator(this.input,{});
            Assert.isObject(textInput.get('element'));
            Assert.areEqual(this.input,textInput.get('element'));
            Assert.isTrue(textInput.isEmpty());
            this.input.value = 'Something';
            Assert.isFalse(textInput.isEmpty());
        },
        /**
         * This will test to see if the empty function we put in is called.
         */
        testNonDefaultIsEmpty:function(){
            var Assert = YAHOO.util.Assert;
            var isEmptyWasCalled = false;
            var textInput = new YW.FieldValidator(this.input,{empty:function(input){
                    isEmptyWasCalled = true;
                    return input.value == '' || input.value == '&nbsp;';
            }});
            Assert.isTrue(textInput.isEmpty(),'Should have been considered empty with an empty string, but it was not.');
            Assert.isTrue(isEmptyWasCalled,'Our custom function wasnt called when it should have been');
            this.input.value = '&nbsp;';
            Assert.isTrue(textInput.isEmpty(),'Was considered non-empty with &nbsp when it should have been empty');
            this.input.value = 'NON-EMPTY';
            Assert.isFalse(textInput.isEmpty(),'Was considered empty with &nbsp when it should have been non-empty');
        },
        /**
         * Test the text validator type.
         */
        testTextIsValid:function(){
            var Assert = YAHOO.util.Assert;
            var textInput = new YW.FieldValidator(this.input,{type:'text'});
            this.input.value = '';
            Assert.isFalse(textInput.isValid());
            this.input.value = 'Some text';
            Assert.isTrue(textInput.isValid());
            this.input.value = '';
            Assert.isFalse(textInput.isValid());
        },
        /**
         * This will test the integer validation function.
         */
        testNumberIsValid:function(){
            var Assert = YAHOO.util.Assert;
            var numberInput = new YW.FieldValidator(this.input,{type:'integer'});
            this.input.value = '';
            Assert.isFalse(numberInput.isValid());
            this.input.value = '32';
            Assert.isTrue(numberInput.isValid(),'The number 32 is invalid when it should be valid');
            this.input.value = '32.';
            Assert.isFalse(numberInput.isValid());
            this.input.value = '32.32';
            Assert.isFalse(numberInput.isValid());
            this.input.value = '433';
            Assert.isTrue(numberInput.isValid());
        },
        /**
         * This will test the double validation function.
         */
        testDoubleIsValid:function(){
            var Assert = YAHOO.util.Assert;
            var numberInput = new YW.FieldValidator(this.input,{type:'double'});
            this.input.value = '';
            Assert.isFalse(numberInput.isValid());
            this.input.value = '32';
            Assert.isTrue(numberInput.isValid(),'The number 32 is invalid when it should be valid');
            this.input.value = '32.';
            Assert.isFalse(numberInput.isValid());
            this.input.value = '32.32';
            Assert.isTrue(numberInput.isValid());
            this.input.value = '433';
            Assert.isTrue(numberInput.isValid());
        },
        /**
         * This will test the double validation function.
         */
        testMaxDecimals:function(){
            var Assert = YAHOO.util.Assert;
            var numberInput = new YW.FieldValidator(this.input,{type:'double',maxDecimalPlaces:2});
            this.input.value = '';
            Assert.isFalse(numberInput.isValid());
            this.input.value = '32';
            Assert.isTrue(numberInput.isValid(),'The number 32 is invalid when it should be valid');
            this.input.value = '32.';
            Assert.isFalse(numberInput.isValid());
            this.input.value = '32.32';
            Assert.isTrue(numberInput.isValid());
            this.input.value = '433.322';
            Assert.isFalse(numberInput.isValid());
        },
        /**
         * This will test the email validation function.
         */
        testEmailIsValid:function(){
            var Assert = YAHOO.util.Assert;
            var emailInput = new YW.FieldValidator(this.input,{type:'email'});
            this.input.value = '';
            Assert.isFalse(emailInput.isValid());
            this.input.value = 'murray.macchio@gmail.com';
            Assert.isTrue(emailInput.isValid());
            this.input.value = 'murray.macchio@gmail.c';
            Assert.isFalse(emailInput.isValid());
            this.input.value = '@gmail.com';
            Assert.isFalse(emailInput.isValid());
            this.input.value = 'murray.macchio@com';
            Assert.isFalse(emailInput.isValid());
        },
        /**
         * This will test the checkbox validation functions
         */
        testCheckedUncheckedIsValid:function(){
            var Assert = YAHOO.util.Assert;
            var checkedInput = new YW.FieldValidator(this.checkbox,{type:'checked'});
            var uncheckedInput = new YW.FieldValidator(this.checkbox,{type:'unchecked'});

            this.checkbox.checked = false;
            Assert.isFalse(checkedInput.isValid());
            Assert.isTrue(uncheckedInput.isValid());
            this.checkbox.checked = true;
            Assert.isTrue(checkedInput.isValid());
            Assert.isFalse(uncheckedInput.isValid());
        },
        /**
         * This will test the custom validation function
         */
        testCustomValidatorFunction:function(){
            var customFuncCalled = false;
            var customFunc = function(el){
                customFuncCalled =true;
                return true;
            }
            var Assert = YAHOO.util.Assert;
            var textInput = new YW.FieldValidator(this.input,{type:customFunc});
            Assert.isTrue(textInput.isValid());
            Assert.isTrue(customFuncCalled);
        },
        /**
         * This will ensure that the proper events are thrown for min, max etc.
         * for a double input type.
         */
        testDoubleRangeErrorMeta:function(){
            var Assert = YAHOO.util.Assert,invalidWasCalled = false,validWasCalled = false,
            doubleInput = new YW.FieldValidator(this.input,{
                type:'double',
                min:5,
                max:10
            });

            var expectedErrorKey = 'numberBelowMin';
            doubleInput.subscribe('inputValid',function(args){
                validWasCalled = true;
            });
            doubleInput.subscribe('inputInvalid',function(args){
                var meta = args[0],key,count = 0;
                invalidWasCalled = true;
                Assert.isTrue(meta.errors[expectedErrorKey] != null);
            });
            this.input.value = '2';
            Assert.isFalse(doubleInput.validate());
            Assert.isTrue(invalidWasCalled,'Invalid event was not called');
            Assert.isFalse(validWasCalled,'Valid event was called');
            invalidWasCalled = false;
            validWasCalled = false;

            expectedErrorKey = 'numberAboveMax'
            this.input.value = '11';
            Assert.isFalse(doubleInput.validate());
            Assert.isTrue(invalidWasCalled,'Invalid event was not called');
            Assert.isFalse(validWasCalled,'Valid event was called');
            invalidWasCalled = false;
            validWasCalled = false;

            this.input.value = '7';
            Assert.isTrue(doubleInput.validate());
            Assert.isFalse(invalidWasCalled,'Invalid event was called');
            Assert.isTrue(validWasCalled,'Valid event was not called');
            invalidWasCalled = false;
            validWasCalled = false;

            this.input.value = '5';
            Assert.isTrue(doubleInput.validate());
            Assert.isFalse(invalidWasCalled,'Invalid event was called');
            Assert.isTrue(validWasCalled,'Valid event was not called');
            invalidWasCalled = false;
            validWasCalled = false;

            // now test inclusive
            expectedErrorKey = 'numberBelowMin'
            doubleInput.set('minInclusive',false);
            this.input.value = '5';
            Assert.isFalse(doubleInput.validate());
            Assert.isTrue(invalidWasCalled,'Invalid event was not called');
            Assert.isFalse(validWasCalled,'Valid event was called');
            invalidWasCalled = false;
            validWasCalled = false;

            this.input.value = '10';
            Assert.isTrue(doubleInput.validate());
            Assert.isFalse(invalidWasCalled,'Invalid event was called');
            Assert.isTrue(validWasCalled,'Valid event was not called');
            invalidWasCalled = false;
            validWasCalled = false;

            expectedErrorKey = 'numberAboveMax'
            doubleInput.set('maxInclusive',false);
            Assert.isFalse(doubleInput.validate());
            Assert.isTrue(invalidWasCalled,'Invalid event was not called');
            Assert.isFalse(validWasCalled,'Valid event was called');
            invalidWasCalled = false;
            validWasCalled = false;
        },
        /**
         * This will test the optional setting on a double, integer and text input
         */
        testOptionalInput:function(){
            var Assert = YAHOO.util.Assert,
            textInput = new YW.FieldValidator(this.input,{type:'text',optional:true}),
            doubleInput = new YW.FieldValidator(this.input,{type:'double',optional:true}),
            integerInput = new YW.FieldValidator(this.input,{type:'integer',optional:true});
            this.input.value = '';
            Assert.isTrue(textInput.isValid());
            Assert.isTrue(doubleInput.isValid());
            Assert.isTrue(integerInput.isValid());

            this.input.value = 'something';
            Assert.isTrue(textInput.isValid());
            Assert.isFalse(doubleInput.isValid());
            Assert.isFalse(integerInput.isValid());

            this.input.value = '32';
            Assert.isTrue(textInput.isValid());
            Assert.isTrue(doubleInput.isValid());
            Assert.isTrue(integerInput.isValid());

            this.input.value = '32.32';
            Assert.isTrue(textInput.isValid());
            Assert.isTrue(doubleInput.isValid());
            Assert.isFalse(integerInput.isValid());
        },
        /**
         * This will test to ensure the proper events are thrown
         */
        testEvents:function(){
            var emptyRtVl = false;
            var validRtVl = false;
            var validCalled = false;
            var invalidCalled = false;
            var emptyCalled = false;
            var notEmptyCalled = false;
            var Assert = YAHOO.util.Assert;
            var customInput = new YW.FieldValidator(this.input,{
                type:function(){
                    return validRtVl;
                },
                empty:function(){
                    return emptyRtVl;
                }
            });

            customInput.subscribe('inputValid',function(){
                validCalled = true;
            });
            customInput.subscribe('inputInvalid',function(){
                invalidCalled = true;
            });
            customInput.subscribe('inputEmpty',function(){
                emptyCalled = true;
            });
            customInput.subscribe('inputNotEmpty',function(){
                notEmptyCalled = true;
            });

            // ensure the invalid event is fired, and the notEmpty event is fired
            customInput.validate();
            Assert.isTrue(invalidCalled);
            Assert.isFalse(validCalled);
            Assert.isFalse(emptyCalled);
            Assert.isTrue(notEmptyCalled);

            //reset everything
            invalidCalled = false;
            validCalled = false;
            emptyCalled = false;
            notEmptyCalled = false;

            // now we ensure that empty and valid events are fired
            emptyRtVl = true;
            validRtVl = true;

            customInput.validate();
            Assert.isFalse(invalidCalled);
            Assert.isTrue(validCalled);
            Assert.isTrue(emptyCalled);
            Assert.isFalse(notEmptyCalled);
        }
    })
});