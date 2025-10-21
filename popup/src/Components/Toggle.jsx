import { useState } from "react";

/**
 * Generic toggle wrapper
 * Props:
 * - component: React component to render when visible
 * - label?: optional label for the toggle button
 */
export default function Toggle({ component: Component, label }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={() => setVisible((v) => !v)}>
        {visible
          ? label?.hide || "Hide"
          : label?.show || "Show"}
      </button>

      {visible && (
        <div style={{ marginTop: "1rem" }}>
          <Component />
        </div>
      )}
    </div>
  );
}
