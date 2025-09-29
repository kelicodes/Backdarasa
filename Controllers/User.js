import Usermodel from "../Models/User.js"
import chatModel from "../Models/Chat.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cloudinary from "../Config/Cloudconfig.js"

export const userRegistration=async(req,res)=>{
	try{
		const {name,email,password}=req.body
		const profileimage=req?.files?.profileimage?.[0]


			const result  = await cloudinary.uploader.upload(profileimage.path,{
				resource_type:"image"}
				)
			const profileimageurl=result.secure_url
			

		const emailexist= await Usermodel.findOne({email})
		if(emailexist){
			return res.json({message:"user already exist",success:false})
		}

		const salt=await bcrypt.genSalt(10)
		const hashedpword =await bcrypt.hash(password,salt)

		const user= new Usermodel({
			name:req.body.name,
			password:hashedpword,
			email:req.body.email,
			profilepic:profileimageurl
		})

		await user.save()

		const token = jwt.sign({id:user._id},process.env.secretword)
		res.cookie("token",token)
		return res.json({message:"user registred",success:true,user,token})

	}catch(e){
		console.log(e.message)
		return res.json({message:"Error in user reg",success:false})
	}
}



export const userRegistration202 = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const profileimage = req?.files?.profileimage?.[0];

    // 1️⃣ Upload profile image
    const result = await cloudinary.uploader.upload(profileimage.path, {
      resource_type: "image",
    });
    const profileimageurl = result.secure_url;

    // 2️⃣ Check if email exists
    const emailexist = await Usermodel.findOne({ email });
    if (emailexist) {
      return res.json({ message: "User already exists", success: false });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedpword = await bcrypt.hash(password, salt);

    // 4️⃣ Create the user
    const user = new Usermodel({
      name,
      password: hashedpword,
      email,
      profilepic: profileimageurl,
    });
    await user.save();

    // 5️⃣ Automatically create private chats with all existing users (two-step safe)
    const otherUsers = await Usermodel.find({ _id: { $ne: user._id } });
    const chatPromises = otherUsers.map(async (other) => {
      const userIds = [user._id.toString(), other._id.toString()].sort();

      // Check if chat already exists
      const existingChat = await chatModel.findOne({
        isGroupChat: false,
        users: { $all: userIds, $size: 2 },
      });

      // Create chat only if it doesn't exist
      if (!existingChat) {
        await chatModel.create({
          chatname: "sender",
          isGroupChat: false,
          users: userIds,
        });
      }
    });
    await Promise.all(chatPromises);

    // 6️⃣ Create JWT token
    const token = jwt.sign({ id: user._id }, process.env.secretword);

    // 7️⃣ Send response
    res.cookie("token", token, { httpOnly: true });
    return res.json({ message: "User registered", success: true, user, token });
  } catch (e) {
    console.log(e.message);
    return res.json({ message: "Error in user registration", success: false });
  }
};

export const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Usermodel.findOne({ email });

    if (!user) {
      return res.json({ message: "email not reg", success: false });
    }

    const pwordcompare = await bcrypt.compare(password, user.password);
    if (pwordcompare) {
      const token = jwt.sign({ id: user._id }, process.env.secretword);

      res.cookie("token", token);

      // sanitize user (don’t send password hash)
      const safeUser = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilepic: user.profilepic, // ✅ add only fields you need
      };

      return res.json({
        success: true,
        message: "user logged in",
        user: safeUser,
        token,
      });
    } else {
      return res.json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (e) {
    console.log("error in login controller", e.message);
    return res.json({ message: "error on login", success: false });
  }
};






export const Logout=async(req,res)=>{
	try{
		res.clearCookie("token")
		return res.json({message:"logged out successfully",success:true})
	}catch(e){
		console.log("error in loout")
		return res.json({message:"Error in logout controller",success:false})
	}
}


export const Fetchusers=async(req,res)=>{
	try{
		const users=await Usermodel.find()
		return res.json({success:true,message:"users feched",users})
	}catch(e){
		console.log("error in Fetchusers")
		return res.json({message:"Error in Fetchusers controller",success:false})
	}
}

