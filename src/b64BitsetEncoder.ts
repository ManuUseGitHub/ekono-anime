/**
 * Encodes a sorted list of numeric IDs as a compact Base64-encoded bitset.
 *
 * A bitset stores one bit per possible ID instead of storing the IDs
 * themselves. If bit `n` is set, then ID `n` exists in the collection.
 *
 * This encoding is only used when the textual encoding would become larger
 * than the bitset representation. The encoded value is prefixed with `B`
 * to distinguish it from the other encoding formats.
 *
 * Example:
 *   IDs: [0, 2, 5]
 *   Bits: 10100100
 *   Byte: 0b00100101
 *
 * @param ids Sorted list of unique numeric IDs.
 * @param range Current textual range encoding.
 * @param list Current textual list encoding.
 * @param encodings Collection to append the encoded value to.
 */
export const encodeBitset = (ids: number[], range: string, list: string, encodings: string[]) => {
    const max = ids[ids.length - 1];

    // Allocate one bit for every possible ID from 0..max.
    const bytes = new Uint8Array(Math.ceil((max + 1) / 8));

    for (const id of ids) {
        // id >> 3  -> byte index (divide by 8)
        // id & 7   -> bit position within the byte (mod 8)
        bytes[id >> 3] |= 1 << (id & 7);
    }

    // btoa() expects a binary string whose character codes represent
    // individual byte values (0-255).
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    // Strip Base64 padding since it can be restored during decoding.
    encodings.push(btoa(binary).replace(/=+$/, ""));
};

/**
 * Decodes a Base64-encoded bitset back into its original list of numeric IDs.
 *
 * The input should be the Base64 payload only (without the leading `B` prefix).
 * Each decoded byte represents eight IDs, where each set bit indicates that
 * the corresponding ID exists.
 *
 * @param encoded Base64 bitset without the leading `B` prefix.
 * @returns Sorted array of decoded numeric IDs.
 */
export const decodeB64OfBitset = (encoded: string) => {
    // Restore stripped Base64 padding before decoding.
    const binary = encoded + "=".repeat((4 - (encoded.length % 4)) % 4);

    const ids: number[] = [];

    for (let byteIndex = 0; byteIndex < binary.length; byteIndex++) {
        // Each character code represents a single byte.
        const byte = binary.charCodeAt(byteIndex);

        // Skip empty bytes to avoid unnecessary bit checks.
        if (byte === 0) continue;

        for (let bit = 0; bit < 8; bit++) {
            // If the bit is set, reconstruct the original ID.
            if (byte & (1 << bit)) {
                ids.push((byteIndex << 3) | bit);
            }
        }
    }

    return ids;
};
