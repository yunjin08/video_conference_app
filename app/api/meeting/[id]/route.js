import prisma from "@/lib/prisma";

  export const GET = async (request, {params}) => {
    if (request.method === "GET") {
      try {
        const MeetingDetails = await prisma.Participants.findMany({
          where: {
            participant_id: params.id,
          },
          include: {
            meeting: {
              include: {
                creator: true, // Include related creator details
                recordings: true // Include related recordings
              }
            } // Include related creator details
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
  