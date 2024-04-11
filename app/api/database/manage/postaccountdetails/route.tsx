import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next';

export async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (!request.url) {
        throw new Error('Request URL is undefined');
      }
    
      const { searchParams } = new URL(request.url);
  const user_id = searchParams.get("user_id");
  const username = searchParams.get("username");
  const email = searchParams.get("email");
  const account_type = searchParams.get("account_type");

  try {
    if (!user_id || !username) throw new Error("Need valid ID or username");
    await sql`INSERT INTO users VALUES (${user_id}, ${username}, ${email}, ${account_type});`;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const pets = await sql`SELECT * FROM users;`;
  return NextResponse.json({ pets }, { status: 200 });
}
