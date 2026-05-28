export default () => ({
    db_url: process.env.DATABASE_URL!,
    jwt_secret: process.env.JWT_SECRET!,
    node_env: process.env.NODE_ENV || 'development',
})