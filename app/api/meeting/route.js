import prisma from "@/lib/prisma";

export const POST = async (request) => {
  if (request.method === "POST") {
    const {
      callId,
      callOwner,
      startTime,
      endTime,
      duration,
      userParticipant,
      numOfParticipants,
    } = await request.json();
    try {
      const exisitingMeeting = await prisma.MeetingDetails.findUnique({
        where: { meeting_id: callId },
      });

      if (exisitingMeeting) {
        return new Response("", { status: 201 });
      } else if (!exisitingMeeting) {
        const newMeeting = await prisma.MeetingDetails.create({
          data: {
            meeting_id: callId,
            creator_user_id: callOwner,
            start_time: startTime,
            end_time: endTime,
            duration: duration,
            participants: userParticipant,
            num_of_participants: numOfParticipants,
          },
        });
        return new Response(JSON.stringify(newMeeting), { status: 201 });
      }
    } catch (error) {
      console.error("Error creating account:", error);
      return new Response("Failed to add meeting", { status: 500 });
    }
  }
};
