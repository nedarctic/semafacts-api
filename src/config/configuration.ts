export default () => ({
    db_url: process.env.DATABASE_URL!,
    jwt_secret: process.env.JWT_SECRET!,
    node_env: process.env.NODE_ENV || 'development',
    resend_api_key: process.env.RESEND_API_KEY!,
    frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000'
})