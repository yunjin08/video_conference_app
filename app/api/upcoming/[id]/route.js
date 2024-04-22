import prisma from "@/lib/prisma";

export const GET = async (request, { params }) => {
  if (request.method === "GET") {
    try {
      const now = new Date();
      const upcomingMeeting = await prisma.UpcomingMeeting.findFirst({
        where: {
          meeting_time: {
            user_id: params.id,
            gt: now, // greater than the current time
          },
        },
        orderBy: {
          meeting_time: "asc", // ensures the closest future meeting is selected
        },
      });

      return new Response(JSON.stringify(upcomingMeeting), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Error reading the database:", error);
      return new Response("Error reading the database", { status: 500 });
    }
  }
};
