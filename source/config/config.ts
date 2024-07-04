import dotenv from 'dotenv';

dotenv.config();

const MYSQL_HOST = process.env.MYSQL_HOST || "DATABASE_HOST_NAME";
const MYSQL_DATABASE = process.env.MYSQL_DATABASE || "YOUR_DATABASE_NAME";
const MYSQL_USER = process.env.MYSQL_USER || "DATABASE_USERNAME";
const MYSQL_PASS = process.env.MYSQL_PASS || "DATABASE_PASSWORD";

const MYSQL = {
    host: MYSQL_HOST,
    database: MYSQL_DATABASE,
    user: MYSQL_USER,
    pass: MYSQL_PASS
};

const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.PORT || 1402;

const SERVER = {
    hostname: SERVER_HOSTNAME,
    port: SERVER_PORT
};

const AWS_ID = process.env.AWS_ID || "AWS_ID_S3_BUCKET";
const AWS_SECRET = process.env.AWS_SECRET || 'AWS_SECRET_S3_BUCKET';
// const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || 'localhost';

const S3BUCKET = {
    aws_Id: AWS_ID,
    aws_secret: AWS_SECRET
};

const BASEREQUST = [
    '/api/roles/getAllRoles',
    '/api/roles/insertRoles',
    '/api/roles/updateRoles',
    '/api/roles/deleteRole',
    '/api/partner/users/login',
    '/api/customer/users/clientVerifyContact',
    '/api/customer/users/checkContactNoExist',
    '/api/admin/users/login',
    '/api/customer/cities/getCityByPincode'
];

const config = {
    mysql: MYSQL,
    s3bucket: S3BUCKET,
    baseRequests: BASEREQUST,
    server: SERVER
};

export default config;
