"use client"

import React, { useEffect, useState } from 'react'

function HomeTimer() {
    const [upcomingTime, setUpcomingTime] = useState("")
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const date = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
      now
    );
    const meetingTime = new Date(upcomingTime);

    // Calculate the difference in milliseconds between now and the meeting time
    const timeDifference = meetingTime - now;

    // Convert the time difference from milliseconds to seconds
    const remainingSeconds = Math.floor(timeDifference / 1000);

    // Calculate remaining time in hours, minutes, and seconds
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const remainingDays = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const remainingMinute = minutes % 60


    useEffect(()=> {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/upcoming', {
                    method: 'GET',
                });
    
                if (!response.ok) {
                    throw new Error('Failed to get meeting time');
                }
    
                const result = await response.json();
                setUpcomingTime(result.meeting_time);
                // Handle success here, e.g. display a message, redirect, etc.
            } catch (error) {
                console.error('Error fetching meeting data:', error);
                // Handle errors here, e.g. display error messages
                const responseText = await response.text();
                console.log('Actual response:', responseText);
            }
        };

        fetchData();
    }, [])
    
  return (
    <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
      <h2 className="glassmorphism max-w-[270px] rounded py-2 text-center text-base font-normal">
        {upcomingTime ? 
          `Upcoming Meeting:  ${
            remainingDays >= 1 
              ? `${remainingDays} ${remainingDays !== 1 ? 'days' : 'day'}`
              : remainingHours >= 1 
                ? `${remainingHours} ${remainingHours !== 1 ? 'hours' : 'hour'}`
                : `${remainingMinute} ${remainingMinute !== 1 ? 'minutes' : 'minute'}`
          } left`
          : "No Upcoming Meetings yet"}
      </h2>
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
        <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
      </div>
    </div>
  )
}

export default HomeTimer;