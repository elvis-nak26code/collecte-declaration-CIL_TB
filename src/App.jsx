import { Toaster } from "react-hot-toast";
import Tb_CIL from "./Tb_CIL.jsx";

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: 13 } }} />
      <Tb_CIL />
    </>
  );
}
