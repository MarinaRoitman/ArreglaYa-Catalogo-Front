import React from 'react';
// import ReactDOM from 'react-dom/client';
import { createRoot } from "react-dom/client";
import { MantineProvider, ColorSchemeScript } from "@mantine/core";

import "@mantine/core/styles.css";
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';


const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ColorSchemeScript defaultColorScheme="auto" />
    <MantineProvider
      defaultColorScheme="light"
      theme={{
        // opcional: personalizá paleta global
        primaryColor: "orange",
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <App />
    </MantineProvider>
    
  </React.StrictMode>
);


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

if (typeof ResizeObserver !== "undefined") {
  const original = ResizeObserver;
  window.ResizeObserver = class ResizeObserver extends original {
    constructor(callback) {
      super((entries, observer) => {
        try {
          callback(entries, observer);
        } catch (e) {
          if (
            !e.message.includes(
              "ResizeObserver loop completed with undelivered notifications"
            )
          ) {
            throw e;
          }
        }
      });
    }
  };
}