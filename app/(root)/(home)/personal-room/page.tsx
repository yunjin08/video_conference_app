"use client";

import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import MeetingCard from "@/components/MeetingCard";

const initialValues = {
  title: "",
  description: "",
  link: "",
};

interface MeetingRoom {
  meeting_description: string;
  meeting_title: string;
  meeting_url: string;
  participants: any[]; // You can define a specific type for participants if needed
  room_meeting: string;
  user_id_creator: string;
}

interface UpcomingCall {
  room_meeting: string;
  user_id_creator: string;
  meeting_title: string;
  meeting_description: string;
  meeting_url: string;
}

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();
  const [values, setValues] = useState(initialValues);
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [callDetails, setCallDetails] = useState<Call>();
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);

  const showCreateRoom = () => {
    setCreateRoom(true);
  };

  const setJoiningRoom = () => {
    setJoinRoom(true);
  };

  const createMeetingRoom = async () => {
    if (!client || !user) return;
    try {
      if (!values.title) {
        toast({
          title: "Please add a title",
        });
        return;
      }
      const id = crypto.randomUUID();
      const token = crypto.randomUUID();
      const call = client.call("default", id);

      if (!call) throw new Error("Failed to create call");

      const startsAt = new Date(Date.now()).toISOString();
      const description = values.description || "Instant Meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });

      let UpcomingCalls: UpcomingCall[] = [];
      const room_meeting = token;
      const user_id_creator = user.id || "";
      const meeting_title = values.title || "";
      const meeting_description = description;
      const meeting_url = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${id}`;
      UpcomingCalls.push({
        room_meeting,
        user_id_creator,
        meeting_title,
        meeting_description,
        meeting_url,
      });

      try {
        const response = await fetch("/api/meetingRoom", {
          method: "POST",
          body: JSON.stringify(UpcomingCalls),
        });

        if (!response.ok) {
          throw new Error("Failed to create new meeting ");
        }
        setCallDetails(call);

        if (!values.description) {
          router.push(`/meeting/${call.id}`);
        }

        toast({ title: "Meeting Created" });
      } catch (error) {
        console.error("Error creating meeting:", error);
        // Handle errors here, e.g. display error messages
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Failed to create a meeting",
      });
    }
  };

  const joinMeetingRoom = async () => {
    try {
      console.log(roomId, "roomId");
      const response = await fetch(`/api/meetingRoom/${roomId}/${user?.id}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error("Failed to join in a room");
      }
    } catch (error) {
      console.error("Error fetching meeting data:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/meetingRoom/${user?.id}`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to get meeting time");
        }

        const result = await response.json();
        console.log(result);
        setMeetingRooms(result);
        console.log(meetingRooms);
        // Handle success here, e.g. display a message, redirect, etc.
      } catch (error) {
        console.error("Error fetching meeting data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid relative w-full h-full">
      {createRoom && (
        <MeetingModal
          isOpen={createRoom}
          onClose={() => setCreateRoom(false)}
          title="Create Meeting Room"
          handleClick={createMeetingRoom}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Add a title
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => setValues({ ...values, title: e.target.value })}
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Add a description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
        </MeetingModal>
      )}
      {/* Modal for showing joining Room */}
      {joinRoom && (
        <MeetingModal
          isOpen={joinRoom}
          onClose={() => setJoinRoom(false)}
          title="Join a Meeting Room"
          handleClick={joinMeetingRoom}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Enter room id:
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) => setRoomId(e.target.value)}
            />
          </div>
        </MeetingModal>
      )}
      <section className="flex size-full flex-col gap-10 text-white">
        <h1 className="text-xl font-bold lg:text-3xl">Personal Meeting Room</h1>
        <div className="flex gap-5">
          <Button className="bg-blue-1" onClick={showCreateRoom}>
            Create a Room Meeting
          </Button>
          <Button className="bg-dark-3" onClick={setJoiningRoom}>
            Join a Room Meeting
          </Button>
        </div>
        <h1 className="text-xl font-bold lg:text-2xl">Your created meetings</h1>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {meetingRooms.length > 0 &&
            meetingRooms.map((room) => (
              <MeetingCard
                key={room?.user_id_creator}
                icon={"/icons/upcoming.svg"}
                title={room?.meeting_title}
                date={room?.meeting_description}
                handleClick={() => router.push(`${room?.meeting_url}`)}
                link={room?.room_meeting}
                buttonText="Start"
              />
            ))}
        </div>
      </section>
    </div>
  );
};

export default PersonalRoom;
