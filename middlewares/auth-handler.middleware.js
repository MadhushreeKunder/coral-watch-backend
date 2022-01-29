const jwt = require("jsonwebtoken");

const jwt_secret = process.env['JWT_SECRET'];

const authVerify = (req, res, next) => {
   const token = req.headers.authorization;

  if (token == null ) return res.status(401).json({message: "Unauthorised access, please add the token"})
   
  try {
    const decoded = jwt.verify(token, jwt_secret);
    req.user = { userId: decoded.userId };
    return next();
  } catch (error) {
    console.log(error)
    return res.status(403).json({ message: "Invalid Token", errMessage: error.message })
  }
}

module.exports = { authVerify };
