// src/lib/audio.ts

/**
 * Splits a long text into an array of smaller chunks, respecting sentence boundaries.
 * @param text The input text to split.
 * @param maxChars The maximum number of characters per chunk.
 * @returns An array of text chunks.
 */
export function chunkText(text: string, maxChars: number = 800): string[] {
  const chunks: string[] = [];
  // Split by sentence boundaries (., !, ?) and newlines, keeping the delimiter attached
  const sentences = text.match(/[^.!?\n]+[.!?\n]*\s*/g) || [text];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk.length + sentence.length) > maxChars) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      if (sentence.length > maxChars) {
        // Fallback for very long sentences
        const words = sentence.split(/\s+/);
        currentChunk = '';
        for (const word of words) {
          if ((currentChunk.length + word.length) > maxChars) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
          }
          currentChunk += word + ' ';
        }
      } else {
        currentChunk = sentence;
      }
    } else {
      currentChunk += sentence;
    }
  }
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}

/**
 * Helper to find the offset of the 'data' chunk in a WAV ArrayBuffer.
 */
function getWavDataOffset(buffer: ArrayBuffer): number {
  const view = new DataView(buffer);
  let offset = 12; // Skip 'RIFF', size, 'WAVE'
  while (offset < buffer.byteLength - 8) {
    const chunkId = String.fromCharCode(
      view.getUint8(offset),
      view.getUint8(offset + 1),
      view.getUint8(offset + 2),
      view.getUint8(offset + 3)
    );
    const chunkSize = view.getUint32(offset + 4, true);
    if (chunkId === 'data') {
      return offset + 8; // start of data bytes
    }
    offset += 8 + chunkSize;
  }
  return 44; // Fallback to standard 44-byte header
}

/**
 * Concatenates multiple audio ArrayBuffers into a single ArrayBuffer.
 * @param buffers Array of ArrayBuffers to concatenate.
 * @param format The audio format ('mp3', 'wav', etc.).
 * @returns A single ArrayBuffer containing the concatenated audio.
 */
export function concatAudioBuffers(buffers: ArrayBuffer[], format: string): ArrayBuffer {
  if (buffers.length === 0) return new ArrayBuffer(0);
  if (buffers.length === 1) return buffers[0];

  if (format === 'wav') {
    // For WAV files, we must preserve the header of the first file and append the PCM data of the rest,
    // then update the overall sizes in the header.
    const offsets = buffers.map(getWavDataOffset);
    const firstOffset = offsets[0];
    
    let totalDataLength = 0;
    for (let i = 0; i < buffers.length; i++) {
      totalDataLength += buffers[i].byteLength - offsets[i];
    }

    const result = new Uint8Array(firstOffset + totalDataLength);
    
    // Copy the header from the first buffer
    result.set(new Uint8Array(buffers[0].slice(0, firstOffset)), 0);
    
    // Update RIFF chunk size (bytes 4-7)
    const dataView = new DataView(result.buffer);
    dataView.setUint32(4, result.byteLength - 8, true); // Little-endian
    
    // Update data chunk size (the 4 bytes immediately preceding the data)
    dataView.setUint32(firstOffset - 4, totalDataLength, true); // Little-endian
    
    let currentOffset = firstOffset;
    for (let i = 0; i < buffers.length; i++) {
      const dataLength = buffers[i].byteLength - offsets[i];
      result.set(new Uint8Array(buffers[i].slice(offsets[i])), currentOffset);
      currentOffset += dataLength;
    }
    return result.buffer;
  }

  // For mp3, ogg, etc., simple byte concatenation works fine
  const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result.buffer;
}
