import Usermodel from "../Models/User.js";
import msgModel from "../Models/Msg.js";
import chatModel from "../Models/Chat.js";
import mongoose from "mongoose";



export const create = async (req, res) => {
  const { userId } = req.body;
  const currentUserId = req.user._id;

  if (!userId) return res.status(400).json({ message: "UserId is required" });

  try {
    const userIds = [
  new mongoose.Types.ObjectId(currentUserId),
  new mongoose.Types.ObjectId(userId)
].sort((a, b) => a.toString().localeCompare(b.toString()));
;

    // Find chat with exactly these 2 users
    let chat = await chatModel.findOne({
      isGroupChat: false,
      users: { $size: 2, $all: userIds },
    }).populate("users", "-password");

    if (chat) return res.status(200).json(chat);

    // If no chat exists, create it
    const newChat = new chatModel({
      chatname: "sender",
      isGroupChat: false,
      users: userIds,
    });

    const savedChat = await newChat.save();
    const fullChat = await chatModel.findById(savedChat._id).populate("users", "-password");

    res.status(201).json(fullChat);
  } catch (err) {
    // If duplicate key occurs, fetch existing chat
    if (err.code === 11000) {
      const existingChat = await chatModel.findOne({
        isGroupChat: false,
        users: { $size: 2, $all: [currentUserId, userId] },
      }).populate("users", "-password");

      return res.status(200).json(existingChat);
    }

    console.error("Create chat error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const Fetchgroups=async(req,res)=>{
	try{
		const groups = await chatModel.find({isGroupChat: true})

		return res.json({success:true,message:"Groups fetched",groups})
	}catch(e){
		console.error("Fetchgroups error:", err);
    res.status(500).json({ success: false, message: "Fetchgroups error" });
	}
}







export const fetchchats=async(req,res)=>{
	try{
		const userId=req.user._id
		const myuserId= new mongoose.Types.ObjectId(userId)
		let chats = await chatModel.find({users:{ $in: [myuserId] }}).populate("users","-password")
		.populate("admin", "-password")
		.populate({path:'latestmsg', populate:{
			path:"sender",
			select:"name email profilepic"
		}}).sort({updatedAt:-1})


		return res.json({success:true,chats})	
	}catch(e){
		return res.status(500).json({success:false,message:"Error in fecth chats"})
	}
}

export const creategroupchat = async (req, res) => {
  try {
    const { name, users } = req.body;

    if (!name || !users) {
      return res.status(400).json({
        message: "Name and users are required",
        success: false,
      });
    }

    let usersArray = Array.isArray(users) ? users : JSON.parse(users);

    if (usersArray.length < 2) {
      return res.status(400).json({
        success: false,
        message: "At least 2 users are required to create a group",
      });
    }

    // Add logged-in user to the group
    usersArray.push(req.user._id);

    const groupChat = await chatModel.create({
      chatname: name, // use variable `name`, not string literal
      users: usersArray,
      isGroupChat: true,
      admin: req.user._id,
    });

    const fullGroupChat = await chatModel
      .findById(groupChat._id)
      .populate("users", "-password")
      .populate("admin", "-password");

    return res.status(200).json({
      success: true,
      message: "Group created successfully",
      fullGroupChat,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: e.message,
    });
  }
};




export const renamegroup=async(req,res)=>{
	try{
		const {chatId,chatname}=req.body
		const updatedchat= await chatModel.findByIdAndUpdate(
			chatId,{chatname},{new: true}
		).populate("users","-password").populate("admin","-password")
		if(!updatedchat){
		return res.status(500).json("error in rename group")}
		return res.status(200).json({success:true,message:"success",updatedchat})
			}catch(e){
		console.log(e)
		return res.status(500).json({success:false,message:"error in rename group"})
	}
}


export const Addtogroup=async(req,res)=>{
	try{
		const {chatId,userId}=req.body
		
        const theUserId = new mongoose.Types.ObjectId(userId);
		const updategroup= await chatModel.findByIdAndUpdate(
			chatId,
			{$addToSet:{users:theUserId}},
			{new:true}).populate("users","-password").populate("admin","-password")


		if(!updategroup){
			return res.status(500).json({success:false,message:"error in add to group"})
		}

		return res.status(200).json({message:"added to group",success:true,updategroup})


	}catch(e){
		console.log(e)
		return res.json({success:false,message:"error in add to group"})
	}
}

export const removefromgroup=async(req,res)=>{
	try{
		const {userId,chatId}=req.body
		
        const theUserId = new mongoose.Types.ObjectId(userId);

		const updatedgroup= await chatModel.findByIdAndUpdate(
			chatId,
			{$pull: {users:theUserId}},
			{new:true}).populate("users","-password").populate("admin","-password")

		if(!updatedgroup){
			return res.json({success:false,message:"error in remove from group"})
		}
		return res.status(200).json({success:true,message:"removed from group"})
	}catch(e){
		console.log(e)
		return res.json({success:false,message:"error in remove from group"})
	}
}
