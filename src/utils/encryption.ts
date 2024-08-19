// features/password/encryption.ts

export const bytesToBase64 = (bytes: Uint8Array): string => {
    return btoa(String.fromCharCode(...bytes));
};

export const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes, (byte) =>
        byte.toString(16).padStart(2, '0')
    ).join('');
};

export const generateRandomKeyAndIV = async (): Promise<{ keyBytes: Uint8Array; ivBytes: Uint8Array }> => {
    const keyBytes = crypto.getRandomValues(new Uint8Array(32)); // 32 bytes = 256 bits
    const ivBytes = crypto.getRandomValues(new Uint8Array(16)); // 16 bytes for AES-CBC IV
    return { keyBytes, ivBytes };
};

export const encryptData = async (keyBytes: Uint8Array, ivBytes: Uint8Array, plaintext: string) => {
    const key = await crypto.subtle.importKey(
        'raw',
        keyBytes,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
    );

    const encryptedBytes = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: ivBytes },
        key,
        new TextEncoder().encode(plaintext)
    );

    return {
        encryptedData: bytesToBase64(new Uint8Array(encryptedBytes)),
        iv: bytesToBase64(ivBytes),
        keyHex: bytesToHex(keyBytes),
    };
};

export const encryptAndFormatData = async (plaintext: string): Promise<string> => {
    const { keyBytes, ivBytes } = await generateRandomKeyAndIV();
    const { encryptedData, iv, keyHex } = await encryptData(keyBytes, ivBytes, plaintext);

    return `${keyHex}|${iv}|${encryptedData}`;
};
