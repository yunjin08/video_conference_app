"use client";

import {
  Call,
  CallRecording,
  CallRecordingList,
} from "@stream-io/video-react-sdk";
import Loader from "./Loader";
import { useGetCalls } from "@/hooks/useGetCalls";
import MeetingCard from "./MeetingCard";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Recording {
  filename: string;
  user_id: string;
  meeting_id: string;
  recording_url: string;
  meeting: MeetingDetails;
  account: Account;
}

interface NewRecording {
  filename: string;
  user_id: string;
  meeting_id: string;
  recording_url: string;
}

interface Account {
  user_id: string;
  first_name: string;
  last_name: string;
  image: string;
  email: string;
  account_type: string;
  created_at: string;
  updated_at: string;
}

interface MeetingDetails {
  meeting_id: string;
  creator_user_id: string;
  title: string;
  start_time: string;
  end_time?: string;
  duration: string;
  num_of_participants: number;
  creator: Account;
  recordings: Recording[];
}

interface UpcomingMeeting {
  account: Account;
  upcoming_meeting_id: string;
  user_id: string;
  meeting_time: Date;
  meeting_description?: string;
  meeting_url: string;
}

interface ParticipantMeeting {
  meeting: MeetingDetails;
  meeting_id: string;
  participant_id: string;
}

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const router = useRouter();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<Boolean>(true);
  const { endedCalls, upcomingCalls, callRecordings } =
    useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);
  const [doneMeeting, setDoneMeetings] = useState<ParticipantMeeting[]>([]);
  const [upcomingMeeting, setUpcomingMeeting] = useState<UpcomingMeeting[]>([]);
  const [recordingsData, setRecordingsData] = useState<Recording[]>([]);

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

  function extractMeetingId(filename: string) {
    // Remove the prefix 'rec_default_' and the '.mp4' extension
    const cleanFilename = filename
      .replace("rec_default_", "")
      .replace(".mp4", "");

    // Now split by '_' and take the first part, which should be the meeting ID
    // This assumes the meeting ID does not contain any underscores
    const meetingId = cleanFilename.split("_")[0];

    return meetingId;
  }

  
  const deleteUpcoming = async (id: string) => {
    const hasConfirmed = confirm("Are you sure you want to delete this upcoming meeting?");
    if (hasConfirmed) {
      try {
        const response = await fetch(`/api/upcoming/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          // Check if the server responded with a non-200 HTTP status
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("Delete successful!");
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    }
  };

  const deletePrevious = async (id: string, meeting: string) => {
    const hasConfirmed = confirm("Are you sure you want to delete this previous meeting?");
    if (hasConfirmed) {
      try {
        const response = await fetch(`/api/meeting/${id}/${meeting}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          // Check if the server responded with a non-200 HTTP status
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("Delete successful!");
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    }
  };

  
  const deleteRecordings = async (id: String) => {
    const hasConfirmed = confirm("Are you sure you want to delete this recording?");
    if (hasConfirmed) {
      try {
        const response = await fetch(`/api/recordings/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          // Check if the server responded with a non-200 HTTP status
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log("Delete successful!");
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    }
  };

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

  useEffect(()=> {
    const fetchData = async () => {
      if (type === 'ended') {
        
        try {
          const response = await fetch(`/api/meeting/${user?.id}`, {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error("Failed to get meetings");
          }

          const result = await response.json();
          console.log(result);
          setDoneMeetings(result);
          setIsLoading(false);
          // Handle success here, e.g. display a message, redirect, etc.
        } catch (error) {
          console.error("Error fetching meeting data:", error);
        }
      }
      if (type === 'upcoming') {
        try {
          const response = await fetch(`/api/upcoming/meetings/${user?.id}`, {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error("Failed to get meetings");
          }

          const result = await response.json();
          setUpcomingMeeting(result);
          setIsLoading(false);
          // Handle success here, e.g. display a message, redirect, etc.
        } catch (error) {
          console.error("Error fetching meeting data:", error);
        }
      }
      if (type === 'recordings') {
        try {
          const response = await fetch(`/api/recordings/${user?.id}`, {
            method: "GET",
          });

          if (!response.ok) {
            throw new Error("Failed to get recording");
          }

          const result = await response.json();
          setRecordingsData(result);
          console.log(result, 'result');
          setIsLoading(false);
          // Handle success here, e.g. display a message, redirect, etc.
        } catch (error) {
          console.error("Error fetching recording data:", error);
        }
      }
    };
    setIsLoading(true);
    fetchData();
  }, [type, user?.id]);

  useEffect(() => {
    let newRecording: NewRecording[] = [];

    const fetchRecordings = async () => {
      if (!callRecordings || callRecordings.length === 0) {
        console.log("No call recordings available.");
        return;
      }

      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? []
      );

      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

      recordings.forEach((records) => {
        const meeting_id = extractMeetingId(records.filename);
        const user_id = callRecordings[0].currentUserId || "";
        const filename = records.filename;
        const recording_url = records.url;
        newRecording.push({ filename, user_id, meeting_id, recording_url });
      });

      try {
        const response = await fetch("/api/recordings", {
          method: "POST",
          body: JSON.stringify(newRecording),
        });

        if (!response.ok) {
          throw new Error("Failed to create meeting details");
        }

        const result = await response.json();
        setRecordings(recordings);
        // Handle success here, e.g. display a message, redirect, etc.
      } catch (error) {
        console.error("Error creating meeting data:", error);
        // Handle errors here, e.g. display error messages
      }
    };

    if (type === "recordings") {
      fetchRecordings();
    }
  }, [type, callRecordings]);
  console.log(isLoading, 'loading');
  
  if (isLoading) return <Loader />;

  const calls = getCalls();

  calls?.forEach((call)=> {
    if( type === "ended"){
      try {
        const startTime = (call as Call)?.state?.startsAt;
        const endTime = (call as Call)?.state?.endedAt;
        const callId = (call as Call)?.id;
        const callOwner = (call as Call)?.currentUserId;
        const duration = startTime && endTime ? 
        ((endTime.getTime() - startTime.getTime()) / 1000 / 60).toFixed(2) 
        : undefined;
        const numOfParticipants = (call as Call)?.state?.participantCount;

        const formattedStartTime = startTime?.toLocaleString() || undefined;
        const formattedEndTime = endTime?.toLocaleString() || undefined;
        const userData = {
          callId,
          callOwner,
          startTime,
          endTime,
          duration,
          numOfParticipants,
        };
      } catch (error) {
        
      }
  }
  })
  const noCallsMessage = getNoCallsMessage();

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {type === 'ended' && (doneMeeting.length!==0 ? doneMeeting.map((meeting)=> (
        <MeetingCard
        key={meeting.meeting_id}
        icon={"/icons/previous.svg"}
        onClickDelete={() => deletePrevious( user?.id || '', meeting.meeting_id)}
        title={meeting.meeting.title}
        date={meeting.meeting.end_time || ""}
        isPreviousMeeting={type === "ended"}
        link={`${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${
                meeting.meeting_id
              }`
        }
        buttonIcon1={undefined}
        buttonText="Start"
        handleClick={ () => router.push(`/meeting/${meeting.meeting_id}`)}
        ownerImg={meeting.meeting.creator.image}
        owner={meeting.meeting.creator.first_name}
      />
      )): (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      ))}

      {type === 'upcoming' && (upcomingMeeting.length!==0 ? upcomingMeeting.map((meeting)=> (
        <MeetingCard
        key={meeting.upcoming_meeting_id}
        icon={"/icons/upcoming.svg"}
        onClickDelete={()=>deleteUpcoming(meeting.upcoming_meeting_id)}
        title={meeting.meeting_description || ''}
        date={meeting.meeting_time}
        link={meeting.meeting_url}
        buttonIcon1={undefined}
        buttonText="Start"
        handleClick={ () => router.push(`${meeting.meeting_url}`)}
        ownerImg={meeting.account.image}
        owner={meeting.account.first_name}
      />
      )):(
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      ))}


      {type === 'recordings' && (recordingsData.length!==0 ? recordingsData.map((meeting)=> (
        <MeetingCard
        key={meeting.meeting_id}
        icon={"/icons/recordings.svg"}
        onClickDelete={() => deleteRecordings(meeting.filename)}
        title={meeting.meeting.title || ''}
        date={meeting.meeting.end_time || ''}
        link={meeting.recording_url}
        buttonIcon1="/icons/play.svg"
        buttonText="Play"
        handleClick={ () => router.push(`${meeting.recording_url}`)}
        ownerImg={meeting.account.image}
        owner={meeting.account.first_name}
      />
      )):(
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      ))}
    </div>
  );
};

export default CallList;
