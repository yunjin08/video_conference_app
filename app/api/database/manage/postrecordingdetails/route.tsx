import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { NextApiRequest } from "next";

export async function GET(request: NextApiRequest) {
    if (!request.url) {
        throw new Error('Request URL is undefined');
      }
    
      const { searchParams } = new URL(request.url);
    const recording_id = searchParams.get("recording_id");
    const user_id = searchParams.get("user_id");
    const meeting_id = searchParams.get("meeting_id");
    const recording_url = searchParams.get("recording_url");
  
    try {
      if (!user_id || !recording_id) throw new Error("Need valid ID or username");
      await sql`INSERT INTO recordings VALUES (${recording_id}, ${user_id}, ${meeting_id}, ${recording_url});`;
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  
    const pets = await sql`SELECT * FROM recordings;`;
    return NextResponse.json({ pets }, { status: 200 });
  }