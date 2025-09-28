import mongoose from "mongoose"


const chatSchema=new mongoose.Schema({
	chatname:{
		type:String,
		trim:true
	},
	isGroupChat:{
		type:Boolean,
		default:false
	},
	users:[{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},],
	latestmsg:{
		type:mongoose.Schema.Types.ObjectId,ref:"Msg"
	},
	admin:{
		type:mongoose.Schema.Types.ObjectId,ref:"User"
	}
})


chatSchema.index(
  { isGroupChat: 1, users: 1 },
  { unique: true, partialFilterExpression: { isGroupChat: false } }
);



const chatModel= mongoose.models.Chat ||  mongoose.model("Chat",chatSchema)


export default chatModel