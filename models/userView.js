var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({

  UserId : {type:String,default:"",required:true},
  ViewDate : {type:Date,default:Date.now,required:true},
  ProductId : {type:String,default:"",required:true},

});

mongoose.model('userView',userSchema,'userView');