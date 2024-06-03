import prisma from "@/lib/prisma";

export const GET = async (request, { params }) => {
  if (request.method === "GET") {
    try {
      const accountWithMeetingRooms = await prisma.Account.findUnique({
        where: {
          user_id: params.user,
          meeting_rooms: {
            some: {
              creator: {
                user_id: {
                  not: params.user
                }
              }
            }
          }
        },
        include: {
          meeting_rooms: {
            include: {
              creator: true,
              room_members: true,
            },
          },
        },
      });
      if (accountWithMeetingRooms) {
        return new Response(
          JSON.stringify(accountWithMeetingRooms.meeting_rooms),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        // User found but no meeting rooms are joined, return an empty array
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("Error, no meeting rooms joined:", error);
      return new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
};

export const DELETE = async (request) => {
  if (request.method === "DELETE") {
    const { user_id, meeting_room_id } = await request.json();

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
