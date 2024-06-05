import prisma from "@/lib/prisma";

export const DELETE = async (request, { params }) => {
    if (request.method === "DELETE") {
      try {
        await prisma.MeetingRooms.update({
            where: { room_meeting: params.user }, // Specify the room based on its ID
            data: {
            room_members: {
                disconnect: { user_id: params.room}, // Disconnect the specified room member
            },
            },
        });
  
        return new Response("Deleted this recording", {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error reading the database:", error);
        return new Response("Error reading the database", { status: 500 });
      }
    }
  };