import { ActiveUsersContext } from "@/components/ActiveUsersProvider";
import { useContext } from "react";

/**
 * A hook that returns an integer that represents the number of users currently
 * using the app.
 * @returns an integer representing the number of current active users.
 */
function useActiveUserCount() {
  return useContext(ActiveUsersContext);
}

export default useActiveUserCount;
