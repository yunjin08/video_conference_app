import { ReactNode, Dispatch, SetStateAction } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children?: ReactNode;
  setAbleEdit: Dispatch<SetStateAction<boolean>>;
  handleClick?: () => void;
  buttonText?: string;
  ableEdit?: boolean;
  disabled?: boolean;
  image?: string;
  buttonIcon?: string;
}



const MembersModal = ({
  isOpen,
  onClose,
  title,
  className,
  setAbleEdit,
  children,
  handleClick,
  ableEdit,
  disabled,
  buttonText,
  image,
  buttonIcon,
}: MeetingModalProps) => {
  const getMessage = () => {
    if (disabled) {
      return "Contact the room owner to delete a user.";
    } else if (ableEdit) {
      return "You can edit now, click a user to delete.";
    } else {
      return "Note: You can delete a user by clicking 'Edit' and then selecting a user.";
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="gap-6 border-none bg-dark-1 px-6 py-9 text-white">
        <div className="flex flex-col gap-6 max-h-[30rem] overflow-y-auto">
          {image && (
            <div className="flex justify-center">
              <Image src={image} alt="image" width={72} height={72} />
            </div>
          )}
          <h1 className={cn(`text-3xl font-bold leading-[42px]`, className)}>
            {!disabled ? title : "Meeting Room"}
          </h1>
          {children}
          <div></div>
          <Button
            disabled={disabled}
            className="bg-blue-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={() => {
              setAbleEdit(true);
            }}
          >
            {buttonIcon && (
              <Image
                src={buttonIcon}
                alt="button icon"
                width={13}
                height={13}
              />
            )}{" "}
            &nbsp;
            {buttonText || "Schedule Meeting"}
          </Button>
          <div
            className={`pl-2 mt-[-1rem] text-[0.7rem] mb:0 ${
              disabled && "text-red-500"
            }`}
          >
            {getMessage()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
