import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import {Types} from "aws-sdk/clients/s3"

const XAWS = AWSXRay.captureAWS(AWS)

// Implement the fileStogare logic
export class AttachmentUtils {
    private s3: Types;
    private readonly s3BucketName: string = process.env.ATTACHMENT_S3_BUCKET;
    private readonly urlExpiration: number = parseInt(process.env.SIGNED_URL_EXPIRATION);

    constructor() {
        this.s3 = new XAWS.S3({ signatureVersion: 'v4' });
    }

    public async createAttachmentUrl(todoId: string): Promise<string> {
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: this.urlExpiration
        }) as string;
    }
}