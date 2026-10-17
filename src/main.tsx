import { createRoot } from "react-dom/client";
import "@fontsource-variable/jost";
import "@fontsource-variable/cormorant";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
