"use client";
import { useEffect, useRef } from "react";

export default function LeaderboardAd() {
  const banner = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (banner.current && !isLoaded.current) {
      isLoaded.current = true;
      
      const conf = document.createElement("script");
      conf.type = "text/javascript";
      conf.innerHTML = `atOptions = {
        'key' : 'e2f719f399a309a73f39432efb0af936',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };`;
      
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://www.highperformanceformat.com/e2f719f399a309a73f39432efb0af936/invoke.js";
      
      banner.current.append(conf);
      banner.current.append(script);
    }
  }, []);

  return (
    <div className="flex justify-center my-6 overflow-hidden min-h-[90px] w-full max-w-full bg-[var(--grey-100)] border-y border-[var(--grey-200)] py-2">
      <div ref={banner} className="mx-auto flex justify-center" />
    </div>
  );
}
