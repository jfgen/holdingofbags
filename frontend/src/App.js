import { jsx as _jsx } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from "react-router-dom";
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Routes, { children: _jsx(Route, { path: "*", element: _jsx("div", { className: "p-8 text-text", children: "Holding of Bags" }) }) }) }));
}
