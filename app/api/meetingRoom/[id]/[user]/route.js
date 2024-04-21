import prisma from "@/lib/prisma";

export const PATCH = async (request, { params }) => {
  if (request.method === "PATCH") {
    try {
      const existingMeetingRoom = await prisma.MeetingRooms.findUnique({
        where: { room_meeting: params.id },
        include: { room_members: true }, // Include the existing participants
      });

      const existingParticipants =
        existingMeetingRoom?.room_members.map((member) => member.user_id) || [];

      console.log(params.user);
      const allParticipants = [...existingParticipants, params.user];

      // Update the meeting room with the combined list of participants
      const updatedMeetingRoom = await prisma.MeetingRooms.update({
        where: { room_meeting: params.id },
        data: {
          room_members: {
            connect: allParticipants.map((id) => ({ user_id: id })),
          }, // Connect the new participants
        },
      });

      console.log(
        "Meeting room updated with additional participants:",
        updatedMeetingRoom
      );

      return new Response(JSON.stringify(updatedMeetingRoom), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading the database:", error);
      return new Response("Error reading the database", { status: 500 });
    }
  }
};
