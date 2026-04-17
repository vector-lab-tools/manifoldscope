"use client";

import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export type Plot3DProps = {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  height?: number;
};

/**
 * Thin Plotly 3D wrapper with editorial defaults. Shift+scroll fast zoom is
 * the house convention; delegated to Plotly's default scene controls here.
 */
export function Plot3DWrapper({
  data,
  layout,
  config,
  className,
  height = 520,
}: Plot3DProps) {
  const mergedLayout: Partial<Layout> = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 0, r: 0, t: 0, b: 0 },
    scene: {
      xaxis: { title: { text: "PC1" }, backgroundcolor: "rgba(0,0,0,0)" },
      yaxis: { title: { text: "PC2" }, backgroundcolor: "rgba(0,0,0,0)" },
      zaxis: { title: { text: "PC3" }, backgroundcolor: "rgba(0,0,0,0)" },
      bgcolor: "rgba(0,0,0,0)",
    },
    autosize: true,
    ...layout,
  };

  const mergedConfig: Partial<Config> = {
    displaylogo: false,
    responsive: true,
    ...config,
  };

  return (
    <div className={className} style={{ height }}>
      <Plot
        data={data}
        layout={mergedLayout}
        config={mergedConfig}
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
