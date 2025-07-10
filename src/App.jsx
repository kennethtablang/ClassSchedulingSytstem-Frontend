// src/App.jsx
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "sonner";

const App = () => {
  return (
    <>
      <AppRoutes />

      {/* Global toast provider */}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={3000} // optional: auto-dismiss time in ms
      />
    </>
  );
};

export default App;
