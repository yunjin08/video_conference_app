import prisma from "@/lib/prisma";

export const POST = async (request) => {
  if (request.method === "POST") {
    try {
      const upcoming = await request.json();
      for (const call of upcoming) {
        const existingUpcoming = await prisma.UpcomingMeeting.findUnique({
          where: { upcoming_meeting_id: call.upcoming_meeting_id },
        });
        if (!existingUpcoming) {
          await prisma.UpcomingMeeting.create({
            data: {
              upcoming_meeting_id: call.upcoming_meeting_id,
              user_id: call.user_id,
              meeting_time: call.meeting_time,
              meeting_description: call.meeting_description,
              meeting_url: call.meeting_url,
            },
          });
        }
      }
      return new Response("Meetings successfully added or updated", {
        status: 200,
      });
    } catch (error) {
      console.error("Error creating or adding meetings:", error);
      return new Response("Failed to add meetings", { status: 500 });
    }
  }
};

export const GET = async (request) => {
  if (request.method === "GET") {
    try {
      const now = new Date();
      const upcomingMeeting = await prisma.UpcomingMeeting.findFirst({
        where: {
          meeting_time: {
            gt: now, // greater than the current time
          },
        },
        orderBy: {
          meeting_time: "asc", // ensures the closest future meeting is selected
        },
      });

      return new Response(JSON.stringify(upcomingMeeting), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading the database:", error);
      return new Response("Error reading the database", { status: 500 });
    }
  }
};
