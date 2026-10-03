export type LinkSecurityStatus = 'normal' | 'verified' | 'warning' | 'blocked';

export interface LinkSecurityResult {
  status: LinkSecurityStatus;
  reason?: string;
}

export function getLinkSecurityStatus(url: string | null | undefined): LinkSecurityResult {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { status: 'blocked', reason: 'Invalid or empty URL' };
  }
  
  const trimmedUrl = url.trim();
  
  // Quick check for obvious dangerous protocols before parsing
  const lowerUrl = trimmedUrl.toLowerCase();
  if (
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('data:') ||
    lowerUrl.startsWith('vbscript:') ||
    lowerUrl.startsWith('file:') ||
    lowerUrl.startsWith('blob:')
  ) {
    return { status: 'blocked', reason: 'Unsupported URL scheme' };
  }

  try {
    // Attempt to parse. Dummy base used for relative URLs.
    const parsed = new URL(trimmedUrl, 'http://dummy.base');
    
    const protocol = parsed.protocol.toLowerCase();
    
    // Only allow http and https (relative URLs will have http: from dummy base)
    if (protocol !== 'http:' && protocol !== 'https:') {
       return { status: 'blocked', reason: 'Unsupported URL scheme' };
    }
    
    // Check if internal (we can treat internal as verified or normal)
    if (parsed.hostname === 'dummy.base') {
        return { status: 'normal' };
    }
    
    if (typeof window !== 'undefined' && parsed.hostname === window.location.hostname) {
        return { status: 'normal' };
    }
    
    // External valid HTTP/HTTPS links are normal, not warnings, by default
    return { status: 'normal' };
  } catch (error) {
    return { status: 'blocked', reason: 'Malformed URL' };
  }
}

export function getMediaSecurityStatus(url: string | null | undefined): LinkSecurityResult {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return { status: 'blocked', reason: 'Invalid or empty Media URL' };
  }
  
  const trimmedUrl = url.trim();
  const lowerUrl = trimmedUrl.toLowerCase();
  
  if (
    lowerUrl.startsWith('javascript:') ||
    lowerUrl.startsWith('vbscript:') ||
    lowerUrl.startsWith('file:')
  ) {
    return { status: 'blocked', reason: 'Unsupported URL scheme for media' };
  }

  if (lowerUrl.startsWith('data:') || lowerUrl.startsWith('blob:')) {
    return { status: 'normal' };
  }

  try {
    const parsed = new URL(trimmedUrl, 'http://dummy.base');
    const protocol = parsed.protocol.toLowerCase();
    
    if (protocol !== 'http:' && protocol !== 'https:') {
       return { status: 'blocked', reason: 'Unsupported URL scheme' };
    }
    
    if (parsed.hostname === 'dummy.base') {
        return { status: 'normal' };
    }
    if (typeof window !== 'undefined' && parsed.hostname === window.location.hostname) {
        return { status: 'normal' };
    }
    
    // External media is considered a warning so we can show a placeholder
    return { status: 'warning', reason: 'External media is hidden for privacy/security.' };
  } catch (error) {
    return { status: 'blocked', reason: 'Malformed URL' };
  }
}
