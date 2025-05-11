import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '../../.env' });

const { JWT_SECRET } = process.env;
export default function verify(req, res, next) {
    const token = req.cookies.token || req.headers.token;
    console.log("token = ", token);
    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                console.log("Error verifying token", err);
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
