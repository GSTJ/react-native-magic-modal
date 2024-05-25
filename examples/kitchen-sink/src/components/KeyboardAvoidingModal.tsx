import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { magicModal } from "react-native-magic-modal";

type KeyboardAvoidingModalProps = {
  initialText?: string;
};

const MAX_TEXT_LENGTH = 50;

const KEYBOARD_FOCUS_DELAY = Platform.OS === "android" ? 250 : 0;

const KeyboardAvoidingModal: React.FC<KeyboardAvoidingModalProps> = ({
  initialText = "",
}) => {
  const [text, setText] = useState(initialText);

  const inputRef = useRef<TextInput>(null);

  const hasText = useMemo(() => text.trim(), [text]);

  const handleSave = useCallback(() => {
    if (!hasText) {
      return;
    }

    magicModal.hide();
  }, [hasText]);

  useEffect(() => {
    // Autofocus doesn't work that great on Modals in Android
    // Focusing the ref manually here is a workaround.
    setTimeout(() => {
      inputRef.current?.focus();
    }, KEYBOARD_FOCUS_DELAY);
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
    >
      <View style={styles.container}>
        <TextInput
          ref={inputRef}
          maxLength={MAX_TEXT_LENGTH}
          onSubmitEditing={handleSave}
          returnKeyType="done"
          selectTextOnFocus
          autoCorrect={false}
          spellCheck
          enablesReturnKeyAutomatically
          autoCapitalize="words"
          style={styles.input}
          value={text}
          onChangeText={setText}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export const showKeyboardAvoidingModal = (
  props: KeyboardAvoidingModalProps,
) => {
  return magicModal.show(() => <KeyboardAvoidingModal {...props} />, {
    style: {
      justifyContent: "flex-end",
    },
  });
};

const styles = StyleSheet.create({
  close: {
    position: "absolute",
    right: 24,
    top: 20,
  },
  // eslint-disable-next-line react-native/no-color-literals
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    gap: 16,
    margin: 32,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  input: {},

  title: {
    alignSelf: "center",
  },
});
