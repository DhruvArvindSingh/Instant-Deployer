
import hash from '../utils/hash.js';


export default async function hash_pass(req, res, next) {
    console.log("hash_pass called");
    console.log("req.body =", req.body);
    req.body.password = await hash(req.body.password);
    next();
}