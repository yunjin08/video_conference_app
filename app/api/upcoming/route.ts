import prisma from "@/lib/prisma";

export const POST = async (request) =>  {
    if (request.method === 'POST') {
      const upcoming = await request.json();

      try {
        const results = await Promise.all(upcoming.map(async recording => {
            return prisma.UpcomingMeeting.create({
              data: {
                upcoming_meeting_id: recording.upcoming_meeting_id,
                user_id: recording.user_id,
                meeting_time: recording.meeting_time,
                meeting_description: recording.meeting_description,
                meeting_url: recording.meeting_url
              }
            });

        }));
        return new Response(JSON.stringify(results), { status: 201 }); // Return all new recordings and skipped logs
      } catch (error) {
        console.error('Error creating or adding meetings:', error);
        return new Response("Failed to add meetings", { status: 500 });
      }
    } 
}