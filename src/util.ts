export const dataToArrayBuffer = (uri: string) => {
    const bytes = atob(uri.split(",")[1]);

    const mime = uri.split(",")[0].split(":")[1].split(";")[0];

    const buffer = new ArrayBuffer(bytes.length);
    const intArray = new Uint8Array(buffer);

    for (let i = 0; i < bytes.length; i++) {
        intArray[i] = bytes.charCodeAt(i);
    }

    return buffer;
};
