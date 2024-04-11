import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function meetingDetails(request: NextApiRequest, response: NextApiResponse) {
    if (!request.url) {
        throw new Error('Request URL is undefined');
      }
    
      const { searchParams } = new URL(request.url);
    const meeting_id = searchParams.get("meeting_id");
    const user_id = searchParams.get("user_id");
    const start_time = searchParams.get("start_time");
    const end_time = searchParams.get("end_time");
    const participants = searchParams.get("participants");
  
    try {
      if (!user_id || !meeting_id)
        throw new Error("Need valid meeting_id or username");
      await sql`INSERT INTO meetings VALUES (${meeting_id}, ${user_id}, ${start_time}, ${end_time}, ${participants});`;
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  
    const pets = await sql`SELECT * FROM meetings;`;
    return NextResponse.json({ pets }, { status: 200 });
  }
  