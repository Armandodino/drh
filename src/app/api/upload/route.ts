import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string || 'products';

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 5MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadDir, { recursive: true });
    
    // Write file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Return public URL
    const publicUrl = `/uploads/${type}/${filename}`;

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}
