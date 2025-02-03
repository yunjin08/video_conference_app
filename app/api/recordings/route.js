import prisma from "@/lib/prisma";

export const POST = async (request) => {
  if (request.method === "POST") {
    const recordings = await request.json();
    try {
      const results = await Promise.all(
        recordings.map(async (recording) => {
          // Check if a recording with the same meeting_id already exists
          
          const existingRecording = await prisma.Recordings.findUnique({
            where: { filename: recording.filename },
          });

          // If no existing recording is found, create a new one
          if (!existingRecording) {
            return prisma.Recordings.create({
              data: {
                filename: recording.filename,
                user_id: recording.user_id,
                meeting_id: recording.meeting_id,
                recording_url: recording.recording_url,
              },
            });
          } else {
            // Skip the creation and return some placeholder or the existing recording
            return {
              skipped: true,
              meeting_id: recording.meeting_id,
              reason: "Recording already exists.",
            };
          }
        })
      );
      return new Response(JSON.stringify(results), { status: 201 }); // Return all new recordings and skipped logs
    } catch (error) {
      console.error("Error creating or checking recordings:", error);
      return new Response("Failed to add recordings", { status: 500 });
    }
  }
};

