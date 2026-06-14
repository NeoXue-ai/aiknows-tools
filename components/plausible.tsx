import Script from "next/script";

export function Plausible({ domain }: { domain: string }) {
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}