import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    this.http.get<Record<string, string>>(`${environment.apiBaseUrl}/content/config`).subscribe({
      next: (config) => {
        this.injectTools(config);
      },
      error: () => {
        // Silent fail on analytics config load error
      }
    });
  }

  private injectTools(config: Record<string, string>) {
    const doc = document;

    // Google Analytics (gtag)
    if (config['googleAnalyticsKey']) {
      const gaKey = config['googleAnalyticsKey'];
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
    if (config['googleTagManagerId']) {
      const gtmId = config['googleTagManagerId'];
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
    if (config['crispWebsiteId']) {
      const crispId = config['crispWebsiteId'];
      const s = doc.createElement('script');
      s.innerHTML = `
        window.$crisp=[];window.CRISP_WEBSITE_ID="${crispId}";
        (function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();
      `;
      doc.head.appendChild(s);
    }

    // Meta Pixel
    if (config['metaPixelId']) {
      const pixelId = config['metaPixelId'];
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
    if (config['posthogKey']) {
      const phKey = config['posthogKey'];
      const s = doc.createElement('script');
      s.innerHTML = `
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group reset groups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags resetGroups get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('${phKey}', { api_host: 'https://us.i.posthog.com' });
      `;
      doc.head.appendChild(s);
    }
  }
}
