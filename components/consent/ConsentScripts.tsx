"use client"

import Script from "next/script"
import { useConsent } from "./ConsentProvider"

/**
 * All third-party scripts must load here — never hardcode them in layout.
 *
 * Google Analytics example (inactive until GA_MEASUREMENT_ID is set in env):
 *   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 *
 * Google Consent Mode v2 signals are pushed before the gtag.js loads so
 * that GA4 respects the consent state on every pageview.
 */
export default function ConsentScripts() {
  const { categories, saved } = useConsent()
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  // In strict mode we wait until the user has made a choice.
  // In notice mode scripts may load immediately (default optin).
  if (!gaId) return null

  return (
    <>
      {/* Google Consent Mode v2 — runs before gtag.js */}
      <Script id="gcm-defaults" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage:              '${categories.marketing ? "granted" : "denied"}',
            ad_user_data:            '${categories.marketing ? "granted" : "denied"}',
            ad_personalization:      '${categories.marketing ? "granted" : "denied"}',
            analytics_storage:       '${categories.analytics ? "granted" : "denied"}',
            functionality_storage:   'granted',
            security_storage:        'granted',
            wait_for_update:         500,
          });
          gtag('set', 'ads_data_redaction', ${!categories.marketing});
          gtag('set', 'url_passthrough', true);
        `}
      </Script>

      {/* Load GA4 only after consent is determined */}
      {saved && categories.analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
              gtag('consent', 'update', {
                analytics_storage: 'granted',
                ${categories.marketing ? "ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted'," : ""}
              });
            `}
          </Script>
        </>
      )}
    </>
  )
}
