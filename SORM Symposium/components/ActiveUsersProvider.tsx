import { createContext, ReactNode, useState, useEffect } from "react";
import { supabase } from "@/constants/supabase";
import { Platform } from "react-native";
import type {
  RealtimePresenceJoinPayload,
  RealtimePresenceLeavePayload,
} from "@supabase/supabase-js";

const initalState: Platforms = {
  web: 0,
  ios: 0,
  android: 0,
};

const ActiveUsersContext = createContext<Platforms>(initalState);

type ActiveUsersProviderProps = {
  children: ReactNode;
};

type Platforms = Omit<
  {
    [K in Platform["OS"]]: number;
  },
  "windows" | "macos"
>;

type Payload = {
  platform: keyof Platforms;
  [key: string]: any;
};

function ActiveUsersProvider({ children }: ActiveUsersProviderProps) {
  const [users, setUsers] = useState<Platforms>(initalState);

  useEffect(() => {
    const liveCountChannel = supabase.channel("user-counter");

    function onSyncronize() {
      const state = liveCountChannel.presenceState();
      console.log(state);
    }

    function onJoin({
      key,
      newPresences,
    }: RealtimePresenceJoinPayload<Payload>) {
      const newPayload: Platforms = {
        web: 0,
        ios: 0,
        android: 0
      };
      for (const entry of newPresences) {
        newPayload[entry.platform]++;
      }

      setUsers((prev) => ({
        web: prev.web + newPayload.web,
        ios: prev.ios + newPayload.ios,
        android: prev.android + newPayload.android,
      }));
    }

    function onLeave({
      key,
      leftPresences,
    }: RealtimePresenceLeavePayload<Payload>) {
      const leftPayload: Platforms = {
        web: 0,
        ios: 0,
        android: 0
      };
      for (const entry of leftPresences) {
        leftPayload[entry.platform]++;
      }
      
      setUsers(prev => ({
        web: Math.max(prev.web - leftPayload.web, 0),
        ios: Math.max(prev.ios - leftPayload.ios, 0),
        android: Math.max(prev.android - leftPayload.android, 0)
      }))
    }

    async function onTrack() {
      const trackStatus = await liveCountChannel.track({
        platform: Platform.OS,
      });
      console.log("track: ", trackStatus);
    }

    async function onUntrack() {
      const untrackStatus = await liveCountChannel.untrack();
      console.log("untrack: ", untrackStatus);
    }

    liveCountChannel
      .on("presence", { event: "sync" }, onSyncronize)
      .on("presence", { event: "join" }, onJoin)
      .on("presence", { event: "leave" }, onLeave)
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
  );
}

export { ActiveUsersContext, ActiveUsersProvider };
