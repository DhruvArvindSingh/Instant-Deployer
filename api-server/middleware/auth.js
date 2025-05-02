import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const { JWT_SECRET } = process.env;
export default function verify(req, res, next) {
    const token = req.cookies.token;
    console.log("token = ", token);
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).json({ message: "Unauthorized" });
            } else {
                req.email = decoded.email;
                next();
            }
        });
    } else {
        res.status(401).json({ message: "Unauthorized, no token provided" });
    }
}
