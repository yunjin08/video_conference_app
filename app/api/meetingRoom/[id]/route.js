import prisma from "@/lib/prisma";

export const GET = async (request, { params }) => {
  if (request.method === "GET") {
    try {
      const MeetingRooms = await prisma.MeetingRooms.findMany({
        where: {
          user_id_creator: params.id, // Filter by the user ID
        },
        include: {
          creator: true,
          room_members: true,
        },
      });
      return new Response(JSON.stringify(MeetingRooms), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading the database:", error);
      return new Response("Error reading the database", { status: 500 });
    }
  }
};


export const DELETE = async (request, { params }) => {
  if (request.method === "DELETE") {
    try {
        await prisma.MeetingRooms.delete({
          where: {
            room_meeting : params.id,
          },
      });

      return new Response("Deleted this room", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading the database:", error);
      return new Response("Error reading the database", { status: 500 });
    }
  }
};
