import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "../index.css";
import "./cover.css";
import { Cover } from "./Cover";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Cover />
  </StrictMode>,
);
