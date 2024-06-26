import prisma from "@/lib/prisma";

export const POST = async (request) => {
  if (request.method === "POST") {
    const {
      callId,
      callOwner,
      title,
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
            title: title,
            start_time: startTime,
            end_time: endTime,
            duration: duration,
            num_of_participants: numOfParticipants,
          },
        });
        await Promise.all(userParticipant.map(async (participant) => {
          await prisma.Participants.create({
            data: {
              participant_id: participant,
              meeting_id: callId,
            }
          });
        }));
        return new Response(JSON.stringify(newMeeting), { status: 201 });
      }
    } catch (error) {
      console.error("Error creating account:", error);
      return new Response("Failed to add meeting", { status: 500 });
    }
  }
};


