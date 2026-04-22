"use client";

import dynamic from "next/dynamic";
import type { Data, Layout, Config } from "plotly.js";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export type Plot2DProps = {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
  height?: number;
};

/**
 * Thin Plotly 2D wrapper with editorial defaults. Used for persistence
 * diagrams, barcodes, distortion tables, and other non-3D plots.
 */
export function Plot2DWrapper({
  data,
  layout,
  config,
  className,
  height = 320,
}: Plot2DProps) {
  const mergedLayout: Partial<Layout> = {
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    margin: { l: 50, r: 10, t: 10, b: 40 },
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
