import prisma from "@/lib/prisma";

export const DELETE = async (request, { params }) => {
    if (request.method === "DELETE") {
      try {
          await prisma.Participants.delete({
            where: {
                participant_id_meeting_id: {
                  participant_id: params.id,
                  meeting_id: params.meeting
                }
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