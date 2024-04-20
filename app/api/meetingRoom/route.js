import prisma from "@/lib/prisma";

export const POST = async (request) => {
  if (request.method === "POST") {
    try {
      const meetingRoom = await request.json();
      console.log(meetingRoom, "meeting roooms");
      for (const call of meetingRoom) {
        const existingUpcoming = await prisma.MeetingRooms.findUnique({
          where: { room_meeting: call.room_meeting },
        });
        if (!existingUpcoming) {
          await prisma.MeetingRooms.create({
            data: {
              room_meeting: call.room_meeting,
              user_id_creator: call.user_id_creator,
              meeting_title: call.meeting_title,
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
