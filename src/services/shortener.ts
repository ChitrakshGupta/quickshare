export async function shortenUrl(longUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const callbackName = `is_gd_callback_${Math.floor(Math.random() * 1000000)}`;
    
    // Set global callback function
    (window as any)[callbackName] = (data: any) => {
      cleanup();
      if (data.shorturl) {
        resolve(data.shorturl);
      } else if (data.errormessage) {
        reject(new Error(data.errormessage));
      } else {
        reject(new Error('Failed to shorten URL'));
      }
    };

    const script = document.createElement('script');
    script.id = callbackName;
    script.src = `https://is.gd/create.php?format=json&callback=${callbackName}&url=${encodeURIComponent(longUrl)}`;
    
    script.onerror = () => {
      cleanup();
      reject(new Error('Shortening service request failed.'));
    };

    const cleanup = () => {
      const el = document.getElementById(callbackName);
      if (el) el.remove();
      delete (window as any)[callbackName];
    };

    document.head.appendChild(script);
  });
}
