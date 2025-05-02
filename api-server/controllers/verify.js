import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const { JWT_SECRET } = process.env;
export default function verify(req, res, next) {
    console.log("verify controller");
    console.log("req.cookies = ", req.cookies);
    console.log("req.headers = ", req.headers);

    // Check for token in cookies or headers
    const cookieToken = req.cookies.token;
    const headerToken = req.headers.token;
    const token = cookieToken || headerToken;

    console.log("token = ", token);

    if (!token) {
        return res.status(401).json({ message: "Unauthorized, no token provided" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log("Token verified successfully:", decoded);
        res.status(200).json({ message: "Authorized", user: decoded });
    } catch (err) {
        console.error("Token verification failed:", err);
        res.status(401).json({ message: "Unauthorized, invalid token" });
    }
}
