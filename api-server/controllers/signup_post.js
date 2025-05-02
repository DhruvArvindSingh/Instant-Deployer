import client from "../database/index.js";

export default async function signup_post(req, res) {
    console.log("POST /signup received");

    const { first_name, last_name, email, password } = req.body;

    try {
        // Insert user into the database
        const user = await client.query(
            "INSERT INTO users (first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
            [first_name, last_name, email, password]
        );

        console.log("Signup successful for:", user.rows[0]);

        // Redirect to the signin page
        await res.redirect("/signin");
    } catch (e) {
        console.error("An error occurred during signup:", e);

        // Respond with an error message
        res.status(500).json({ error: "Signup failed. Please try again later." });
    }
}
