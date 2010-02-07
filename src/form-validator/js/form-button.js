(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YD = YU.Dom;
    function FormButton(el,config){
        FormButton.superclass.constructor.apply(this,arguments);
    }
    Y.extend(FormButton,YU.Element,{
        /**
         * This will enable the button
         * @method enable
         */
        enable:function(){
            this.get('element').disabled = false;
        },
        /**
         * This will disable the button
         * @method disable
         */
        disable:function(){
            this.get('element').disabled = true;
        }
    });
    YAHOO.widget.FormButton = FormButton;
})();