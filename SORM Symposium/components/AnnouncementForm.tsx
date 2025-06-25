import { Colors } from '@/constants/Colors'
import { supabase } from '@/constants/supabase'
import { useColorScheme } from '@/hooks/useColorScheme'
import React from 'react'
import { Alert, Pressable, StyleSheet, View } from 'react-native'
import { ThemedText } from './ThemedText'
import ThemedTextInput from './ThemedTextInput'

import { ThemedView } from './ThemedView'

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

  // Get current color scheme for theming
  const colorScheme = useColorScheme() ?? 'light'

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
    <ThemedView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: Colors[colorScheme].tint }]}>
        <ThemedText type="title">Announcement Manager</ThemedText>
        <ThemedText 
          style={[styles.subtitleText, { color: Colors[colorScheme].text }]} 
          type="subtitle"
        >
          Create and post announcements to all users
        </ThemedText>
      </View>
      
      <View style={styles.content}>
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
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 8,
  },
  subtitleText: {
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    gap: 12,
  },
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