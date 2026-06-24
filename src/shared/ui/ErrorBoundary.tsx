import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Text } from "../typography/Text";
import { usePaceStore } from "../store/usePaceStore";
import { translate } from "../i18n";
import type { Language } from "../i18n";
import { theme } from "../styles/theme";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Uygulama ağacını saran hata siperi: bir alt ağaç (ör. bir sheet) render'da
 * çökerse tüm uygulamayı unmount etmek yerine sade bir geri-dönüş gösterir ve
 * "tekrar dene" ile yeniden render dener. Class component zorunlu (hook yok),
 * bu yüzden dil store'dan doğrudan okunur.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    // Geliştirmede konsola düş — ileride uzak hata raporlama buraya bağlanır.
    if (__DEV__) console.error("ErrorBoundary caught:", error);
  }

  handleRetry = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    const lang = usePaceStore.getState().language as Language;
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>{translate(lang, "error.title")}</Text>
        <Text style={styles.body}>{translate(lang, "error.body")}</Text>
        <TouchableOpacity style={styles.retry} onPress={this.handleRetry} activeOpacity={0.85}>
          <Text style={styles.retryText}>{translate(lang, "error.retry")}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.bgPage,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.textPrimary,
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    color: theme.colors.textSoft,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 12,
  },
  retry: {
    paddingHorizontal: 24,
    height: 48,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.stateGood,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
