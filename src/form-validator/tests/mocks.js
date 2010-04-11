var mocks = {};
(function()
{
    var Y = YAHOO,
    YL = Y.lang,
    YU = Y.util,
    YD = YU.Dom
    function FieldValidatorMock(){
        this._propHash = {};
    }

    FieldValidatorMock.prototype = {
        _isEmpty:false,
        isEmpty:function(){return _isEmpty;},
        get:function(prop){
            return this._propHash[prop];
        },
        set:function(prop,val){
            this._propHash[prop] = val;
        }
    }
    Y.augment(FieldValidatorMock,YU.EventProvider);

    mocks.FieldValidatorMock = FieldValidatorMock;
})();

