import { VisibilityReport } from '../types';

/**
 * Service for integrating real SEO data from DataForSEO API via server proxy.
 * This replaces or augments the AI-generated visibility scores with hard, quantitative data.
 */

export async function fetchRealSeoData(domain: string): Promise<any> {
  try {
    const response = await fetch('/api/v1/seo/domain-rank', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ domain })
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 402 || response.status === 503 || response.status === 404) {
        console.warn(`DataForSEO API fallback (Status: ${response.status}). Falling back to AI estimates.`);
        return null;
      }
      throw new Error(`SEO Proxy error: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || contentType.indexOf("application/json") === -1) {
      const text = await response.text();
      console.warn(`Expected JSON from SEO Proxy but received ${contentType}. Payload sample: ${text.substring(0, 100)}`);
      return null;
    }

    const data = await response.json();
    
    if (data.tasks && data.tasks[0] && data.tasks[0].result && data.tasks[0].result[0]) {
      const result = data.tasks[0].result[0];
      return {
        organicTraffic: result.metrics?.organic?.etv || 0,
        organicKeywords: result.metrics?.organic?.count || 0,
        domainTrust: result.metrics?.organic?.domain_trust || 0,
      };
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to fetch real SEO data:', error);
    return null;
  }
}
