import mongoose from 'mongoose';
const schema=new mongoose.Schema({user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},name:{type:String,required:true,trim:true,maxlength:80},aliases:{type:[String],default:[]},qty:{type:Number,default:0,min:0},unit:{type:String,default:'piece',maxlength:20},toBuy:{type:Boolean,default:false},updatedAt:{type:Date,default:Date.now}},{timestamps:false});
schema.index({user:1,name:1},{unique:true}); export default mongoose.model('Item',schema);
