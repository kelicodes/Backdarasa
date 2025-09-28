import Usermodel from "../Models/User.js"
import msgModel from '../Models/Msg.js'
import chatModel from "../Models/Chat.js"
import {io} from "../server.js"



export const sendmsg=async(req,res)=>{
	try{
		const {content,chatId}=req.body
		if(!content || ! chatId){
			return res.status(201).json({success:false,message:"error in sendmsg"})
		}

		const newmsg= await msgModel.create({
			sender: req.user._id,
			content:content,
			chat:chatId
		})


		const message=await msgModel.findById(newmsg._id).populate('sender',"name email profilepic").populate({
			path:"chat", populate:{path:"users", select: "name email profilepic"}
		})

		await chatModel.findByIdAndUpdate(chatId,{latestmsg: message._id})


		if(message.chat && message.chat.users){
			message.chat.users.forEach((user)=>{
				if(user._id.toString() === req.user._id){
					return
				}
				io.to(user._id.toString()).emit('message received',message)
			})
		}
		return res.status(201).json({success:true,message})
	}catch(e){
		console.log(e)
		return res.status(201).json({success:false,message:"error in sendmsg"})

	}
}


export const allmsg=async(req,res)=>{
	try{
		const {chatId}=req.params
		const messages=await msgModel.find({chat:chatId}).populate('sender', "name email profilepic").populate('chat').sort({createdAt:1})
		console.log(messages)
		return res.json({success:true,messages})
	}catch(e){
		console.log(e)
		return res.status(201).json({success:false,message:"error in allmsg"})
	}
}



