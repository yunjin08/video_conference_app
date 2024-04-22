"use client";

import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import MeetingModal from "@/components/MeetingModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useCallback, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import MeetingCard from "@/components/MeetingCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import MembersModal from "@/components/MembersModal";
import { cn } from "@/lib/utils";

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
  creator: Creator;
  room_members: Creator[];
}

interface UpcomingCall {
  room_meeting: string;
  user_id_creator: string;
  meeting_title: string;
  meeting_description: string;
  meeting_url: string;
}

interface Creator {
  user_id: string;
  first_name: String;
  last_name: String;
  image: string;
  email: String;
  account_type: String;
  created_at: Date;
  updated_at: Date;
}

interface JoinedRoom {
  creator: Creator;
  room_meeting: string;
  user_id_creator: string;
  meeting_title: string;
  meeting_description: string;
  meeting_url: string;
  room_members: Creator[];
}

const PersonalRoom = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [ableEdit, setAbleEdit] = useState(false);
  const [showMembers, setShowMembers] = useState<boolean>(false);
  const [roomNumber, setRoomNumber] = useState("");
  const [roomOwner, setRoomOwner] = useState("");
  const [meetingState, setMeetingState] = useState<
    "createRoom" | "joinRoom" | undefined
  >(undefined);
  const [members, setMembers] = useState<Creator[]>([]);
  const [createRoom, setCreateRoom] = useState(false);
  const [joinRoom, setJoinRoom] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [callDetails, setCallDetails] = useState<Call>();
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>([]);
  const [joinedRoom, setJoinedRooms] = useState<JoinedRoom[]>([]);

  const showCreateRoom = () => {
    setMeetingState("createRoom");
  };

  const deleteUser = async (member: String, room: String) => {
    const hasConfirmed = confirm("Are you sure you want to delete this user?");
    if (hasConfirmed) {
      try {
        const response = await fetch(`/api/meetingRoom/${member}/${room}`, {
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

  const setJoiningRoom = () => {
    setMeetingState("joinRoom");
  };

  const createMeetingRoom = async () => {
    setLoading(true);
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
      const meeting_url = `meeting/${id}`;
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
        await fetchData();

        if (!values.description) {
          router.push(`/meeting/${call.id}`);
        }

        toast({ title: "Meeting Created, select exit to stop or continue." });
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
    setLoading(false);
    setMeetingState(undefined);
  };

  const fetchRoomsJoined = useCallback(async () => {
    try {
      const response = await fetch(`/api/joinedRoom/${user?.id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("You have not joined any room");
      }

      const result = await response.json();
      setJoinedRooms(result);
      console.log(result, "resukt");
      // Handle success here, e.g. display a message, redirect, etc.
    } catch (error) {
      console.error("Error fetching meeting data:", error);
    }
  }, [user?.id]);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/meetingRoom/${user?.id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to get meeting time");
      }
      const result = await response.json();
      setMeetingRooms(result);
    } catch (error) {
      console.error("Error fetching meeting data:", error);
    }
  }, [user?.id]);

  const joinMeetingRoom = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/meetingRoom/${roomId}/${user?.id}`, {
        method: "PATCH",
      });
      await fetchRoomsJoined();
      setMeetingState(undefined);
      toast({
        title: "Joined a Meeting, press exit to stop or continue adding.",
      });
      if (!response.ok) {
        throw new Error("Failed to join in a room");
      }
    } catch (error) {
      toast({ title: "Error, can not join the same meeting" });
      console.error("Error fetching meeting data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    fetchRoomsJoined();
  }, [fetchData, fetchRoomsJoined]);

  console.log(members, "member");

  return (
    <div className="grid relative w-full h-full">
      {/* Members Modal */}
      <MembersModal
        isOpen={showMembers === true}
        onClose={() => {
          setAbleEdit(false);
          setShowMembers(false);
        }}
        title="Edit Meeting Room"
        disabled={user?.id !== roomOwner}
        className={`${loading && "opacity-95"}`}
        buttonText="Edit Meeting Room"
        setAbleEdit={setAbleEdit}
        handleClick={() => {
          setAbleEdit(true);
        }}
      >
        {loading && <LoadingSpinner />}
        <h1 className="text-xl font-bold"> Members</h1>
        {members.length > 0 && (
          <div className="flex  flex-col">
            {members.map((member, index) => (
              <div
                key={member.user_id}
                className={`flex pl-[2rem] items-center h-full space-x-4 pb-5  ${
                  ableEdit && "hover:text-blue-1 cursor-pointer"
                } `}
                onClick={() => {
                  ableEdit && deleteUser(member.user_id, roomNumber);
                }}
              >
                <Image
                  src={member.image}
                  alt="attendee"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <h2 className="text-xl font-normal">
                  {member.first_name} {member.last_name}
                </h2>
              </div>
            ))}
          </div>
        )}
      </MembersModal>
      <MeetingModal
        isOpen={meetingState === "createRoom"}
        onClose={() => setMeetingState(undefined)}
        title="Create Meeting Room"
        className={`${loading && "opacity-95"}`}
        buttonText="Create Room"
        handleClick={createMeetingRoom}
      >
        {loading && <LoadingSpinner />}
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
      {/* Modal for showing joining Room */}
      <MeetingModal
        isOpen={meetingState === "joinRoom"}
        onClose={() => setMeetingState(undefined)}
        buttonText="Join Room"
        title="Join a Meeting Room"
        className={`${loading && "opacity-95"}`}
        handleClick={joinMeetingRoom}
      >
        {loading && <LoadingSpinner />}
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
        {meetingRooms.length > 0 ? (
          <>
            <h1 className="text-xl font-bold lg:text-[1.35rem]">
              Your Created Meetings
            </h1>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {meetingRooms.map((room) => (
                <MeetingCard
                  images={room?.room_members}
                  key={room?.room_meeting}
                  icon={"/icons/upcoming.svg"}
                  setRoomNumber={setRoomNumber}
                  setRoomOwner={setRoomOwner}
                  setMembers={setMembers}
                  setShowMembers={setShowMembers}
                  owner={room?.creator.user_id}
                  ownerImg={room.creator.image}
                  title={room?.meeting_title}
                  date={room?.meeting_description}
                  handleClick={() => router.push(`${room?.meeting_url}`)}
                  link={room?.room_meeting}
                  buttonText="Start"
                />
              ))}{" "}
            </div>
          </>
        ) : (
          <h1 className={`text-xl font-bold lg:text-[1.35rem]`}>
            {" "}
            {joinedRoom.length === 0 && "Create a Meeting"}
          </h1>
        )}
        {joinedRoom.length > 0 ? (
          <>
            <h1
              className={`text-xl font-bold lg:text-[1.35rem] ${
                meetingRooms.length > 0 && "mt-[1rem]"
              }`}
            >
              Your Joined Room Meetings
            </h1>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {joinedRoom.map((room) => (
                <MeetingCard
                  images={room?.room_members}
                  key={room?.room_meeting}
                  ownerImg={room.creator.image}
                  setRoomNumber={setRoomNumber}
                  setRoomOwner={setRoomOwner}
                  setMembers={setMembers}
                  setShowMembers={setShowMembers}
                  owner={room?.creator.user_id}
                  icon={"/icons/upcoming.svg"}
                  title={room?.meeting_title}
                  date={room?.meeting_description}
                  handleClick={() => router.push(`${room?.meeting_url}`)}
                  link={room?.room_meeting}
                  buttonText="Start"
                />
              ))}{" "}
            </div>
          </>
        ) : (
          <h1
            className={`text-xl font-bold lg:text-[1.35rem] ${
              meetingRooms.length === 0 && "mt-[15rem]"
            }`}
          >
            {" "}
            Join a Meeting
          </h1>
        )}
      </section>
    </div>
  );
};

export default PersonalRoom;
