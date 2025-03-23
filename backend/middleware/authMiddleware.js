// middleware/authMiddleware.js
import BlacklistedToken from "../models/blacklistedToken.model.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const checkBlacklistedToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // First verify the token is valid
    const decoded = jwt.verify(token, process.env.KEY);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Check if any blacklist token exists for this user
    const blacklistedTokens = await BlacklistedToken.find({});

    for (const blacklistedToken of blacklistedTokens) {
      try {
        // Decode the blacklist token to get the user ID
        const decodedBlacklist = jwt.verify(
          blacklistedToken.token,
          process.env.KEY
        );

        // If the user IDs match and the blacklist token is for blacklisting
        if (
          decodedBlacklist.id === decoded.id &&
          decodedBlacklist.type === "blacklist"
        ) {
          return res.status(401).json({ message: "Token is blacklisted" });
        }
      } catch (err) {
        // If token is invalid or expired, continue to next token
        continue;
      }
    }

    // Store the decoded user info
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error checking blacklist or verifying token:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default checkBlacklistedToken;
