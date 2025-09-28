import jwt from 'jsonwebtoken'

const Userauth = (req, res, next) => {
  try {
    // 1. Try cookie first
    let token = req.cookies.token;

    // 2. If no cookie, try Authorization header
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, please log in" });
    }

    const tokendecode = jwt.verify(token, process.env.secretword);

    if (tokendecode.id) {
      req.user = { _id: tokendecode.id };
      return next();
    } else {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  } catch (e) {
    console.error("error in middleware userauth:", e.message);
    return res.status(401).json({ success: false, message: "Auth failed" });
  }
};

export default Userauth;
