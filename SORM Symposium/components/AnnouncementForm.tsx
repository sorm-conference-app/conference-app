import { supabase } from '@/constants/supabase'
import React from 'react'
import { Alert, Button, View } from 'react-native'
import { ThemedText } from './ThemedText'
import ThemedTextInput from './ThemedTextInput'

/**
 * A form component for submitting announcements to the test_announcements table in Supabase.
 *
 * @returns JSX.Element
 */
export default function AnnouncementForm() {
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
        placeholder="Enter announcement title"
      />
      <ThemedText>Body</ThemedText>
      <ThemedTextInput
        value={body}
        onChangeText={setBody}
        placeholder="Enter announcement body"
        multiline
        numberOfLines={4}
        style={{ minHeight: 80 }}
      />
      <Button
        title={loading ? 'Posting...' : 'Post Announcement'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  )
} 