import * as Joi from 'joi';

export const validationSchema = Joi.object({
    DATABASE_URL: Joi.string().required(),
    RESEND_API_KEY: Joi.string().required(),
    JWT_SECRET: Joi.string().required(),
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    R2_ACCOUNT_ID: Joi.string().required(),
    R2_ACCESS_KEY_ID: Joi.string().required(),
    R2_SECRET_ACCESS_KEY: Joi.string().required(),
    R2_BUCKET_NAME: Joi.string().required(),
    R2_PUBLIC_URL: Joi.string().uri().required(),
    R2_S3_API: Joi.string().uri().required(),
    UPSTASH_REDIS_REST_URL: Joi.string().required(),
    UPSTASH_REDIS_REST_TOKEN: Joi.string().required(),
    SMTP_USERNAME: Joi.string().required(),
    SMTP_PASSWORD: Joi.string().required(),
    SMTP_HOST: Joi.string().required(),
    SMTP_PORT: Joi.number().required(),
    PORT: Joi.number().required(),
})