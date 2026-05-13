import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

interface Props {
  endsAt: string;
  onEnd?: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function getTimeLeft(endsAt: string) {
  const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return { h, m, s, done: diff === 0 };
}

export function CountdownTimer({ endsAt, onEnd }: Props) {
  const [time, setTime] = useState(() => getTimeLeft(endsAt));

  const tick = useCallback(() => {
    const t = getTimeLeft(endsAt);
    setTime(t);
    if (t.done) onEnd?.();
  }, [endsAt, onEnd]);

  useEffect(() => {
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <View style={styles.row}>
      {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
        <React.Fragment key={i}>
          <View style={styles.block}>
            <Text style={styles.value}>{val}</Text>
            <Text style={styles.label}>
              {['س', 'د', 'ث'][i]}
            </Text>
          </View>
          {i < 2 && <Text style={styles.colon}>:</Text>}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            4,
  },
  block: {
    alignItems: 'center',
    minWidth:   36,
  },
  value: {
    color:      Colors.primary,
    fontSize:   Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
  },
  label: {
    color:    Colors.textMuted,
    fontSize: Typography.sizes.xs,
  },
  colon: {
    color:      Colors.primary,
    fontSize:   Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: 6,
  },
});
