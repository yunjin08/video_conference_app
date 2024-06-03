import prisma from "@/lib/prisma";

export const GET = async (request, {params}) => {
    if (request.method === "GET") {
      try {
        const UpcomingMeeting = await prisma.UpcomingMeeting.findMany({
          where: {
            user_id: params.id
          },
          include: {
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