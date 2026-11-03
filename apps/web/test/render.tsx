import { render, type RenderOptions } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { ReactElement } from "react";

import messages from "../messages/en.json";

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {ui}
      </ThemeProvider>
    </NextIntlClientProvider>,
    options,
  );
}
