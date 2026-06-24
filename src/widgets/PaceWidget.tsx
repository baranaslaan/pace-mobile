import { Text, VStack, HStack, ZStack, Spacer, Gauge } from "@expo/ui/swift-ui";
import {
  font,
  foregroundStyle,
  padding,
  tint,
  gaugeStyle,
  frame,
  containerBackground,
} from "@expo/ui/swift-ui/modifiers";
import { createWidget, type WidgetEnvironment } from "expo-widgets";

/**
 * Ana ekran widget'ının özellikleri. Tüm metinler JS tarafında (dil + para
 * birimine göre) hazırlanıp gönderilir — widget yalnızca gösterir.
 */
export type PaceWidgetProps = {
  /** Bugün için kalan tutar, biçimlenmiş (ör. "₺150" / "-₺40"). */
  remaining: string;
  /** "kalan" / "left" etiketi. */
  label: string;
  /** Tempo durumu (ör. "iyi gidiyor"). */
  status: string;
  /** Tempo rengi (hex). */
  color: string;
  /** Tonla harmanlanmış koyu zemin (hex). */
  bg: string;
  /** Doluluk oranı (0..1) — günlük limitin kalanı. */
  ratio: number;
  /** Orta boy alt satır: harcanan / limit. */
  spentLabel: string;
  spent: string;
  limitLabel: string;
  limit: string;
};

const PaceWidget = (props: PaceWidgetProps, env: WidgetEnvironment) => {
  "widget";
  // Tüm değerler fonksiyon içinde — 'widget' bağlamı dış kapsamı görmez.
  const remaining = props.remaining ?? "—";
  const label = props.label ?? "kalan";
  const status = props.status ?? "";
  const color = props.color ?? "#3b82f6";
  const bg = props.bg ?? "#0a0d13";
  const ratio = typeof props.ratio === "number" ? props.ratio : 0;
  const spent = props.spent ?? "";
  const spentLabel = props.spentLabel ?? "";
  const limit = props.limit ?? "";
  const limitLabel = props.limitLabel ?? "";
  const medium = env.widgetFamily === "systemMedium";

  // İnce dolu çubuk — günlük limitin kalan oranı, tempo renginde.
  const bar = (
    <Gauge
      value={ratio}
      min={0}
      max={1}
      modifiers={[gaugeStyle("linearCapacity"), tint(color), frame({ height: 8 })]}
    />
  );

  const labelText = (
    <Text
      modifiers={[
        font({ size: 13, weight: "semibold" }),
        foregroundStyle({ type: "hierarchical", style: "secondary" }),
      ]}
    >
      {label}
    </Text>
  );

  const statusText = status ? (
    <Text modifiers={[font({ size: 13, weight: "semibold" }), foregroundStyle(color)]}>
      {status}
    </Text>
  ) : null;

  const content = !medium ? (
    // Küçük: etiket, büyük tutar, çubuk, durum.
    <VStack alignment="leading" spacing={7} modifiers={[padding({ all: 16 })]}>
      {labelText}
      <Text modifiers={[font({ size: 30, weight: "bold" }), foregroundStyle(color)]}>
        {remaining}
      </Text>
      <Spacer />
      {bar}
      {statusText}
    </VStack>
  ) : (
    // Orta: üst satır etiket+durum, dev tutar, çubuk, alt satır harcanan/limit.
    <VStack alignment="leading" spacing={9} modifiers={[padding({ all: 20 })]}>
      <HStack alignment="center">
        {labelText}
        <Spacer />
        {statusText}
      </HStack>
      <Text modifiers={[font({ size: 44, weight: "bold" }), foregroundStyle(color)]}>
        {remaining}
      </Text>
      {bar}
      <HStack alignment="center">
        <Text
          modifiers={[
            font({ size: 12, weight: "medium" }),
            foregroundStyle({ type: "hierarchical", style: "secondary" }),
          ]}
        >
          {spentLabel} {spent}
        </Text>
        <Spacer />
        <Text
          modifiers={[
            font({ size: 12, weight: "medium" }),
            foregroundStyle({ type: "hierarchical", style: "secondary" }),
          ]}
        >
          {limitLabel} {limit}
        </Text>
      </HStack>
    </VStack>
  );

  return <ZStack modifiers={[containerBackground(bg, "widget")]}>{content}</ZStack>;
};

export default createWidget<PaceWidgetProps>("PaceWidget", PaceWidget);
