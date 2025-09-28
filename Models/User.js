import mongoose from "mongoose"


const Userschema=new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	email:{
		type:String,
		required:true,
		unique:true,
	},
	password:{
		type:String,
		required:true
	},
	profilepic:{
		type:String,
		required:true
	},
	isVerified:{
		type:Boolean,
		default:false
	}
})


const Usermodel= mongoose.models.User ||mongoose.model("User", Userschema)

export default Usermodel