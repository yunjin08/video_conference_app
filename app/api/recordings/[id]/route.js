import prisma from "@/lib/prisma";

export const DELETE = async (request, { params }) => {
    if (request.method === "DELETE") {
      try {
          await prisma.Recordings.delete({
          where: {
            filename: params.id,
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
  
  export const GET = async (request, {params}) => {
    if (request.method === "GET") {
      try {
        const UpcomingMeeting = await prisma.Recordings.findMany({
          where: {
            OR: [
              { user_id: params.id },
              {
                meeting: {
                  participants: {
                    some: { participant_id: params.id }
                  }
                }
              },
            ]
          },
          include: {
            meeting: true,
            account: true,
          }
        });
        return new Response(JSON.stringify(UpcomingMeeting), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error reading the database:", error);
        return new Response("Error reading the database", { status: 500 });
      }
    }
  };
  