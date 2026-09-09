// Perbaikan untuk serialisasi tanggal dalam AuthJS/Nuxt Auth
// Plugin ini memastikan bahwa semua nilai Date objects valid sebelum dikirim ke cookie handler

export default defineNitroPlugin((nitroApp) => {
  // Intercept cookie operations untuk memastikan expires valid
  nitroApp.hooks.hook('request', (event) => {
    // Hook ini memastikan bahwa setiap Date object yang dikirim valid
    const originalSetCookie = event.node.res.setHeader.bind(event.node.res);
    
    event.node.res.setHeader = function(name: string, value: any) {
      if (name.toLowerCase() === 'set-cookie') {
        // Pastikan value adalah array
        const cookies = Array.isArray(value) ? value : [value];
        
        // Validasi setiap cookie
        const validatedCookies = cookies.map((cookie: string) => {
          // Jika cookie mengandung Expires dengan nilai invalid, perbaiki
          if (typeof cookie === 'string' && cookie.includes('Expires=')) {
            const parts = cookie.split('; ');
            const validatedParts = parts.map(part => {
              if (part.startsWith('Expires=')) {
                const dateStr = part.substring(8);
                const date = new Date(dateStr);
                
                // Jika tanggal tidak valid, gunakan 30 hari dari sekarang
                if (isNaN(date.getTime())) {
                  const validDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  return `Expires=${validDate.toUTCString()}`;
                }
              }
              return part;
            });
            return validatedParts.join('; ');
          }
          return cookie;
        });
        
        return originalSetCookie(name, validatedCookies.length === 1 ? validatedCookies[0] : validatedCookies);
      }
      
      return originalSetCookie(name, value);
    };
  });
});