module.exports = {
    configure: function(complexObject){
        return {
            test: function(number){
                complexObject.uuid = number;//expect to mutate original complexObject
            }
        }
    }
};