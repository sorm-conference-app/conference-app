import { supabase } from '@/constants/supabase'
import React from 'react'
import { Alert, Pressable, StyleSheet, useColorScheme, View } from 'react-native'
import { ThemedText } from './ThemedText'
import ThemedTextInput from './ThemedTextInput'
import { Colors } from '@/constants/Colors'

/**
 * A form component for submitting announcements to the test_announcements table in Supabase.
 *
 * @returns JSX.Element
 */
export default function AnnouncementForm() {
  const colorScheme = useColorScheme() || 'light'
  // State for the announcement title and body
  const [title, setTitle] = React.useState('')
  const [body, setBody] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  /**
   * Handles the submission of the announcement to Supabase.
   * @async
   * @returns {Promise<void>}
   */
  async function handleSubmit() {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Error', 'Both title and body are required')
      return
    }
    setLoading(true)
    // Insert the new announcement into the test_announcements table
    const { error } = await supabase.from('test_announcements').insert({ title, body })
    setLoading(false)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('Success', 'Announcement posted!')
      setTitle('')
      setBody('')
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText>Title</ThemedText>
      <ThemedTextInput
        value={title}
        onChangeText={setTitle}
        accessibilityLabel="Announcement title input field"
        accessibilityHint="Enter the announcement title"
        placeholder="Enter announcement title"
      />
      <ThemedText>Body</ThemedText>
      <ThemedTextInput
        value={body}
        onChangeText={setBody}
        accessibilityLabel="Announcement body input field"
        accessibilityHint="Enter the announcement body"
        placeholder="Enter announcement body"
        multiline
        numberOfLines={4}
        style={{ minHeight: 80 }}
      />
      <Pressable
        style={[
          styles.addButton,
          { backgroundColor: Colors[colorScheme].adminButton },
          { borderColor: Colors[colorScheme].adminButtonText },
          { borderWidth: 1 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
        accessibilityLabel="Post announcement button"
        accessibilityHint="Press to post the announcement"
        accessibilityRole="button"
        accessibilityState={{ disabled: loading }}
      >
        <ThemedText style={[styles.addButtonText,
          { color: Colors[colorScheme].adminButtonText }
        ]}>
          {loading ? 'Posting...' : 'Post Announcement'}
        </ThemedText>
      </Pressable>
    </View>
  )
} 

const styles = StyleSheet.create({
  addButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    fontWeight: 'bold',
    fontSize: 18,
  },
})