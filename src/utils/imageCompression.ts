/**
 * 客户端图片压缩工具
 * 在上传前压缩图片以提高性能
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param options 压缩选项
 * @returns 压缩后的文件
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.8,
    maxSizeKB = 500,
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);

      // 转换为Blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("图片压缩失败"));
            return;
          }

          // 检查压缩后的大小
          const compressedSizeKB = blob.size / 1024;
          console.log(
            `图片压缩: ${(file.size / 1024).toFixed(
              1
            )}KB → ${compressedSizeKB.toFixed(1)}KB`
          );

          // 如果压缩后仍然太大，降低质量再次压缩
          if (compressedSizeKB > maxSizeKB && quality > 0.3) {
            const newQuality = Math.max(0.3, quality - 0.2);
            console.log(`文件仍然较大，降低质量到 ${newQuality} 重新压缩`);

            canvas.toBlob(
              (secondBlob) => {
                if (!secondBlob) {
                  reject(new Error("二次压缩失败"));
                  return;
                }

                const finalFile = new File([secondBlob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(finalFile);
              },
              file.type,
              newQuality
            );
          } else {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error("图片加载失败"));
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * 检查是否需要压缩
 * @param file 图片文件
 * @returns 是否需要压缩
 */
export function shouldCompress(file: File): boolean {
  const sizeKB = file.size / 1024;
  return sizeKB > 300; // 大于300KB的图片建议压缩
}
