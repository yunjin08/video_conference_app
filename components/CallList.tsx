"use client";

import { Call, CallRecording, CallRecordingList} from "@stream-io/video-react-sdk";
import Loader from "./Loader";
import { useGetCalls } from "@/hooks/useGetCalls";
import MeetingCard from "./MeetingCard";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const router = useRouter();
  const { endedCalls, upcomingCalls, callRecordings, isLoading  } =
    useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return recordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  console.log(upcomingCalls)

  function extractMeetingId(filename: string) {
    // Remove the prefix 'rec_default_' and the '.mp4' extension
    const cleanFilename = filename.replace('rec_default_', '').replace('.mp4', '');

    // Now split by '_' and take the first part, which should be the meeting ID
    // This assumes the meeting ID does not contain any underscores
    const meetingId = cleanFilename.split('_')[0];

    return meetingId;
  }

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "upcoming":
        return "No Upcoming Calls";
      case "recordings":
        return "No Recordings";
      default:
        return "";
    }
  };

  useEffect(() => {
    let newRecording = []
    
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? []
      );
    
      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

      recordings.forEach((records)=> {
        const meeting_id = extractMeetingId(records.filename)
        const user_id = callRecordings[0].currentUserId
        const filename = records.filename
        const recording_url = records.url;
        newRecording.push({filename, user_id, meeting_id, recording_url})
      })
      
        try {
          const response = await fetch('/api/recordings', {
            method: 'POST',
            body: JSON.stringify(newRecording)
          });
  
          if (!response.ok) {
            throw new Error('Failed to create meeting details');
          }
  
          const result = await response.json();
          setRecordings(recordings);
          // Handle success here, e.g. display a message, redirect, etc.
        } catch (error) {
          console.error('Error creating meeting data:', error);
          // Handle errors here, e.g. display error messages
        }
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  const calls = getCalls();

  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting: Call | CallRecording) => (
          <MeetingCard
            key={(meeting as Call).id}
            icon={
              type === "ended"
                ? "/icons/previous.svg"
                : type === "upcoming"
                ? "/icons/upcoming.svg"
                : "/icons/recordings.svg"
            }
            title={
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename?.substring(0, 20) ||
              "No Description"
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time?.toLocaleString()
            }
            isPreviousMeeting={type === "ended"}
            link={
              type === "recordings"
                ? (meeting as CallRecording).url
                : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${
                    (meeting as Call).id
                  }`
            }
            buttonIcon1={type === "recordings" ? "/icons/play.svg" : undefined}
            buttonText={type === "recordings" ? "Play" : "Start"}
            handleClick={
              type === "recordings"
                ? () => router.push(`${(meeting as CallRecording).url}`)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
          />
        ))
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
};

export default CallList;
