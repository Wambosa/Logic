"use strict":

module.exports = function(options){
    
    var self = this;
    
    self = {
    
        configure: function(destinationOptions){
            
            //give a q destination. planning on SQS
            
            return self;
        },
        
        stash: function(data){
            // figure out how to label each kind of data
            // match number
            // round & turn
            // etc
        }
    };
    
    return self;
};