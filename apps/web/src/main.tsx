import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Mneme from "./Mneme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Mneme />
  </StrictMode>
);
