"use client";

import Image from "next/image";
import React, { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MeetingCardProps {
  title: string;
  date: string | Date;
  setMembers?: Dispatch<SetStateAction<Creator[]>>;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  setRoomOwner?: Dispatch<SetStateAction<string>>;
  buttonText?: string;
  onClickDelete: () => Promise<void>; 
  setShowMembers?: Dispatch<SetStateAction<boolean>>;
  images?: Creator[];
  owner?: string;
  setRoomNumber?: Dispatch<SetStateAction<string>>;
  ownerImg?: string;
  handleClick: () => void;
  link: string;
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

const MeetingCard = ({
  icon,
  title,
  date,
  ownerImg,
  setMembers,
  setRoomOwner,
  onClickDelete,
  owner,
  isPreviousMeeting,
  buttonIcon1,
  setShowMembers,
  handleClick,
  setRoomNumber,
  images,
  link,
  buttonText,
}: MeetingCardProps) => {
  const { toast } = useToast();

  let formattedTime = '';

  console.log(date,'date');

  try {
    formattedTime = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error("Invalid date value:", date);
  }


  const setMemberInfo = (images: Creator[]) => {
    setRoomOwner?.(owner || "");
    setRoomNumber?.(link);
    setShowMembers?.(true);
    setMembers?.(images);
  };
  return (
    <section className="flex relative min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]">
      {ownerImg && (
        <Image
          src={ownerImg || ""}
          alt="attendees"
          width={40}
          height={40}
          className="rounded-full top-[1rem] absolute right-[2rem]"
        />
      )}
      <article className="flex flex-col gap-5">
        <Image src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-base font-normal">{formattedTime}</p>
          </div>
        </div>
      </article>
      <article className={cn("flex justify-center relative", {})}>
        <div
          className="relative flex w-full max-sm:hidden cursor-pointer"
          onClick={() => {
            if (images) {
              setMemberInfo(images);
            }
          }}
        >
          {images?.slice(0, 5).map((img, index) => (
            <Image
              key={index}
              src={img.image}
              alt="attendees"
              width={1240}
              height={1240}
              className={cn("rounded-full size-[2.5rem]", { absolute: index > 0 })}
              style={{ top: 0, left: index * 28 }}
            />
          ))}
          {images && images.length === 0 && (
            <div className="absolute bottom-0  text-[1.1rem] font-medium">
              No members
            </div>
          )}
          {images && images.length > 5 && (
            <div className="flex-center absolute left-[136px] size-10 rounded-full border-[5px] border-dark-3 bg-dark-4">
              +5
            </div>
          )}
        </div>
        {isPreviousMeeting && (
          <Button onClick={onClickDelete} className="rounded bg-red-500 px-4">
            Delete
          </Button>)
        }
        {!isPreviousMeeting && (
          <div className="flex gap-2">
              <Button onClick={onClickDelete} className="rounded bg-red-500 px-4">
              Del
            </Button>
            <Button onClick={handleClick} className="rounded bg-blue-1 px-6">
              {buttonIcon1 && (
                <Image src={buttonIcon1} alt="feature" width={20} height={20} />
              )}
              &nbsp; {buttonText}
            </Button>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link Copied",
                });
              }}
              className="bg-dark-4 px-6"
            >
              <Image
                src="/icons/copy.svg"
                alt="feature"
                width={20}
                height={20}
              />
              &nbsp; Copy ID
            </Button>
          </div>
        )}
      </article>
    </section>
  );
};

export default MeetingCard;
