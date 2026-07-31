export function formatErrorMessage(err: any, fallback = "An unexpected error occurred."): string {
  if (!err) return fallback;
  
  const isObjectString = (str: string) => {
    if (typeof str !== 'string') return false;
    return str.includes('[object Object]') || str === '{"error":"[object Object]"}';
  };

  const isHtml = (str: string) => {
    if (typeof str !== 'string') return false;
    const s = str.trim().toLowerCase();
    return s.startsWith("<!doctype") || s.startsWith("<html") || s.includes("<body") || s.includes("<head") || s.includes("page cannot be found") || s.includes("not found");
  };

  const extractMessageFromJson = (jsonStr: string): string | null => {
    try {
      // Try to find JSON inside a string (e.g. "Vision Failure: {JSON}")
      const match = jsonStr.match(/\{.*\}/);
      const toParse = match ? match[0] : jsonStr;
      const parsed = JSON.parse(toParse);
      
      // Common error structures
      const possibleMessages = [
        parsed?.error?.message,
        parsed?.error,
        parsed?.message,
        parsed?.statusText
      ];

      for (const msg of possibleMessages) {
        if (typeof msg === 'string' && !isObjectString(msg)) {
          if (isHtml(msg)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
          // Check for 429/Quota or 503/Unavailable in the message
          if (msg.includes("quota") || msg.includes("limit") || msg.includes("429")) {
            return "Intelligence quota exceeded. Tactical recalibration required (try again later).";
          }
          if (msg.includes("503") || msg.includes("unavailable") || msg.includes("high demand")) {
            return "Intelligence systems are currently under high load. Tactical recalibration required (try again in a moment).";
          }
          return msg;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Handle direct strings
  if (typeof err === 'string') {
    if (err.includes("API_KEY_ERROR")) return "AI API key is not configured. Please add it in settings.";
    if (isObjectString(err)) return "Interface Error: Data stream corrupted.";
    if (isHtml(err)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
    const fromJson = extractMessageFromJson(err);
    if (fromJson) return fromJson;
    return err;
  }
  
  // Handle response objects (Axios/Fetch)
  if (err.response?.data) {
    const data = err.response.data;
    if (typeof data === 'string' && !isObjectString(data)) {
        if (isHtml(data)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
        const fromJson = extractMessageFromJson(data);
        return fromJson || data;
    }
    
    if (data.error) {
      if (typeof data.error === 'string' && !isObjectString(data.error)) {
          if (isHtml(data.error)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
          const fromJson = extractMessageFromJson(data.error);
          return fromJson || data.error;
      }
      if (typeof data.error.message === 'string' && !isObjectString(data.error.message)) {
          if (isHtml(data.error.message)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
          return data.error.message;
      }
      
      const stringified = JSON.stringify(data.error);
      if (!isObjectString(stringified)) {
          const fromJson = extractMessageFromJson(stringified);
          return fromJson || stringified;
      }
    }
    if (typeof data.message === 'string' && !isObjectString(data.message)) {
        if (isHtml(data.message)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
        return data.message;
    }
    
    const stringifiedData = JSON.stringify(data);
    if (!isObjectString(stringifiedData)) {
        const fromJson = extractMessageFromJson(stringifiedData);
        return fromJson || stringifiedData;
    }
  }

  // Handle standard Error objects
  if (err.message && typeof err.message === 'string') {
    if (err.message.includes("API_KEY_ERROR")) return "AI API key is not configured. Please add it in settings.";
    if (isHtml(err.message)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
    if (isObjectString(err.message)) {
      try {
        if (err.response?.data?.error?.message) {
          const m = err.response.data.error.message;
          if (isHtml(m)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
          return m;
        }
        if (err.response?.data?.message) {
          const m = err.response.data.message;
          if (isHtml(m)) return "The visibility scanner encountered a server communication error. Please try again in a moment.";
          return m;
        }

        const str = JSON.stringify(err);
        return str !== "{}" && !isObjectString(str) ? str : "Internal System Anomaly.";
      } catch {
        return "Tactical data link broken.";
      }
    }
    
    const fromJson = extractMessageFromJson(err.message);
    if (fromJson) return fromJson;
    
    return err.message;
  }

  // Fallback stringification
  try {
    const str = JSON.stringify(err);
    if (str === "{}" || isObjectString(str)) return fallback;
    const fromJson = extractMessageFromJson(str);
    return fromJson || str;
  } catch {
    return isObjectString(String(err)) ? fallback : String(err);
  }
}
