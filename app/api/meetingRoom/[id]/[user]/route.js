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

export const DELETE = async (request, {params}) => {
  if (request.method === "DELETE") {
    
    const { user_id, meeting_room_id } = params.user

    try {
      // Step 1: Check if the account exists
      const account = await prisma.account.findUnique({
        where: { user_id: user_id },
        include: {
          meeting_rooms: true, // Fetch the meeting rooms the user is part of
        },
      });

      if (!account) {
        return new Response("Account not found", { status: 404 });
      }

      // Step 2: Check if the account is part of the specified meeting room
      const isParticipant = account.meeting_rooms.some(
        (room) => room.id === meeting_room_id
      );

      if (!isParticipant) {
        return new Response("Meeting room not found in account's joined rooms", { status: 404 });
      }

      // Step 3: Delete the association between the account and the meeting room
      await prisma.meetingRooms.update({
        where: { id: meeting_room_id },
        data: {
          participants: {
            disconnect: { user_id: user_id },
          },
        },
      });

      return new Response("Meeting room successfully removed from account", { status: 200 });
    } catch (error) {
      console.error("Error deleting meeting room:", error);
      return new Response("Failed to delete meeting room", { status: 500 });
    }
  }
};