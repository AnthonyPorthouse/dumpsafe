import {PutObjectCommand, GetObjectCommand, S3Client} from '@aws-sdk/client-s3'

const s3 = new S3Client({
    region: process.env.DUMPSAFE_AWS_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.DUMPSAFE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.DUMPSAFE_AWS_SECRET_ACCESS_KEY,
    }
})

export async function upload(filename, fileBuffer) {
    const command = new PutObjectCommand({
        Bucket: process.env.DUMPSAFE_AWS_BUCKET_NAME,
        Key: filename,
        Body: fileBuffer,
    })

    await s3.send(command)
}

export async function download(filename) {
    const command = new GetObjectCommand({
        Bucket: process.env.DUMPSAFE_AWS_BUCKET_NAME,
        Key: filename,
    })

    const streamToBuffer = (stream) => {
        return new Promise((resolve, reject) => {
            const buffers = [];

            stream.on('data', chunk => buffers.push(chunk))
            stream.on('end', () => resolve(Buffer.concat(buffers)));
            stream.on('error', err => reject(err))
        })
    }

    const response = await s3.send(command)

    return await streamToBuffer(response.Body)
}
