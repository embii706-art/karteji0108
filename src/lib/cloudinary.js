
const CLOUD_NAME = "dbxktcwug";
const UPLOAD_PRESET = "Karteji";

export async function uploadToCloudinary(file){
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', UPLOAD_PRESET);
  const res = await fetch(url, { method:'POST', body: fd });
  if(!res.ok) throw new Error('Gagal upload');
  const data = await res.json();
  return data.secure_url;
}

export function cloudinarySmart(url, w=900){
  // lightweight transform if already cloudinary
  if(!url || !url.includes('res.cloudinary.com')) return url;
  return url.replace('/upload/','/upload/f_auto,q_auto,w_'+w+'/');
}
