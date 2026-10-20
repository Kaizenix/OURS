import { createClient } from './client';

export type StorageBucket = 'photos' | 'avatars' | 'chat-attachments';

export async function uploadFileToStorage(
  file: File,
  bucket: StorageBucket,
  pathPrefix = 'couple'
): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error(`Storage upload error to ${bucket}:`, error);
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}
