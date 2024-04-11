import { sql } from "@vercel/postgres";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function accountDetails(req: NextApiRequest, res: NextApiResponse) {
    if (!req.url) {
        return res.status(400).json({ error: 'Request URL is undefined' });
    }

    const { searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const user_id = searchParams.get("user_id");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const account_type = searchParams.get("account_type");

    try {
        if (!user_id || !username) {
            throw new Error("Need valid ID or username");
        }
        await sql`INSERT INTO users VALUES (${user_id}, ${username}, ${email}, ${account_type});`;

        const users = await sql`SELECT * FROM users;`;
        return res.status(200).json({ users });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
