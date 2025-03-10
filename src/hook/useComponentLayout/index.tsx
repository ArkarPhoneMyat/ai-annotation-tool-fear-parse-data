import React, { useState, useCallback } from 'react';

import { LayoutRectangle, LayoutChangeEvent, Platform, StatusBar } from 'react-native';


const useComponentLayout = () => {
  const [layout, setLayout] = useState<LayoutRectangle>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const size = event.nativeEvent.layout;
    setLayout((l) => Object.assign(l, size));
  }, []);
  return { layout, onLayout };
};
const calcCropLayout = (layout: LayoutRectangle, scale: number) => {
  let { width, height, x, y } = layout;
  if (Platform.OS === 'android') {
    width = Math.ceil(layout.width * scale);
    height = Math.ceil(layout.height * scale);
    x = Math.ceil(layout.x * scale);
    const statusbarHeight = StatusBar.currentHeight
      ? StatusBar.currentHeight
      : 0;
    y = Math.ceil((layout.y + statusbarHeight) * scale);
  }
  return { width, height, x, y };
};

export {
  useComponentLayout
}