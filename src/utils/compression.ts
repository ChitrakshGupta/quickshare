export async function compressToHash(payload: object): Promise<string> {
  const jsonString = JSON.stringify(payload);
  const stream = new Blob([jsonString]).stream();
  const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
  
  const chunks: any[] = [];
  const reader = compressedStream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const blob = new Blob(chunks);
  const buffer = await blob.arrayBuffer();
  
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function decompressFromHash(hashString: string): Promise<any> {
  let base64 = hashString.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  
  const stream = new Blob([bytes]).stream();
  const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
  
  const chunks: any[] = [];
  const reader = decompressedStream.getReader();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  
  const blob = new Blob(chunks);
  const jsonText = await blob.text();
  return JSON.parse(jsonText);
}
