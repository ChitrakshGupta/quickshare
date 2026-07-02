export function copyTextToClipboard(text: string): boolean {
  // Fallback: create temporary textarea and run execCommand synchronously first.
  // This is highly compatible with Safari's strict "user gesture" rule, 
  // as it runs in the same execution tick without any async/await delays.
  const textArea = document.createElement('textarea');
  textArea.value = text;
  
  textArea.style.position = 'fixed';
  textArea.style.top = '-9999px';
  textArea.style.left = '-9999px';
  textArea.style.width = '2em';
  textArea.style.height = '2em';
  textArea.style.padding = '0';
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';
  textArea.style.background = 'transparent';
  
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    console.warn('execCommand copy failed, trying async clipboard API...', err);
  }
  document.body.removeChild(textArea);

  if (successful) {
    return true;
  }

  // Backup: Try modern Clipboard API (async fallback) if execCommand failed
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).catch((err) => {
      console.error('Async clipboard write failed:', err);
    });
    return true; 
  }

  return false;
}
