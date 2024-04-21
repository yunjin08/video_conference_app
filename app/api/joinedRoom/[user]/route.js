import prisma from "@/lib/prisma";

export const GET = async (request, { params }) => {
  if (request.method === "GET") {
    try {
      console.log(params.user);
      const accountWithMeetingRooms = await prisma.Account.findUnique({
        where: {
          user_id: params.user, // Filter by the user ID
        },
        include: {
          meeting_rooms: {
            include: {
              creator: true,
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
