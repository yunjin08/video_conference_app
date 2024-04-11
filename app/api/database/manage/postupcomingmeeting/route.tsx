import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next';

export async function handler(request: NextApiRequest, response: NextApiResponse) {
    if (!request.url) {
        throw new Error('Request URL is undefined');
      }
    
      const { searchParams } = new URL(request.url);
    const upcoming_meeting_id = searchParams.get("upcoming_meeting_id");
    const user_id = searchParams.get("user_id");
    const meeting_time = searchParams.get("meeting_time");
  
    try {
      if (!user_id || !upcoming_meeting_id)
        throw new Error("Need valid ID or username");
      await sql`INSERT INTO upcoming_meetings VALUES (${upcoming_meeting_id}, ${user_id}, ${meeting_time});`;
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  
    const pets = await sql`SELECT * FROM upcoming_meetings;`;
    return NextResponse.json({ pets }, { status: 200 });
  }
  