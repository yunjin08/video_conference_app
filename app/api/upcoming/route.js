import prisma from "@/lib/prisma";

export const POST = async (request, { params }) => {
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


