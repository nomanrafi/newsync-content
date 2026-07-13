"use client";
import { useEffect, useRef } from "react";

export default function NativeAd() {
  const banner = useRef<HTMLDivElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (banner.current && !isLoaded.current) {
      isLoaded.current = true;
      
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.dataset.cfasync = "false";
      script.src = "https://pl30350357.effectivecpmnetwork.com/7927365b49a9a42e0f0867a5c1bdfe77/invoke.js";
      
      const div = document.createElement("div");
      div.id = "container-7927365b49a9a42e0f0867a5c1bdfe77";

      banner.current.append(script);
      banner.current.append(div);
    }
  }, []);

  return (
    <div className="my-8 w-full">
      <div ref={banner} className="mx-auto flex justify-center" />
    </div>
  );
}
