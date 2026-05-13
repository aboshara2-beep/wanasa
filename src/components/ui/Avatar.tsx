import React from 'react';
import { Image, View, StyleSheet, Text } from 'react-native';
import { Colors, Radius } from '../../constants/theme';

interface Props {
  uri?:      string;
  name?:     string;
  size?:     number;
  isOnline?: boolean;
}

export function Avatar({ uri, name, size = 40, isOnline }: Props) {
  const initials = name?.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      {uri
        ? <Image
            source={{ uri }}
            style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
          />
        : <View style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}>
            <Text style={[styles.initials, { fontSize: size * 0.35 }]}>
              {initials}
            </Text>
          </View>
      }
      {isOnline && (
        <View style={[styles.online, { width: size * 0.28, height: size * 0.28 }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: Colors.surfaceElevated,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     1,
    borderColor:     Colors.border,
  },
  initials: {
    color:      Colors.primary,
    fontWeight: '700',
  },
  online: {
    position:        'absolute',
    bottom:          0,
    right:           0,
    backgroundColor: Colors.success,
    borderRadius:    Radius.full,
    borderWidth:     2,
    borderColor:     Colors.background,
  },
});
