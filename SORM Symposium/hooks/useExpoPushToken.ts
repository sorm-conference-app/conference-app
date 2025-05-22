import { useContext } from "react";
import { ExpoPushTokenContext } from "@/context/ExpoPushTokenProvider";

/**
 * A custom hook to access the Expo Push Token.
 * @returns The push token, if it exists.
 */
function useExpoPushToken() {
  return useContext(ExpoPushTokenContext);
}

export default useExpoPushToken;
