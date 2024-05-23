import * as React from "react";
import { ScrollViewStyleReset } from "expo-router/html";

export default ({ children }: { children: React.ReactNode }) => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="custom" content="value" />
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1.00001,viewport-fit=cover"
      />
      <ScrollViewStyleReset />
    </head>
    <body>{children}</body>
  </html>
);
