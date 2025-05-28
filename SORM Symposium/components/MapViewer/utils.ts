export const calculateBounds = (
  scale: number,
  imageSize: { width: number; height: number },
  containerSize: { width: number; height: number }
) => {
  const scaledWidth = imageSize.width * scale;
  const scaledHeight = imageSize.height * scale;
  
  return {
    minX: containerSize.width - scaledWidth,
    maxX: 0,
    minY: containerSize.height - scaledHeight,
    maxY: 0,
  };
};

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
}; 