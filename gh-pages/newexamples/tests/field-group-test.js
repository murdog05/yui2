var Y = YAHOO,
YL = Y.lang,
YU = Y.util,
YE = YU.Event,
YW = Y.widget,
YD = YU.Dom;

YW.formValidatorTests = YW.formValidatorTests || {};

YL.augmentObject(YW.formValidatorTests,{
    fieldGroupTestCase:new YAHOO.tool.TestCase({
        name:'Form group test',
        /**
             * This will setup a hidden button in a hidden div on the page
             */
        setUp:function(){
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
         * Tests to ensure the group is instantiated properly.
         */
        testInitializeGroup:function(){
            var Assert = YAHOO.util.Assert,inputValid = [false,false,false], i,
            text1 = document.createElement('input'),text2 = document.createElement('input'),
            text3 = document.createElement('input'),group;

            text1.type = 'text';
            text1.id = 'test-text-input1';
            text2.type = 'text';
            text2.id = 'test-text-input2';
            text3.type = 'text';
            text3.id = 'test-text-input3';
            this.subHiddenDiv.appendChild(text1);
            this.subHiddenDiv.appendChild(text2);
            this.subHiddenDiv.appendChild(text3);

            group = new YAHOO.widget.FieldGroup('test-group', {
                fields:{
                    'test-text-input1':{
                        validation:'text'
                    },
                    'test-text-input2':{
                        validation:'double'
                    },
                    'test-text-input3':{
                        validation:'text'
                    }
                }
            });
            Assert.areEqual(3,group._validation.length);
            for (i = 0; i < group._validation.length; ++i) {
                Assert.isTrue(group._validation[i] instanceof YAHOO.widget.FieldValidator, 'Entry in validation is not a FieldValidator');
            }
        },
        /**
         * Tests to ensure the group is instantiated properly.
         */
        testGroupValid:function(){
            var Assert = YAHOO.util.Assert,
            text1 = document.createElement('input'),text2 = document.createElement('input'),
            text3 = document.createElement('input'),group;

            text1.type = 'text';
            text1.id = 'test-text-input1';
            text2.type = 'text';
            text2.id = 'test-text-input2';
            text3.type = 'text';
            text3.id = 'test-text-input3';
            this.subHiddenDiv.appendChild(text1);
            this.subHiddenDiv.appendChild(text2);
            this.subHiddenDiv.appendChild(text3);

            group = new YAHOO.widget.FieldGroup('test-group', {
                fields:{
                    'test-text-input1':{
                        validation:'text'
                    },
                    'test-text-input2':{
                        validation:'double'
                    },
                    'test-text-input3':{
                        validation:'text'
                    }
                }
            });

            Assert.isFalse(group.isValid());
            Assert.isFalse(group.validate());

            group._validation[0].get('element').value = 'test value';

            Assert.isTrue(group.isValid());
            Assert.isTrue(group.validate());

            group._validation[1].get('element').value = 'not a number';
            
            Assert.isFalse(group.isValid());
            Assert.isFalse(group.validate());

            group._validation[1].get('element').value = '32.32';

            Assert.isTrue(group.isValid());
            Assert.isTrue(group.validate());

            group._validation[0].get('element').value = '';
            
            Assert.isTrue(group.isValid());
            Assert.isTrue(group.validate());
        },
        /**
         * Test form group functionality with indicators and the form validator.
         */
        testGroupWithFormValidator: function () {
            var Assert = YAHOO.util.Assert,
            text1 = document.createElement('input'),text2 = document.createElement('input'),
            text3 = document.createElement('input'),validator;

            text1.type = 'text';
            text1.id = 'test-text-input1';
            text2.type = 'text';
            text2.id = 'test-text-input2';
            text3.type = 'text';
            text3.id = 'test-text-input3';
            this.subHiddenDiv.appendChild(text1);
            this.subHiddenDiv.appendChild(text2);
            this.subHiddenDiv.appendChild(text3);

            // create the validator with one input and one button
            validator = new YW.FormValidator(this.hiddenDiv,{
                fields:{
                    'test-group':{
                        validation:{
                            type:'any',
                            fields:{
                                'test-text-input1':{
                                    validation:'text'
                                },
                                'test-text-input2':{
                                    validation:'double'
                                },
                                'test-text-input3':{
                                    validation:'text'
                                }
                            }
                        },
                        indicators:{
                            invalid:{el:this.incorrectEl},
                            valid:{el:this.correctEl}
                        }
                    }
                }
            });
            YD.get('test-text-input1').value = '';
            YD.get('test-text-input2').value = '';
            YD.get('test-text-input3').value = '';
            Assert.isFalse(validator.isValid());
            validator.validate();
            Assert.areEqual('', this.incorrectEl.style.display);
            Assert.areEqual('none', this.correctEl.style.display);
            YD.get('test-text-input2').value = '3.2';
            Assert.isTrue(validator.isValid());
            validator.validate();
            Assert.areEqual('none', this.incorrectEl.style.display);
            Assert.areEqual('', this.correctEl.style.display);

            YD.get('test-text-input2').value = '3.2a';
            Assert.isFalse(validator.isValid());
            validator.validate();
            Assert.areEqual('', this.incorrectEl.style.display);
            Assert.areEqual('none', this.correctEl.style.display);

            YD.get('test-text-input1').value = 'valid text';
            Assert.isFalse(validator.isValid());
            validator.validate();
            Assert.areEqual('', this.incorrectEl.style.display);
            Assert.areEqual('none', this.correctEl.style.display);

            YD.get('test-text-input2').value = '';
            Assert.isTrue(validator.isValid());
            validator.validate();
            Assert.areEqual('none', this.incorrectEl.style.display);
            Assert.areEqual('', this.correctEl.style.display);
        }
    })
});