import mongoose from 'mongoose';
const schema = new mongoose.Schema({ username:{type:String,required:true,unique:true,lowercase:true,trim:true}, passwordHash:{type:String,required:true} },{timestamps:{createdAt:true,updatedAt:false}});
export default mongoose.model('User',schema);
