const PINATA_JWT = import.meta.env.VITE_JWT;
const PINATA_GATEWAY = import.meta.env.VITE_GATEWAY_URL;

export async function uploadFileToPinata(file: File): Promise<string> {
  const data = new FormData();
  data.append("file", file);

  const request = await fetch("/api/upload-to-pinata", {
    method: "POST",
    body: data,
  });
  const response = await request.json();
  if (!request.ok) throw new Error(response.error || "Pinata upload failed");
  // Pinata may return { data: { cid } } or { IpfsHash }
  return response.data?.cid || response.data?.IpfsHash || response.cid || response.IpfsHash;
}

export async function uploadJSONToPinata(json: any): Promise<string> {
  const request = await fetch("/api/upload-to-pinata", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(json),
  });
  const response = await request.json();
  if (!request.ok) throw new Error(response.error || "Pinata JSON upload failed");
  return response.data?.cid || response.data?.IpfsHash || response.cid || response.IpfsHash;
}

export function getPinataGatewayUrl(cid: string): string {
  return `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`;
} 