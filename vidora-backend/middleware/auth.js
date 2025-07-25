// middleware/authMiddleware.js
// middleware/auth.js
const authenticate = (req, res, next) => {
  try {
    // Your authentication logic here
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    
    // Verify token (example using JWT)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticate; // ES Modules export