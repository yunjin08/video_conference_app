import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const result = await sql`CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        account_type VARCHAR(255) NOT NULL
    );`;
    await sql`CREATE TABLE IF NOT EXISTS meetings (
        meeting_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        participants INT
    );`;
    await sql`CREATE TABLE IF NOT EXISTS recordings (
        recording_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        meeting_id INT REFERENCES meetings(meeting_id),
        recording_url TEXT NOT NULL
    );`;
    await sql`CREATE TABLE IF NOT EXISTS upcoming_meetings (
        upcoming_meeting_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id),
        meeting_time TIMESTAMP NOT NULL
    );`;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
