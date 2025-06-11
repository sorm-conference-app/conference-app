import { createContext, ReactNode, useState, useEffect } from "react";
import { supabase } from "@/constants/supabase";

const ActiveUsersContext = createContext<number>(0);

type ActiveUsersProviderProps = {
  children: ReactNode;
};

function ActiveUsersProvider({ children }: ActiveUsersProviderProps) {
  const [users, setUsers] = useState<number>(0);
  
  useEffect(() => {
    const liveCountChannel = supabase.channel("user-counter");

    function onSyncronize() {
      const state = liveCountChannel.presenceState();
      setUsers(Object.keys(state).length);
    }

    function onJoin() {}

    function onLeave() {}

    async function onTrack() {
      const trackStatus = await liveCountChannel.track({});
      console.log("track: ", trackStatus);
    }

    async function onUntrack() {
      const untrackStatus = await liveCountChannel.untrack();
      console.log("untrack: ", untrackStatus);
    }

    liveCountChannel
      .on("presence", { event: "sync" }, onSyncronize)
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        console.log("join", key, newPresences);
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        console.log("leave", key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED") {
          return;
        }

        await onTrack();
      });

    return () => {
      onUntrack();
      liveCountChannel.unsubscribe();
    };
  }, []);
  
  return (
    <ActiveUsersContext.Provider value={users}>
      {children}
    </ActiveUsersContext.Provider>
  )
}

export { ActiveUsersContext, ActiveUsersProvider };