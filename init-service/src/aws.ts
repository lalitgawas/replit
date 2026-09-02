import "dotenv/config";

import {
  S3Client,
  ListObjectsV2Command,
  CopyObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";


if (
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.S3_ENDPOINT ||
  !process.env.S3_BUCKET
) {
  throw new Error("Missing environment variables");
}


const s3 = new S3Client({
  region: "auto", 
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});



export async function testConnection() {
  try {
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET!,
        MaxKeys: 1,
      })
    );

    console.log("S3 connection successful!");
    console.log(data);
  } catch (error) {
    console.error("S3 connection failed:", error);
  }
}

export async function folderExists(prefix: string): Promise<boolean> {
  const data = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET!,
      Prefix: prefix,
      MaxKeys: 1,
    })
  );
  return !!data.Contents && data.Contents.length > 0;
}

export async function copyS3Folder(
  sourcePrefix: string,
  destinationPrefix: string,
  continuationToken?: string
): Promise<void> {
  try {
    const listParams: any = {
      Bucket: process.env.S3_BUCKET!,
      Prefix: sourcePrefix,
    };

    if (continuationToken) {
      listParams.ContinuationToken = continuationToken;
    }

    const listedObjects = await s3.send(
      new ListObjectsV2Command(listParams)
    );

    if (!listedObjects.Contents || listedObjects.Contents.length === 0) {
      console.log("No files found");
      return;
    }

    console.log("Files found:", listedObjects.Contents.length);

    await Promise.all(
      listedObjects.Contents.map(async (object) => {
        if (!object.Key) return;

        const destinationKey = object.Key.replace(
          sourcePrefix,
          destinationPrefix
        );

        const copyParams = {
          Bucket: process.env.S3_BUCKET!,
          CopySource: `${process.env.S3_BUCKET}/${object.Key}`,
          Key: destinationKey,
        };

        await s3.send(new CopyObjectCommand(copyParams));

        console.log(`Copied: ${object.Key} → ${destinationKey}`);
      })
    );

    //Handle pagination
    if (listedObjects.IsTruncated && listedObjects.NextContinuationToken) {
      await copyS3Folder(
        sourcePrefix,
        destinationPrefix,
        listedObjects.NextContinuationToken
      );
    }
  } catch (error) {
    console.error("Error copying folder:", error);
  }
}



export const saveToS3 = async (
  key: string,
  filePath: string,
  content: string
): Promise<void> => {
  try {
    const params = {
      Bucket: process.env.S3_BUCKET!,
      Key: `${key}${filePath}`,
      Body: content,
    };

    await s3.send(new PutObjectCommand(params));

    console.log(`File uploaded: ${key}${filePath}`);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

testConnection();