import React, { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { magicModal, useMagicModal } from "react-native-magic-modal";

type KeyboardAvoidingModalProps = {
  initialText?: string;
};

const MAX_TEXT_LENGTH = 50;

const KeyboardAvoidingModal: React.FC<KeyboardAvoidingModalProps> = ({
  initialText = "",
}) => {
  const [text, setText] = useState(initialText);
  const { hide } = useMagicModal();

  const hasText = useMemo(() => text.trim(), [text]);

  const handleSave = useCallback(() => {
    if (!hasText) {
      return;
    }

    hide();
  }, [hasText, hide]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.container}>
        <TextInput
          maxLength={MAX_TEXT_LENGTH}
          onSubmitEditing={handleSave}
          returnKeyType="done"
          selectTextOnFocus
          autoCorrect={false}
          autoFocus
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
