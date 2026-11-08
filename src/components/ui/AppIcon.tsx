import React from 'react';
import { StyleSheet, View } from 'react-native';

export type IconName =
  | 'home'
  | 'layers'
  | 'history'
  | 'settings'
  | 'bolt'
  | 'speed'
  | 'memory'
  | 'battery_full'
  | 'thermostat'
  | 'timer'
  | 'warning'
  | 'download'
  | 'upload_file'
  | 'search'
  | 'refresh'
  | 'close'
  | 'delete'
  | 'info'
  | 'check'
  | 'share'
  | 'arrow_back';

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  weight?: 'outlined' | 'filled';
}

const STROKE = 1.8;

export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size = 24,
  color = '#FFFFFF',
  weight = 'outlined',
}) => {
  const scale = size / 24;

  const renderIcon = () => {
    switch (name) {
      case 'home':
        return (
          <>
            {/* Roof Peak */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderTopWidth: STROKE,
                  borderLeftWidth: STROKE,
                  width: 14,
                  height: 14,
                  transform: [{ rotate: '45deg' }],
                  top: 4,
                  left: 5,
                  position: 'absolute',
                },
              ]}
            />
            {/* House Body */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderLeftWidth: STROKE,
                  borderRightWidth: STROKE,
                  borderBottomWidth: STROKE,
                  width: 13,
                  height: 10,
                  top: 11,
                  left: 5.5,
                  position: 'absolute',
                  backgroundColor: weight === 'filled' ? color : 'transparent',
                },
              ]}
            />
          </>
        );

      case 'layers':
        return (
          <>
            {/* Top rhombus */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  width: 13,
                  height: 13,
                  transform: [{ rotate: '45deg' }, { scaleY: 0.55 }],
                  top: 2,
                  left: 5.5,
                  position: 'absolute',
                  backgroundColor: weight === 'filled' ? color : 'transparent',
                },
              ]}
            />
            {/* Middle layer */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderBottomWidth: STROKE,
                  borderRightWidth: STROKE,
                  width: 13,
                  height: 13,
                  transform: [{ rotate: '45deg' }, { scaleY: 0.55 }],
                  top: 6,
                  left: 5.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Bottom layer */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderBottomWidth: STROKE,
                  borderRightWidth: STROKE,
                  width: 13,
                  height: 13,
                  transform: [{ rotate: '45deg' }, { scaleY: 0.55 }],
                  top: 10,
                  left: 5.5,
                  position: 'absolute',
                },
              ]}
            />
          </>
        );

      case 'history':
        return (
          <>
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 10,
                  width: 19,
                  height: 19,
                  top: 2.5,
                  left: 2.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Vertical hand */}
            <View
              style={{
                backgroundColor: color,
                width: STROKE,
                height: 6,
                top: 6,
                left: 11.1,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            {/* Horizontal hand */}
            <View
              style={{
                backgroundColor: color,
                width: 5,
                height: STROKE,
                top: 11.1,
                left: 11.1,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
          </>
        );

      case 'settings':
        return (
          <>
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 10,
                  width: 17,
                  height: 17,
                  top: 3.5,
                  left: 3.5,
                  position: 'absolute',
                },
              ]}
            />
            <View
              style={{
                borderColor: color,
                borderWidth: STROKE,
                borderRadius: 4,
                width: 7,
                height: 7,
                top: 8.5,
                left: 8.5,
                position: 'absolute',
              }}
            />
            {/* Gear notches */}
            <View style={{ backgroundColor: color, width: STROKE, height: 3, top: 1.5, left: 11.1, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: STROKE, height: 3, bottom: 1.5, left: 11.1, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: 3, height: STROKE, top: 11.1, left: 1.5, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: 3, height: STROKE, top: 11.1, right: 1.5, position: 'absolute' }} />
          </>
        );

      case 'bolt':
        return (
          <>
            {/* Top segment */}
            <View
              style={{
                backgroundColor: color,
                width: STROKE * 1.5,
                height: 10,
                transform: [{ rotate: '25deg' }],
                top: 2.5,
                left: 12.5,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            {/* Cross notch */}
            <View
              style={{
                backgroundColor: color,
                width: 8,
                height: STROKE * 1.2,
                top: 10.5,
                left: 8,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            {/* Bottom segment */}
            <View
              style={{
                backgroundColor: color,
                width: STROKE * 1.5,
                height: 10,
                transform: [{ rotate: '25deg' }],
                top: 10.5,
                left: 9,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
          </>
        );

      case 'speed':
        return (
          <>
            {/* Speedometer gauge arc */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderTopWidth: STROKE,
                  borderLeftWidth: STROKE,
                  borderRightWidth: STROKE,
                  borderBottomWidth: 0,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  width: 20,
                  height: 12,
                  top: 6,
                  left: 2,
                  position: 'absolute',
                },
              ]}
            />
            {/* Center dial needle */}
            <View
              style={{
                backgroundColor: color,
                width: 6,
                height: STROKE,
                transform: [{ rotate: '-35deg' }],
                top: 12,
                left: 11,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            <View
              style={{
                backgroundColor: color,
                width: 4,
                height: 4,
                borderRadius: 2,
                top: 14,
                left: 10,
                position: 'absolute',
              }}
            />
          </>
        );

      case 'memory':
        return (
          <>
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 3,
                  width: 14,
                  height: 14,
                  top: 5,
                  left: 5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Pins */}
            <View style={{ backgroundColor: color, width: STROKE, height: 3, top: 1, left: 8, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: STROKE, height: 3, top: 1, left: 14, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: STROKE, height: 3, bottom: 1, left: 8, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: STROKE, height: 3, bottom: 1, left: 14, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: 3, height: STROKE, top: 8, left: 1, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: 3, height: STROKE, top: 14, left: 1, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: 3, height: STROKE, top: 8, right: 1, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: 3, height: STROKE, top: 14, right: 1, position: 'absolute' }} />
          </>
        );

      case 'battery_full':
        return (
          <>
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 3,
                  width: 17,
                  height: 11,
                  top: 6.5,
                  left: 2.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Battery fill */}
            <View
              style={{
                backgroundColor: color,
                width: 11,
                height: 7,
                top: 8.5,
                left: 4.5,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            {/* Terminal nub */}
            <View
              style={{
                backgroundColor: color,
                width: 2,
                height: 5,
                top: 9.5,
                left: 20,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
          </>
        );

      case 'thermostat':
        return (
          <>
            {/* Stem */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderTopWidth: STROKE,
                  borderLeftWidth: STROKE,
                  borderRightWidth: STROKE,
                  borderTopLeftRadius: 4,
                  borderTopRightRadius: 4,
                  width: 6,
                  height: 12,
                  top: 3,
                  left: 9,
                  position: 'absolute',
                },
              ]}
            />
            {/* Bulb */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 6,
                  width: 10,
                  height: 10,
                  top: 11,
                  left: 7,
                  position: 'absolute',
                  backgroundColor: weight === 'filled' ? color : 'transparent',
                },
              ]}
            />
          </>
        );

      case 'timer':
        return (
          <>
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 9,
                  width: 17,
                  height: 17,
                  top: 4.5,
                  left: 3.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Top stem / crown */}
            <View
              style={{
                backgroundColor: color,
                width: 4,
                height: STROKE,
                top: 2,
                left: 10,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            {/* Clock hand */}
            <View
              style={{
                backgroundColor: color,
                width: STROKE,
                height: 5,
                top: 8,
                left: 11.1,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
          </>
        );

      case 'warning':
        return (
          <>
            {/* Triangle base */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderBottomWidth: STROKE,
                  width: 19,
                  height: 1,
                  top: 19,
                  left: 2.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Left slant */}
            <View
              style={{
                backgroundColor: color,
                width: STROKE,
                height: 17,
                transform: [{ rotate: '30deg' }],
                top: 3.5,
                left: 7.5,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            {/* Right slant */}
            <View
              style={{
                backgroundColor: color,
                width: STROKE,
                height: 17,
                transform: [{ rotate: '-30deg' }],
                top: 3.5,
                left: 15,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            {/* Exclamation point */}
            <View style={{ backgroundColor: color, width: STROKE, height: 6, top: 8.5, left: 11.1, position: 'absolute', borderRadius: 1 }} />
            <View style={{ backgroundColor: color, width: STROKE, height: STROKE, top: 16, left: 11.1, position: 'absolute', borderRadius: 1 }} />
          </>
        );

      case 'download':
        return (
          <>
            {/* Vertical stem */}
            <View style={{ backgroundColor: color, width: STROKE, height: 11, top: 3, left: 11.1, position: 'absolute', borderRadius: 1 }} />
            {/* Arrowhead */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderBottomWidth: STROKE,
                  borderRightWidth: STROKE,
                  width: 8,
                  height: 8,
                  transform: [{ rotate: '45deg' }],
                  top: 7.5,
                  left: 8,
                  position: 'absolute',
                },
              ]}
            />
            {/* Bottom tray */}
            <View style={{ backgroundColor: color, width: 17, height: STROKE, bottom: 4, left: 3.5, position: 'absolute', borderRadius: 1 }} />
          </>
        );

      case 'upload_file':
        return (
          <>
            {/* Document outline */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 2,
                  width: 16,
                  height: 19,
                  top: 2.5,
                  left: 4,
                  position: 'absolute',
                },
              ]}
            />
            {/* Up arrow */}
            <View style={{ backgroundColor: color, width: STROKE, height: 8, top: 8, left: 11.1, position: 'absolute', borderRadius: 1 }} />
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderTopWidth: STROKE,
                  borderLeftWidth: STROKE,
                  width: 6,
                  height: 6,
                  transform: [{ rotate: '45deg' }],
                  top: 7,
                  left: 9,
                  position: 'absolute',
                },
              ]}
            />
          </>
        );

      case 'search':
        return (
          <>
            {/* Magnifying glass circle */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 7,
                  width: 13,
                  height: 13,
                  top: 3.5,
                  left: 3.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Handle */}
            <View
              style={{
                backgroundColor: color,
                width: STROKE,
                height: 8,
                transform: [{ rotate: '-45deg' }],
                top: 13.5,
                left: 15.5,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
          </>
        );

      case 'refresh':
        return (
          <>
            {/* Arc circle */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderTopWidth: STROKE,
                  borderRightWidth: STROKE,
                  borderBottomWidth: STROKE,
                  borderLeftWidth: 0,
                  borderTopRightRadius: 9,
                  borderBottomRightRadius: 9,
                  width: 16,
                  height: 16,
                  top: 4,
                  left: 4,
                  position: 'absolute',
                },
              ]}
            />
            {/* Arrowhead */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderTopWidth: STROKE,
                  borderRightWidth: STROKE,
                  width: 5,
                  height: 5,
                  transform: [{ rotate: '-45deg' }],
                  top: 3,
                  left: 2.5,
                  position: 'absolute',
                },
              ]}
            />
          </>
        );

      case 'close':
        return (
          <>
            <View
              style={{
                backgroundColor: color,
                width: STROKE,
                height: 17,
                transform: [{ rotate: '45deg' }],
                top: 3.5,
                left: 11.1,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
            <View
              style={{
                backgroundColor: color,
                width: STROKE,
                height: 17,
                transform: [{ rotate: '-45deg' }],
                top: 3.5,
                left: 11.1,
                position: 'absolute',
                borderRadius: 1,
              }}
            />
          </>
        );

      case 'delete':
        return (
          <>
            {/* Lid */}
            <View style={{ backgroundColor: color, width: 17, height: STROKE, top: 4.5, left: 3.5, position: 'absolute', borderRadius: 1 }} />
            <View style={{ backgroundColor: color, width: 6, height: STROKE, top: 2.5, left: 9, position: 'absolute', borderRadius: 1 }} />
            {/* Body */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderLeftWidth: STROKE,
                  borderRightWidth: STROKE,
                  borderBottomWidth: STROKE,
                  borderBottomLeftRadius: 3,
                  borderBottomRightRadius: 3,
                  width: 13,
                  height: 13,
                  top: 6.5,
                  left: 5.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Slits */}
            <View style={{ backgroundColor: color, width: STROKE, height: 7, top: 9.5, left: 9, position: 'absolute', borderRadius: 1 }} />
            <View style={{ backgroundColor: color, width: STROKE, height: 7, top: 9.5, left: 13, position: 'absolute', borderRadius: 1 }} />
          </>
        );

      case 'info':
        return (
          <>
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderWidth: STROKE,
                  borderRadius: 10,
                  width: 19,
                  height: 19,
                  top: 2.5,
                  left: 2.5,
                  position: 'absolute',
                },
              ]}
            />
            {/* Dot */}
            <View style={{ backgroundColor: color, width: STROKE, height: STROKE, top: 6.5, left: 11.1, position: 'absolute', borderRadius: 1 }} />
            {/* Bar */}
            <View style={{ backgroundColor: color, width: STROKE, height: 7, top: 10, left: 11.1, position: 'absolute', borderRadius: 1 }} />
          </>
        );

      case 'check':
        return (
          <View
            style={[
              styles.stroke,
              {
                borderColor: color,
                borderBottomWidth: STROKE * 1.2,
                borderRightWidth: STROKE * 1.2,
                width: 7,
                height: 13,
                transform: [{ rotate: '45deg' }],
                top: 4,
                left: 8.5,
                position: 'absolute',
              },
            ]}
          />
        );

      case 'share':
        return (
          <>
            {/* Left node */}
            <View style={{ borderColor: color, borderWidth: STROKE, borderRadius: 3, width: 6, height: 6, top: 9, left: 3, position: 'absolute' }} />
            {/* Top-right node */}
            <View style={{ borderColor: color, borderWidth: STROKE, borderRadius: 3, width: 6, height: 6, top: 3.5, left: 15, position: 'absolute' }} />
            {/* Bottom-right node */}
            <View style={{ borderColor: color, borderWidth: STROKE, borderRadius: 3, width: 6, height: 6, top: 14.5, left: 15, position: 'absolute' }} />
            {/* Links */}
            <View style={{ backgroundColor: color, width: 9, height: STROKE, transform: [{ rotate: '-28deg' }], top: 7.5, left: 7.5, position: 'absolute' }} />
            <View style={{ backgroundColor: color, width: 9, height: STROKE, transform: [{ rotate: '28deg' }], top: 15, left: 7.5, position: 'absolute' }} />
          </>
        );

      case 'arrow_back':
        return (
          <>
            {/* Horizontal line */}
            <View style={{ backgroundColor: color, width: 14, height: STROKE, top: 11.1, left: 5, position: 'absolute', borderRadius: 1 }} />
            {/* Arrowhead */}
            <View
              style={[
                styles.stroke,
                {
                  borderColor: color,
                  borderTopWidth: STROKE,
                  borderLeftWidth: STROKE,
                  width: 8,
                  height: 8,
                  transform: [{ rotate: '-45deg' }],
                  top: 8,
                  left: 4.5,
                  position: 'absolute',
                },
              ]}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View
        style={[
          styles.viewBox,
          {
            transform: [{ scale }],
          },
        ]}
      >
        {renderIcon()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  viewBox: {
    width: 24,
    height: 24,
    position: 'relative',
  },
  stroke: {
    backgroundColor: 'transparent',
  },
});

