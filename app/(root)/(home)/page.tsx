import MeetingTypeList from "@/components/MeetingTypeList";
import React from "react";
import HomeTimer from "@/components/HomeTimer";

const Home = () => {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <HomeTimer/>
      <MeetingTypeList />
    </section>
  );
};

export default Home;
