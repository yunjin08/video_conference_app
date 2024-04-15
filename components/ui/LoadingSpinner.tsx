import Image from "next/image";
import React from "react";

function LoadingSpinner() {
  return (
    <div className="flex-center z-50 w-[30rem] h-[20rem] absolute flex items-center justify-center">
      <Image
        src="/icons/loading-circle.svg"
        alt="Loading"
        width={50}
        height={50}
      />
    </div>
  );
}

export default LoadingSpinner;
