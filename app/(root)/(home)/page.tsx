import MeetingTypeList from "@/components/MeetingTypeList";
import React from "react";
import HomeTimer from "@/components/HomeTimer";

const Home = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <div className="h-[300px] w-full rounded-[20px] bg-hero bg-cover">
        <HomeTimer/>
      </div>
      <MeetingTypeList />
    </section>
  );
};

export default Home;
