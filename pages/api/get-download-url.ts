// pages/api/get-download-url.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: any, res: any) {
  const { fileName } = req.query;

  if (!fileName) return res.status(400).json({ error: "Missing fileName" });

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      // 关键改动：强制浏览器将此响应视为附件并指定下载后的文件名
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
      // 可选：如果希望强制浏览器识别为下载流，可以加上这行
      ResponseContentType: 'application/octet-stream',
    });

    // 生成链接
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.status(200).json({ url: signedUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}