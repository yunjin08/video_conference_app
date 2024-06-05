import prisma from "@/lib/prisma";

export const DELETE = async (request, { params }) => {
    if (request.method === "DELETE") {
      console.log(params.id, 'params');
      try {
          await prisma.MeetingDetails.delete({
          where: {
            meeting_id: params.id,
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
        const MeetingDetails = await prisma.MeetingDetails.findMany({
          where: {
            OR: [
              { creator_user_id: params.id },
              { participants: { some: { participant_id: params.id } } }
            ]
          },
          include: {
            creator: true, // Include related creator details
            recordings: true // Include related recordings
          }
        });
        return new Response(JSON.stringify(MeetingDetails), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error reading the database:", error);
        return new Response("Error reading the database", { status: 500 });
      }
    }
  };
  