import type { PropsWithChildren } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import type { NewConfigProps } from "magic-modal";

import { Pressable, StyleSheet, Text, View } from "react-native";
import { magicModal, useMagicModal } from "magic-modal";

export type MagicModalDialogAction<T> = {
  label: string;
  value: T;
  variant?: "default" | "secondary" | "destructive";
  disabled?: boolean;
  accessibilityHint?: string;
};

export type MagicModalDialogResult<T> = { type: "action"; value: T } | { type: "cancel" };

export type MagicModalDialogProps<T> = PropsWithChildren<{
  title: string;
  description?: string;
  actions?: readonly MagicModalDialogAction<T>[];
  cancelLabel?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
}>;

export function MagicModalDialog<T>({
  actions = [],
  cancelLabel = "Cancel",
  children,
  description,
  descriptionStyle,
  style,
  title,
  titleStyle,
}: MagicModalDialogProps<T>) {
  const { hide } = useMagicModal<MagicModalDialogResult<T>>();

  return (
    <View pointerEvents="box-none" style={styles.viewport}>
      <View style={[styles.surface, style]}>
        <View style={styles.copy}>
          <Text accessibilityRole="header" role="heading" style={[styles.title, titleStyle]}>
            {title}
          </Text>
          {description ? (
            <Text style={[styles.description, descriptionStyle]}>{description}</Text>
          ) : null}
        </View>

        {children ? <View style={styles.body}>{children}</View> : null}

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel={cancelLabel}
            accessibilityRole="button"
            onPress={() => hide({ type: "cancel" })}
            style={({ pressed }) => [
              styles.action,
              styles.secondaryAction,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryActionText}>{cancelLabel}</Text>
          </Pressable>

          {actions.map((action, index) => {
            const variant = action.variant ?? "default";

            return (
              <Pressable
                accessibilityHint={action.accessibilityHint}
                accessibilityRole="button"
                accessibilityState={{ disabled: action.disabled }}
                disabled={action.disabled}
                key={`${action.label}-${index}`}
                onPress={() => hide({ type: "action", value: action.value })}
                style={({ pressed }) => [
                  styles.action,
                  actionBackground[variant],
                  pressed && styles.pressed,
                  action.disabled && styles.disabled,
                ]}
              >
                <Text style={actionText[variant]}>{action.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

export function showMagicModal<T>(props: MagicModalDialogProps<T>, config?: NewConfigProps) {
  return magicModal.show<MagicModalDialogResult<T>>(() => <MagicModalDialog {...props} />, {
    accessibilityLabel: props.title,
    backdropColor: "rgba(15, 10, 35, 0.58)",
    swipeDirection: undefined,
    ...config,
  });
}

const styles = StyleSheet.create({
  viewport: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  surface: {
    backgroundColor: "#ffffff",
    borderColor: "#e8e5f0",
    borderRadius: 24,
    borderWidth: 1,
    elevation: 12,
    maxWidth: 440,
    padding: 24,
    shadowColor: "#1b1235",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    width: "100%",
  },
  copy: {
    gap: 8,
  },
  title: {
    color: "#17111f",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  description: {
    color: "#655d70",
    fontSize: 15,
    lineHeight: 22,
  },
  body: {
    marginTop: 20,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 24,
  },
  action: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 92,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryAction: {
    backgroundColor: "#6246ea",
  },
  secondaryAction: {
    backgroundColor: "#f0edf7",
  },
  destructiveAction: {
    backgroundColor: "#b42318",
  },
  primaryActionText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryActionText: {
    color: "#2f2840",
    fontSize: 15,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.76,
  },
  disabled: {
    opacity: 0.45,
  },
});

const actionBackground = {
  default: styles.primaryAction,
  secondary: styles.secondaryAction,
  destructive: styles.destructiveAction,
} as const;

const actionText = {
  default: styles.primaryActionText,
  secondary: styles.secondaryActionText,
  destructive: styles.primaryActionText,
} as const;
