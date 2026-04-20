import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<div className="p-8 text-text">Holding of Bags</div>} />
      </Routes>
    </BrowserRouter>
  );
}
