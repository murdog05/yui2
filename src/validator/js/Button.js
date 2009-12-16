(function(){
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YD = YU.Dom;
    function Button(el,config){
        Button.superclass.constructor.apply(this,arguments);
    }
    Y.extend(Button,YAHOO.util.Element,{
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
    YAHOO.widget.FormButton = Button;
})();