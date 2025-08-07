import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import type { Event } from '@/types/Events.types';
import AgendaItem from './AgendaItem';
import { convert24HrTimeToSeconds, areTimesConflicting, calculateEventOffset, calculateHeight, isCol1Location, isCol2Location, getColumnExtraHeight } from './utils';

type SpecialEventGroupProps = {
  mainEvent: Event;
  conflictingItems: Event[];
  rsvpEventIds: Set<number>;
  setRsvpEventIds: () => void;
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
  const [longestEventHeight, setLongestEventHeight] = useState(longestEvent.topic === "Break" ? 100 : 
    calculateHeight(longestEvent.start_time, longestEvent.end_time));
  const [columnWidth, setColumnWidth] = useState(0.0);
  const [longestEventExtraHeight, setLongestEventExtraHeight] = useState(0.0);
  const [otherEventsExtraHeight, setOtherEventsExtraHeight] = useState(0.0);

  // All other events that overlap with the longest event, sorted by start time
  const otherEvents = allEvents
    .filter(e => e.id !== longestEvent.id && areTimesConflicting(longestEvent.start_time, longestEvent.end_time, e.start_time, e.end_time))
    .sort((a, b) => convert24HrTimeToSeconds(a.start_time) - convert24HrTimeToSeconds(b.start_time));

  // Calculate heights for longest event, offsets, and wrapping text
  useEffect(() => {
    setLongestEventHeight(prevHeight => {
      let totalHeight = longestEvent.topic === "Break" ? 100 : 
        calculateHeight(longestEvent.start_time, longestEvent.end_time);
      
      for (const event of otherEvents) {
        if (event.id !== otherEvents[0].id) {
          const offset = calculateEventOffset(otherEvents[otherEvents.length - 1].end_time, event.start_time);
          if (event.topic === "Break") {
            totalHeight += 80;
          } else {
            totalHeight += offset;
          }
        }
      }
      return totalHeight;
    });
    // Calculate the extra height needed to account for wrapping text in the events
    let longestEventExtraHeightAdjusted = getColumnExtraHeight(otherEvents, columnWidth);
    let otherEventsExtraHeightAdjusted = getColumnExtraHeight([longestEvent], columnWidth);
    if (longestEventExtraHeightAdjusted < otherEventsExtraHeightAdjusted) {
      setLongestEventExtraHeight(0);
      setOtherEventsExtraHeight(otherEventsExtraHeightAdjusted - longestEventExtraHeightAdjusted);
    } else {
      setLongestEventExtraHeight(longestEventExtraHeightAdjusted - otherEventsExtraHeightAdjusted);
      setOtherEventsExtraHeight(0);
    }
    console.log("Event: ", longestEvent.title, "Extra Height: ", longestEventExtraHeight, "Other Events: ", otherEventsExtraHeight);
  }, [longestEvent.end_time, longestEvent.start_time, longestEvent.topic, otherEvents, columnWidth]);

  const longEventColumn = (
    <View 
      onLayout={e => setColumnWidth(e.nativeEvent.layout.width)}
      style={[
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
          height={longestEventHeight + longestEventExtraHeight}
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
              height={event.topic === "Break" ? 100 
                : calculateHeight(event.start_time, event.end_time) + otherEventsExtraHeight / otherEvents.length}
              onPress={() => onSelectEvent(event)}
            />
          </View>
        ))}
      </View>
  );

  return (
    <View style={styles.container}>
      {/* Determine column order based on room locations */}
      {isCol2Location(longestEvent.location) ||
       otherEvents.some(e => isCol1Location(e.location)) ? (
        // Put other events column on left, long event column on right
        <>
          {otherEventsColumn}
          {longEventColumn}
        </>
      ) : isCol1Location(longestEvent.location) ||
           otherEvents.some(e => isCol2Location(e.location)) ? (
        // Put long event column on left, other events column on right
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