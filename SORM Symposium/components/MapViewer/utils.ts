export const calculateBounds = (
  scale: number,
  imageSize: { width: number; height: number },
  containerSize: { width: number; height: number }
) => {
  'worklet';

  const aspectRatio = imageSize.width / imageSize.height;
  const scaledWidth = containerSize.width;
  const scaledHeight = scaledWidth / aspectRatio;

  return {
    minX: -scaledWidth / 2,
    maxX: scaledWidth / 2,
    minY: -scaledHeight / 2,
    maxY: scaledHeight / 2,
  };
};

export const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
}; 