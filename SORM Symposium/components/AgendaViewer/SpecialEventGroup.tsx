import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { Event } from '@/types/Events.types';
import AgendaItem from './AgendaItem';
import { convert24HrTimeToSeconds, areTimesConflicting, calculateEventOffset } from './utils';

type SpecialEventGroupProps = {
  mainEvent: Event;
  conflictingItems: Event[];
  rsvpEventIds: Set<number>;
  setRsvpEventIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  onSelectEvent: (event: Event) => void;
};

export function SpecialEventGroup({
  mainEvent,
  conflictingItems,
  rsvpEventIds,
  setRsvpEventIds,
  onSelectEvent,
}: SpecialEventGroupProps) {
  // Find the longest event in the group
  const allEvents = [mainEvent, ...conflictingItems];
  const longestEvent = allEvents.reduce((longest, curr) => {
    const currDuration = convert24HrTimeToSeconds(curr.end_time) - convert24HrTimeToSeconds(curr.start_time);
    const longestDuration = convert24HrTimeToSeconds(longest.end_time) - convert24HrTimeToSeconds(longest.start_time);
    return currDuration > longestDuration ? curr : longest;
  }, mainEvent);

  const COL_1_LOCATION = "Room 1";
  const COL_2_LOCATION = "Room 2";

  // All other events that overlap with the longest event, sorted by start time
  const otherEvents = allEvents
    .filter(e => e.id !== longestEvent.id && areTimesConflicting(longestEvent.start_time, longestEvent.end_time, e.start_time, e.end_time))
    .sort((a, b) => convert24HrTimeToSeconds(a.start_time) - convert24HrTimeToSeconds(b.start_time));

  const longEventColumn = (
    <View style={[
        styles.eventWrapper,
        {
          marginTop: otherEvents.length > 0 ? calculateEventOffset(
            otherEvents[0].start_time,
            longestEvent.start_time
          ) : 0,
        }
      ]}>
        <AgendaItem
          id={longestEvent.id}
          title={longestEvent.title}
          startTime={longestEvent.start_time}
          endTime={longestEvent.end_time}
          location={longestEvent.location}
          isDeleted={longestEvent.is_deleted}
          hasRSVP={rsvpEventIds.has(longestEvent.id)}
          setRsvpEventIds={setRsvpEventIds}
          topic={longestEvent.topic}
          onPress={() => onSelectEvent(longestEvent)}
        />
      </View>
  );

  const otherEventsColumn = (
    <View style={styles.eventWrapper}>
        {otherEvents.map((event, index) => (
          <View
            key={event.id}
            style={{
              marginTop: index === 0 
                ? calculateEventOffset(longestEvent.start_time, event.start_time)
                : calculateEventOffset(otherEvents[index - 1].end_time, event.start_time),
            }}
          >
            <AgendaItem
              id={event.id}
              title={event.title}
              startTime={event.start_time}
              endTime={event.end_time}
              location={event.location}
              isDeleted={event.is_deleted}
              hasRSVP={rsvpEventIds.has(event.id)}
              setRsvpEventIds={setRsvpEventIds}
              topic={event.topic}
              onPress={() => onSelectEvent(event)}
            />
          </View>
        ))}
      </View>
  );

  return (
    <View style={styles.container}>
      {/* Determine column order based on room locations */}
      {longestEvent.location === COL_1_LOCATION || 
       otherEvents.some(e => e.location === COL_1_LOCATION) ? (
        // Room 1 events exist - put other events column on left, long event column on right
        <>
          {otherEventsColumn}
          {longEventColumn}
        </>
      ) : longestEvent.location === COL_2_LOCATION || 
           otherEvents.some(e => e.location === COL_2_LOCATION) ? (
        // Room 2 events exist - put long event column on left, other events column on right
        <>
          {longEventColumn}
          {otherEventsColumn}
        </>
      ) : (
        // No room matches - use default order (long event on left)
        <>
          {longEventColumn}
          {otherEventsColumn}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 16,
    flex: 1,
  },
  eventWrapper: {
    flex: 1,
    minWidth: 0, // Allows flex items to shrink below their content size
  },
}); 