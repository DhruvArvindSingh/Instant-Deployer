import jwt from "jsonwebtoken";
import client from "../database/index.js";
import dotenv from "dotenv";
dotenv.config();

const { JWT_SECRET } = process.env || "secret";

export default async function signin_post(req, res) {
    console.log("post signin received");
    const { email, password } = req.body;
    const user = await client.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);
    // console.log("user =",user);
    const user_email = user.rows[0].email;
    console.log("user_email = ", user_email);
    if (user.rows.length > 0) {
        const token = jwt.sign({ email: user_email }, JWT_SECRET);
        console.log("token = ", token);
        res.cookie("token", token);
        res.cookie("password", password);
        // res.setHeader("token",token);
        res.status(200).json({ message: "Signin successful", token: `${token}` });
    }
    else {
        console.log("user not found");
        res.status(401).json({ message: "Invalid credentials" });
    }
}