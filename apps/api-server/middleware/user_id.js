
import client from "../database/index.js";
export default async function user_id(req, res, next) {
    console.log("user_id called");
    console.log("decoded email = ", req.email);
    const result = await client.query(`
        SELECT * FROM users WHERE email = $1;
        `, [req.email]);
    if (result.rows.length == 0) {
        console.log("User not found");
        return res.status(404).json({ error: "User not found" });
    }
    const user = result.rows[0];
    req.user_id = user.id;
    next();
}