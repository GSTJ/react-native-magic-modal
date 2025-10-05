import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TouchableWithoutFeedback,
} from 'react-native';
import { magicModal, useMagicModal } from 'react-native-magic-modal';
import { router } from 'expo-router';

// Dropdown Menu Component for Magic Modal - exact pattern from crash repo
const DropdownMenu = () => {
  const { hide } = useMagicModal();

  const handleMenuItemPress = () => {
    // This is the exact pattern that causes the crash
    hide();
    router.push('/');
  };

  const handleAnotherItemPress = () => {
    // Another pattern to test
    hide();
    router.push('/examples');
  };

  const handleDelayedNavigation = () => {
    // Test with a small delay to see if it prevents crash
    hide();
    setTimeout(() => {
      router.push('/');
    }, 100);
  };

  return (
    <TouchableWithoutFeedback onPress={() => hide()}>
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMenuItemPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Navigate Immediately (Crash)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAnotherItemPress}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Navigate to Examples (Crash)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDelayedNavigation}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Navigate with Delay (Test)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => hide()}
              activeOpacity={0.7}
            >
              <Text style={styles.menuItemText}>Just Close (Should Work)</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function CrashTest() {
  const showDropdown = () => {
    // Exact pattern from crash repo
    magicModal.disableFullWindowOverlay();
    magicModal.show(() => <DropdownMenu />, {
      swipeDirection: undefined,
      animationInTiming: 250,
      animationOutTiming: 250,
      hideBackdrop: true,
    });
  };

  const showNormalModal = () => {
    // Normal modal for comparison
    magicModal.show(() => <DropdownMenu />);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Android Crash Test</Text>
      <Text style={styles.subtitle}>
        Testing the exact pattern from issue #155
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={showDropdown}
      >
        <Text style={styles.buttonText}>Show Dropdown (Crash Pattern)</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.normalButton]}
        onPress={showNormalModal}
      >
        <Text style={styles.buttonText}>Show Normal Modal</Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        1. Tap "Show Dropdown (Crash Pattern)"{'\n'}
        2. Select "Navigate Immediately" to reproduce crash{'\n'}
        3. App should crash on production build{'\n'}
        {'\n'}
        This reproduces the exact pattern from the reported issue.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  normalButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructions: {
    marginTop: 30,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dropdownContainer: {
    position: 'absolute',
    bottom: 140,
    left: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 250,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});