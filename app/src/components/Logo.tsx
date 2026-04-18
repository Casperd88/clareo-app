import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface LogoProps {
  width?: number;
  height?: number;
  color?: string;
}

export function Logo({ width = 151, height = 155, color = "#fff" }: LogoProps) {
  const scale = width / 151;
  const scaledHeight = 155 * scale;

  return (
    <Svg
      width={width}
      height={scaledHeight}
      viewBox="0 0 151 155"
    >
      <Circle cx="11" cy="31.4999" r="11" fill={color} />
      <Circle cx="70" cy="31.4999" r="11" fill={color} />
      <Path d="M102 111L146.873 154.5H58L102 111Z" fill={color} />
      <Path d="M39.5 37L3 5.55581e-06L76 8.7659e-06L39.5 37Z" fill={color} />
      <Path
        d="M150.337 91.3915C134.627 107.102 109.156 107.102 93.4458 91.3915C77.7356 75.6813 77.7356 50.2101 93.4458 34.5L150.337 91.3915Z"
        fill={color}
      />
      <Path
        d="M97.3373 107.392C81.6271 123.102 56.1559 123.102 40.4458 107.392C24.7356 91.6813 24.7356 66.2101 40.4458 50.5L97.3373 107.392Z"
        fill={color}
      />
    </Svg>
  );
}
