import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    if (!isPlatformBrowser(this.platformId)) return;

    this.http.get<Record<string, string>>(`${environment.apiBaseUrl}/content/config`).subscribe({
      next: (config) => {
        // Defer non-critical tracker injections until browser is idle to prioritize FCP/LCP
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(() => this.injectTools(config), { timeout: 3000 });
        } else {
          setTimeout(() => this.injectTools(config), 2500);
        }
      },
      error: () => {
        // Silent fail on analytics config load error
      }
    });
  }

  /**
   * SECURITY: these ids are interpolated into inline <script> bodies, so an
   * attacker-controlled value (a compromised admin account writing to the
   * settings store) would be stored-XSS. We validate each id against its
   * vendor's strict format and refuse to inject anything that doesn't match.
   */
  private static readonly KEY_FORMATS: Record<string, RegExp> = {
    googleAnalyticsKey: /^(G-[A-Z0-9]{4,20}|UA-\d{4,12}-\d{1,4})$/,
    googleTagManagerId: /^GTM-[A-Z0-9]{4,12}$/,
    crispWebsiteId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    metaPixelId: /^\d{6,20}$/,
    posthogKey: /^phc_[A-Za-z0-9]{20,60}$/,
  };

  private validId(key: string, value: string | undefined): string | null {
    if (!value) return null;
    const format = AnalyticsService.KEY_FORMATS[key];
    return format && format.test(value) ? value : null;
  }

  private injectTools(config: Record<string, string>) {
    const doc = document;

    // Google Analytics (gtag)
    const gaKeyValid = this.validId('googleAnalyticsKey', config['googleAnalyticsKey']);
    if (gaKeyValid) {
      const gaKey = gaKeyValid;
      const s1 = doc.createElement('script');
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${gaKey}`;
      doc.head.appendChild(s1);

      const s2 = doc.createElement('script');
      s2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaKey}');
      `;
      doc.head.appendChild(s2);
    }

    // Google Tag Manager
    const gtmIdValid = this.validId('googleTagManagerId', config['googleTagManagerId']);
    if (gtmIdValid) {
      const gtmId = gtmIdValid;
      const s = doc.createElement('script');
      s.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      doc.head.appendChild(s);
    }

    // Crisp Live Chat
    const crispIdValid = this.validId('crispWebsiteId', config['crispWebsiteId']);
    if (crispIdValid) {
      const crispId = crispIdValid;
      const s = doc.createElement('script');
      s.innerHTML = `
        window.$crisp=[];window.CRISP_WEBSITE_ID="${crispId}";
        (function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
      `;
      doc.head.appendChild(s);
    }

    // Meta Pixel
    const pixelIdValid = this.validId('metaPixelId', config['metaPixelId']);
    if (pixelIdValid) {
      const pixelId = pixelIdValid;
      const s = doc.createElement('script');
      s.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `;
      doc.head.appendChild(s);
    }

    // PostHog
    const phKeyValid = this.validId('posthogKey', config['posthogKey']);
    if (phKeyValid) {
      const phKey = phKeyValid;
      const s = doc.createElement('script');
      s.innerHTML = `
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group reset groups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${phKey}', { api_host: 'https://us.i.posthog.com' });
      `;
      doc.head.appendChild(s);
    }
  }
}
