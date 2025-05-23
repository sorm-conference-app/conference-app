import { Colors } from '@/constants/Colors';
import { Href, Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: Href & string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      style={[styles.link, { color: Colors[useColorScheme() ?? "light"].link }]}
      {...rest}
      href={href}
      onPress={async (event) => {
        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  }
})
